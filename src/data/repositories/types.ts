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
import type { AnySyncQueueItem } from '@/domain/execution/sync'
import type { WorkoutScheduleEntry } from '@/domain/physical/types'
import type { PrepTopicSeed } from '@/domain/prep/types'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'

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

export interface SyncQueueRepository {
  enqueue(item: AnySyncQueueItem): Promise<void>
  listOutstanding(): Promise<AnySyncQueueItem[]>
  listReplayable(): Promise<AnySyncQueueItem[]>
  remove(id: string): Promise<void>
  countOutstanding(): Promise<number>
  markRetrying(id: string): Promise<void>
  markFailed(id: string, message: string): Promise<void>
}
