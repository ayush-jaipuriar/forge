import { createDefaultSyncDiagnosticsSnapshot, type SyncConflictRecord, type SyncDiagnosticsSnapshot } from '@/domain/sync/types'
import type { AnySyncQueueItem } from '@/domain/execution/sync'
import type { SyncStatus } from '@/domain/common/types'

const DEFAULT_STALE_THRESHOLD_MINUTES = 30

type AssessSyncHealthInput = {
  queueItems: AnySyncQueueItem[]
  conflictRecords?: SyncConflictRecord[]
  previousDiagnostics?: SyncDiagnosticsSnapshot | null
  isOnline: boolean
  isAuthenticated: boolean
  isFlushing: boolean
  now?: Date
}

type SyncHealthAssessment = {
  syncStatus: SyncStatus
  diagnostics: SyncDiagnosticsSnapshot
}

export function assessSyncHealth({
  queueItems,
  conflictRecords = [],
  previousDiagnostics,
  isOnline,
  isAuthenticated,
  isFlushing,
  now = new Date(),
}: AssessSyncHealthInput): SyncHealthAssessment {
  const base = previousDiagnostics ?? createDefaultSyncDiagnosticsSnapshot()
  const replayableCount = queueItems.filter((item) => item.status === 'pending' || item.status === 'retrying' || item.status === 'failed').length
  const failedCount = queueItems.filter((item) => item.status === 'failed').length
  const staleEntityCount = queueItems.filter((item) => {
    const ageMs = now.getTime() - new Date(item.updatedAt).getTime()
    return ageMs >= base.staleThresholdMinutes * 60 * 1000
  }).length
  const conflictedCount = conflictRecords.filter((record) => record.status === 'open').length

  let syncStatus: SyncStatus = 'stable'
  let healthState: SyncDiagnosticsSnapshot['healthState'] = 'healthy'

  if (conflictedCount > 0) {
    syncStatus = 'conflicted'
    healthState = 'conflicted'
  } else if (failedCount > 0) {
    syncStatus = 'degraded'
    healthState = 'degraded'
  } else if (staleEntityCount > 0) {
    syncStatus = 'stale'
    healthState = 'stale'
  } else if (replayableCount > 0 && isFlushing && isOnline && isAuthenticated) {
    syncStatus = 'syncing'
    healthState = 'syncing'
  } else if (replayableCount > 0) {
    syncStatus = 'queued'
    healthState = 'queued'
  }

  return {
    syncStatus,
    diagnostics: {
      ...base,
      healthState,
      outstandingCount: queueItems.length,
      replayableCount,
      failedCount,
      conflictedCount,
      staleEntityCount,
      repairState: conflictedCount > 0 ? 'pending' : base.repairState === 'repairing' ? 'repairing' : 'none',
      lastSuccessfulSyncAt:
        replayableCount === 0 && queueItems.length === 0 && isOnline && isAuthenticated
          ? now.toISOString()
          : base.lastSuccessfulSyncAt,
      lastFailedSyncAt: failedCount > 0 ? now.toISOString() : base.lastFailedSyncAt,
      updatedAt: now.toISOString(),
    },
  }
}

export function getSyncMonitoringSeverity(syncStatus: SyncStatus): 'info' | 'warning' | 'error' | null {
  if (syncStatus === 'stable' || syncStatus === 'syncing') {
    return null
  }

  if (syncStatus === 'queued' || syncStatus === 'stale') {
    return 'warning'
  }

  return 'error'
}

export function createInitialSyncDiagnosticsSnapshot(): SyncDiagnosticsSnapshot {
  return {
    ...createDefaultSyncDiagnosticsSnapshot(),
    staleThresholdMinutes: DEFAULT_STALE_THRESHOLD_MINUTES,
  }
}
