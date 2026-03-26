import { LocalDayInstanceRepository } from '@/data/local/localDayInstanceRepository'
import { LocalSettingsRepository } from '@/data/local/localSettingsRepository'
import { LocalSyncQueueRepository } from '@/data/local/localSyncQueueRepository'

export const localDayInstanceRepository = new LocalDayInstanceRepository()
export const localSettingsRepository = new LocalSettingsRepository()
export const localSyncQueueRepository = new LocalSyncQueueRepository()
