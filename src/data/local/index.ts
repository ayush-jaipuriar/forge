import { LocalDayInstanceRepository } from '@/data/local/localDayInstanceRepository'
import { LocalNotificationLogRepository } from '@/data/local/localNotificationLogRepository'
import { LocalNotificationStateRepository } from '@/data/local/localNotificationStateRepository'
import { LocalSettingsRepository } from '@/data/local/localSettingsRepository'
import { LocalSyncConflictRepository } from '@/data/local/localSyncConflictRepository'
import { LocalSyncDiagnosticsRepository } from '@/data/local/localSyncDiagnosticsRepository'
import { LocalSyncQueueRepository } from '@/data/local/localSyncQueueRepository'

export const localDayInstanceRepository = new LocalDayInstanceRepository()
export const localNotificationStateRepository = new LocalNotificationStateRepository()
export const localNotificationLogRepository = new LocalNotificationLogRepository()
export const localSettingsRepository = new LocalSettingsRepository()
export const localSyncDiagnosticsRepository = new LocalSyncDiagnosticsRepository()
export const localSyncConflictRepository = new LocalSyncConflictRepository()
export const localSyncQueueRepository = new LocalSyncQueueRepository()
