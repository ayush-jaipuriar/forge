import type {
  AnalyticsInsight,
  AnalyticsMetadataSnapshot,
  AnalyticsRollingWindowKey,
  AnalyticsSnapshot,
  DailyAnalyticsSnapshot,
  ReadinessProjectionSnapshot,
  RollingAnalyticsSnapshot,
  StreakSnapshot,
  WeeklyAnalyticsSnapshot,
  WeeklyMission,
} from '@/domain/analytics/types'
import type {
  BackupOperationsSnapshot,
  BackupSnapshotRecord,
  ForgeExportPayload,
  RestoreJobRecord,
} from '@/domain/backup/types'
import type {
  CalendarMirrorRecord,
  CalendarSyncStateSnapshot,
  ExternalCalendarEventCacheRecord,
} from '@/domain/calendar/types'
import type { AnySyncQueueItem } from '@/domain/execution/sync'
import type { HealthIntegrationSnapshot } from '@/domain/health/types'
import type { NotificationLogRecord, NotificationRunRecord, NotificationStateSnapshot } from '@/domain/notifications/types'
import type { WorkoutScheduleEntry } from '@/domain/physical/types'
import type { PrepTopicSeed } from '@/domain/prep/types'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import type { SyncConflictRecord, SyncDiagnosticsSnapshot } from '@/domain/sync/types'

export interface DayInstanceRepository {
  getByDate(date: string): Promise<DayInstance | null>
  getByDates(dates: string[]): Promise<DayInstance[]>
  listAll(): Promise<DayInstance[]>
  upsert(instance: DayInstance): Promise<void>
  upsertMany(instances: DayInstance[]): Promise<void>
}

export interface SettingsRepository {
  getDefault(): Promise<UserSettings | null>
  upsert(settings: UserSettings): Promise<void>
}

export interface PrepProgressRepository {
  getAll(): Promise<PrepTopicSeed[]>
}

export interface WorkoutLogRepository {
  getSchedule(): Promise<WorkoutScheduleEntry[]>
}

export interface SleepLogRepository {
  getRecent(): Promise<unknown[]>
}

export interface ScoreRepository {
  getRecent(): Promise<unknown[]>
}

export interface AnalyticsSnapshotRepository {
  getDaily(date: string): Promise<DailyAnalyticsSnapshot | null>
  getWeekly(weekKey: string): Promise<WeeklyAnalyticsSnapshot | null>
  getRolling(windowKey: AnalyticsRollingWindowKey): Promise<RollingAnalyticsSnapshot | null>
  upsert(snapshot: AnalyticsSnapshot): Promise<void>
}

export interface ProjectionRepository {
  getDefault(): Promise<ReadinessProjectionSnapshot | null>
  upsert(snapshot: ReadinessProjectionSnapshot): Promise<void>
}

export interface InsightRepository {
  listRecent(limit?: number): Promise<AnalyticsInsight[]>
  upsertMany(insights: AnalyticsInsight[]): Promise<void>
}

export interface StreakRepository {
  getDefault(): Promise<StreakSnapshot | null>
  upsert(snapshot: StreakSnapshot): Promise<void>
}

export interface MissionRepository {
  listForWeek(weekKey: string): Promise<WeeklyMission[]>
  upsertMany(missions: WeeklyMission[]): Promise<void>
}

export interface AnalyticsMetadataRepository {
  getDefault(): Promise<AnalyticsMetadataSnapshot | null>
  upsert(snapshot: AnalyticsMetadataSnapshot): Promise<void>
}

export interface NotificationStateRepository {
  getDefault(): Promise<NotificationStateSnapshot | null>
  upsert(snapshot: NotificationStateSnapshot): Promise<void>
}

export interface NotificationLogRepository {
  listRecent(limit?: number): Promise<NotificationLogRecord[]>
  upsert(record: NotificationLogRecord): Promise<void>
}

export interface NotificationRunRepository {
  listRecent(limit?: number): Promise<NotificationRunRecord[]>
  upsert(record: NotificationRunRecord): Promise<void>
}

export interface SyncDiagnosticsRepository {
  getDefault(): Promise<SyncDiagnosticsSnapshot | null>
  upsert(snapshot: SyncDiagnosticsSnapshot): Promise<void>
}

export interface SyncConflictRepository {
  listOpen(): Promise<SyncConflictRecord[]>
  upsert(record: SyncConflictRecord): Promise<void>
}

export interface BackupRepository {
  listRecent(limit?: number): Promise<BackupSnapshotRecord[]>
  upsert(snapshot: BackupSnapshotRecord): Promise<void>
}

export interface BackupOperationsRepository {
  getDefault(): Promise<BackupOperationsSnapshot | null>
  upsert(snapshot: BackupOperationsSnapshot): Promise<void>
}

export interface RestoreJobRepository {
  listRecent(limit?: number): Promise<RestoreJobRecord[]>
  upsert(job: RestoreJobRecord): Promise<void>
}

export interface ExportPayloadRepository {
  save(payload: ForgeExportPayload): Promise<void>
}

export interface RemoteBackupRestoreRepository {
  listRecent(userId: string, limit?: number): Promise<BackupSnapshotRecord[]>
  getPayload(userId: string, backup: BackupSnapshotRecord): Promise<ForgeExportPayload>
}

export interface CalendarStateRepository {
  getDefault(): Promise<CalendarSyncStateSnapshot | null>
  upsert(snapshot: CalendarSyncStateSnapshot): Promise<void>
}

export interface CalendarMirrorRepository {
  listForDate(date: string): Promise<CalendarMirrorRecord[]>
  upsert(record: CalendarMirrorRecord): Promise<void>
  remove(id: string): Promise<void>
}

export interface ExternalCalendarEventRepository {
  listForDate(date: string): Promise<ExternalCalendarEventCacheRecord[]>
  upsertMany(records: ExternalCalendarEventCacheRecord[]): Promise<void>
}

export interface HealthIntegrationRepository {
  getDefault(): Promise<HealthIntegrationSnapshot | null>
  upsert(snapshot: HealthIntegrationSnapshot): Promise<void>
}

export interface SyncQueueRepository {
  enqueue(item: AnySyncQueueItem): Promise<void>
  listOutstanding(): Promise<AnySyncQueueItem[]>
  listReplayable(): Promise<AnySyncQueueItem[]>
  remove(id: string): Promise<void>
  clearAll(): Promise<void>
  countOutstanding(): Promise<number>
  markRetrying(id: string): Promise<void>
  markFailed(id: string, message: string): Promise<void>
}
