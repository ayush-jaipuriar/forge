import type { AnySyncQueueItem } from '@/domain/execution/sync'
import type { WorkoutScheduleEntry } from '@/domain/physical/types'
import type { PrepTopicSeed } from '@/domain/prep/types'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'

export interface DayInstanceRepository {
  getByDate(date: string): Promise<DayInstance | null>
  getByDates(dates: string[]): Promise<DayInstance[]>
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

export interface SyncQueueRepository {
  enqueue(item: AnySyncQueueItem): Promise<void>
  listOutstanding(): Promise<AnySyncQueueItem[]>
  listReplayable(): Promise<AnySyncQueueItem[]>
  remove(id: string): Promise<void>
  countOutstanding(): Promise<number>
  markRetrying(id: string): Promise<void>
  markFailed(id: string, message: string): Promise<void>
}
