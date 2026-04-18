import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import type { SettingsSyncPatch } from '@/domain/settings/sync'

export type SyncActionType = 'upsertDayInstance' | 'upsertSettings' | 'patchSettings'

export type SyncQueueStatus = 'pending' | 'retrying' | 'failed'

export type SyncPayloadMap = {
  upsertDayInstance: DayInstance
  upsertSettings: UserSettings
  patchSettings: SettingsSyncPatch
}

export type SyncQueueItem<TAction extends SyncActionType = SyncActionType> = {
  id: string
  actionType: TAction
  entityId: string
  status: SyncQueueStatus
  payload: SyncPayloadMap[TAction]
  attemptCount: number
  queuedAt: string
  updatedAt: string
  lastError: string | null
}

export type AnySyncQueueItem = {
  [TAction in SyncActionType]: SyncQueueItem<TAction>
}[SyncActionType]
