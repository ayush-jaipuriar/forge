import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { localSyncQueueRepository } from '@/data/local'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

export function SyncProvider({ children }: PropsWithChildren) {
  const { status, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  useEffect(() => {
    let mounted = true

    async function syncNow() {
      const outstandingCount = await localSyncQueueRepository.countOutstanding()

      if (!mounted) {
        return
      }

      if (!navigator.onLine) {
        setSyncStatus(outstandingCount > 0 ? 'queued' : 'stable')
        return
      }

      if (outstandingCount === 0) {
        setSyncStatus('stable')
        return
      }

      if (status !== 'authenticated' || !user) {
        setSyncStatus('queued')
        return
      }

      setSyncStatus('syncing')
      const remaining = await flushSyncQueue(user.uid)

      if (!mounted) {
        return
      }

      setSyncStatus(remaining > 0 ? 'queued' : 'stable')
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
