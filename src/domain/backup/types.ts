import type {
  AnalyticsMetadataSnapshot,
  AnalyticsSnapshot,
  ReadinessProjectionSnapshot,
  StreakSnapshot,
  WeeklyMission,
} from '@/domain/analytics/types'
import type { CalendarSyncStateSnapshot } from '@/domain/calendar/types'
import type { HealthIntegrationSnapshot } from '@/domain/health/types'
import type { NotificationStateSnapshot } from '@/domain/notifications/types'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import type { SyncDiagnosticsSnapshot } from '@/domain/sync/types'

export const FORGE_BACKUP_SCHEMA_VERSION = 1

export const backupTriggers = ['manual', 'scheduled'] as const
export type BackupTrigger = (typeof backupTriggers)[number]

export const backupStatuses = ['pending', 'ready', 'failed', 'expired'] as const
export type BackupStatus = (typeof backupStatuses)[number]

export const restoreStatuses = ['pending', 'validated', 'applied', 'partial', 'failed'] as const
export type RestoreStatus = (typeof restoreStatuses)[number]

export const backupHealthStates = ['unknown', 'healthy', 'stale', 'degraded'] as const
export type BackupHealthState = (typeof backupHealthStates)[number]

export const backupPayloadProviders = ['cloudStorage', 'firestoreDocument'] as const
export type BackupPayloadProvider = (typeof backupPayloadProviders)[number]

export const backupRestoreEligibilityStatuses = ['eligible', 'expired', 'unavailable'] as const
export type BackupRestoreEligibilityStatus = (typeof backupRestoreEligibilityStatuses)[number]

export type BackupRetentionPolicy = {
  keepDaily: number
  keepWeekly: number
  keepManual: number
}

export type BackupPayloadPointer = {
  provider: BackupPayloadProvider
  location: string
  bucket?: string
  contentType: 'application/json'
}

export type BackupRestoreEligibility = {
  status: BackupRestoreEligibilityStatus
  reason?: string
  checkedAt: string
}

export type BackupSnapshotRecord = {
  id: string
  schemaVersion: number
  trigger: BackupTrigger
  status: BackupStatus
  createdAt: string
  completedAt?: string
  retentionExpiresAt?: string
  checksum?: string
  byteSize?: number
  sourceRecordCount: number
  payloadPointer?: BackupPayloadPointer | null
  restoreEligibility?: BackupRestoreEligibility | null
}

export type BackupOperationsSnapshot = {
  id: 'default'
  healthState: BackupHealthState
  retentionPolicy: BackupRetentionPolicy
  scheduledCadenceHours: number
  latestBackupId?: string
  latestSuccessfulBackupAt?: string
  latestFailureAt?: string
  latestFailureMessage?: string
  staleAfterHours: number
  pendingDeletionCount: number
  updatedAt: string
}

export type RestoreCounts = {
  user: number
  settings: number
  dayInstances: number
  analyticsSnapshots: number
  projections: number
  streaks: number
  missions: number
  notificationState: number
  calendarState: number
  healthState: number
}

export type RestoreJobRecord = {
  id: string
  schemaVersion: number
  status: RestoreStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
  summary: string
  warnings: string[]
  appliedCounts: RestoreCounts
}

export type ForgeUserBackupRecord = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type ForgeExportPayload = {
  id: string
  schemaVersion: number
  exportedAt: string
  userId: string
  user: ForgeUserBackupRecord | null
  settings: UserSettings | null
  dayInstances: DayInstance[]
  analytics: {
    snapshots: AnalyticsSnapshot[]
    metadata: AnalyticsMetadataSnapshot | null
    projection: ReadinessProjectionSnapshot | null
    streaks: StreakSnapshot | null
    missions: WeeklyMission[]
  }
  integrations: {
    calendar: CalendarSyncStateSnapshot | null
    notificationState: NotificationStateSnapshot | null
    syncDiagnostics: SyncDiagnosticsSnapshot | null
    health: HealthIntegrationSnapshot | null
  }
}

export function createDefaultBackupRetentionPolicy(): BackupRetentionPolicy {
  return {
    keepDaily: 7,
    keepWeekly: 8,
    keepManual: 20,
  }
}

export function createDefaultBackupOperationsSnapshot(): BackupOperationsSnapshot {
  return {
    id: 'default',
    healthState: 'unknown',
    retentionPolicy: createDefaultBackupRetentionPolicy(),
    scheduledCadenceHours: 24,
    staleAfterHours: 36,
    pendingDeletionCount: 0,
    updatedAt: new Date().toISOString(),
  }
}

export function createEmptyRestoreCounts(): RestoreCounts {
  return {
    user: 0,
    settings: 0,
    dayInstances: 0,
    analyticsSnapshots: 0,
    projections: 0,
    streaks: 0,
    missions: 0,
    notificationState: 0,
    calendarState: 0,
    healthState: 0,
  }
}
