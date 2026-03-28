export const syncEntityKinds = [
  'settings',
  'dayInstance',
  'notificationState',
  'backup',
  'calendar',
  'health',
] as const
export type SyncEntityKind = (typeof syncEntityKinds)[number]

export const syncHealthStates = ['healthy', 'queued', 'syncing', 'stale', 'conflicted', 'degraded'] as const
export type SyncHealthState = (typeof syncHealthStates)[number]

export const syncRepairStates = ['none', 'pending', 'repairing', 'repaired'] as const
export type SyncRepairState = (typeof syncRepairStates)[number]

export const syncConflictStatuses = ['open', 'ignored', 'resolved'] as const
export type SyncConflictStatus = (typeof syncConflictStatuses)[number]

export const syncResolutionStrategies = [
  'latest-write-wins',
  'replace-snapshot',
  'merge-safe-map',
  'manual-review',
] as const
export type SyncResolutionStrategy = (typeof syncResolutionStrategies)[number]

export type SyncDiagnosticsSnapshot = {
  id: 'default'
  healthState: SyncHealthState
  outstandingCount: number
  replayableCount: number
  failedCount: number
  conflictedCount: number
  staleEntityCount: number
  staleThresholdMinutes: number
  repairState: SyncRepairState
  lastSuccessfulSyncAt?: string
  lastFailedSyncAt?: string
  updatedAt: string
}

export type SyncConflictRecord = {
  id: string
  entityKind: SyncEntityKind
  entityId: string
  status: SyncConflictStatus
  strategy: SyncResolutionStrategy
  summary: string
  detectedAt: string
  localUpdatedAt?: string
  remoteUpdatedAt?: string
  localVersionTag?: string
  remoteVersionTag?: string
}

export function createDefaultSyncDiagnosticsSnapshot(): SyncDiagnosticsSnapshot {
  return {
    id: 'default',
    healthState: 'healthy',
    outstandingCount: 0,
    replayableCount: 0,
    failedCount: 0,
    conflictedCount: 0,
    staleEntityCount: 0,
    staleThresholdMinutes: 30,
    repairState: 'none',
    updatedAt: new Date().toISOString(),
  }
}
