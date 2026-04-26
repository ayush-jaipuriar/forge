import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { localSyncConflictRepository, localSyncDiagnosticsRepository, localSyncQueueRepository } from '@/data/local'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { reportMonitoringError, reportMonitoringEvent } from '@/services/monitoring/monitoringService'
import { assessSyncHealth, createInitialSyncDiagnosticsSnapshot, getSyncMonitoringSeverity } from '@/services/sync/syncHealthService'
import { discardLegacyAuthenticatedSyncQueue, hydrateCloudSharedState, subscribeToCloudSharedState } from '@/services/sync/cloudSyncService'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

export function SyncProvider({ children }: PropsWithChildren) {
  const { status, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  useEffect(() => {
    if (status !== 'authenticated' || !user) {
      return
    }

    const userId = user.uid
    let active = true
    let unsubscribe = () => {}

    async function hydrateAndSubscribe() {
      try {
        if (navigator.onLine) {
          await hydrateCloudSharedState(userId)
        } else {
          await discardLegacyAuthenticatedSyncQueue()
        }

        if (!active) {
          return
        }

        unsubscribe = subscribeToCloudSharedState(userId)
      } catch (error) {
        reportMonitoringError({
          domain: 'sync',
          action: 'hydrate-cloud-shared-state',
          message: 'Forge could not hydrate shared cloud state into the local workspace.',
          error,
          metadata: {
            userId,
          },
        })
      }
    }

    function handleOnline() {
      void hydrateCloudSharedState(userId).catch((error) => {
        reportMonitoringError({
          domain: 'sync',
          action: 'refresh-cloud-shared-state',
          message: 'Forge could not refresh shared cloud state after connectivity returned.',
          error,
          metadata: {
            userId,
          },
        })
      })
    }

    void hydrateAndSubscribe()
    window.addEventListener('online', handleOnline)

    return () => {
      active = false
      unsubscribe()
      window.removeEventListener('online', handleOnline)
    }
  }, [status, user])

  useEffect(() => {
    if (status === 'authenticated' && user) {
      const updateAuthenticatedOnlineOnlyStatus = () => {
        setSyncStatus(navigator.onLine ? 'stable' : 'stale')
      }

      updateAuthenticatedOnlineOnlyStatus()
      window.addEventListener('online', updateAuthenticatedOnlineOnlyStatus)
      window.addEventListener('offline', updateAuthenticatedOnlineOnlyStatus)

      return () => {
        window.removeEventListener('online', updateAuthenticatedOnlineOnlyStatus)
        window.removeEventListener('offline', updateAuthenticatedOnlineOnlyStatus)
      }
    }

    let mounted = true

    async function syncNow() {
      const [queueItems, previousDiagnostics, conflictRecords] = await Promise.all([
        localSyncQueueRepository.listOutstanding(),
        localSyncDiagnosticsRepository.getDefault(),
        localSyncConflictRepository.listOpen(),
      ])

      const initialAssessment = assessSyncHealth({
        queueItems,
        conflictRecords,
        previousDiagnostics: previousDiagnostics ?? createInitialSyncDiagnosticsSnapshot(),
        isOnline: navigator.onLine,
        isAuthenticated: status === 'authenticated' && Boolean(user),
        isFlushing: false,
      })

      if (!mounted) {
        return
      }

      await localSyncDiagnosticsRepository.upsert(initialAssessment.diagnostics)
      setSyncStatus(initialAssessment.syncStatus)

      const initialSeverity = getSyncMonitoringSeverity(initialAssessment.syncStatus)
      if (initialSeverity) {
        reportMonitoringEvent({
          level: initialSeverity,
          domain: 'sync',
          action: 'sync-health-evaluated',
          message: 'Sync health is no longer fully aligned.',
          metadata: {
            syncStatus: initialAssessment.syncStatus,
            outstandingCount: initialAssessment.diagnostics.outstandingCount,
            failedCount: initialAssessment.diagnostics.failedCount,
            conflictedCount: initialAssessment.diagnostics.conflictedCount,
            staleEntityCount: initialAssessment.diagnostics.staleEntityCount,
          },
        })
      }

      if (!navigator.onLine) {
        return
      }

      if (queueItems.length === 0 && conflictRecords.length === 0) {
        return
      }

      if (status !== 'authenticated' || !user || initialAssessment.syncStatus === 'conflicted' || initialAssessment.syncStatus === 'degraded') {
        return
      }

      setSyncStatus('syncing')
      const remaining = await flushSyncQueue(user.uid)

      const [nextQueueItems, nextConflicts, nextDiagnostics] = await Promise.all([
        localSyncQueueRepository.listOutstanding(),
        localSyncConflictRepository.listOpen(),
        localSyncDiagnosticsRepository.getDefault(),
      ])

      const finalAssessment = assessSyncHealth({
        queueItems: nextQueueItems,
        conflictRecords: nextConflicts,
        previousDiagnostics: nextDiagnostics ?? initialAssessment.diagnostics,
        isOnline: navigator.onLine,
        isAuthenticated: true,
        isFlushing: false,
      })

      if (!mounted) {
        return
      }

      await localSyncDiagnosticsRepository.upsert({
        ...finalAssessment.diagnostics,
        lastSuccessfulSyncAt: remaining === 0 ? new Date().toISOString() : finalAssessment.diagnostics.lastSuccessfulSyncAt,
      })
      setSyncStatus(finalAssessment.syncStatus)
    }

    function handleConnectivityChange() {
      void syncNow()
    }

    void syncNow()
    window.addEventListener('online', handleConnectivityChange)
    window.addEventListener('offline', handleConnectivityChange)

    return () => {
      mounted = false
      window.removeEventListener('online', handleConnectivityChange)
      window.removeEventListener('offline', handleConnectivityChange)
    }
  }, [setSyncStatus, status, user])

  return children
}
