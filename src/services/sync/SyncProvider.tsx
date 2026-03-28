import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { localSyncConflictRepository, localSyncDiagnosticsRepository, localSyncQueueRepository } from '@/data/local'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { reportMonitoringEvent } from '@/services/monitoring/monitoringService'
import { assessSyncHealth, createInitialSyncDiagnosticsSnapshot, getSyncMonitoringSeverity } from '@/services/sync/syncHealthService'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

export function SyncProvider({ children }: PropsWithChildren) {
  const { status, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  useEffect(() => {
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
