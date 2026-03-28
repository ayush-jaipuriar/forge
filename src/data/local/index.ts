import { LocalDayInstanceRepository } from '@/data/local/localDayInstanceRepository'
import { LocalSettingsRepository } from '@/data/local/localSettingsRepository'
import { LocalSyncConflictRepository } from '@/data/local/localSyncConflictRepository'
import { LocalSyncDiagnosticsRepository } from '@/data/local/localSyncDiagnosticsRepository'
import { LocalSyncQueueRepository } from '@/data/local/localSyncQueueRepository'

export const localDayInstanceRepository = new LocalDayInstanceRepository()
export const localSettingsRepository = new LocalSettingsRepository()
export const localSyncDiagnosticsRepository = new LocalSyncDiagnosticsRepository()
export const localSyncConflictRepository = new LocalSyncConflictRepository()
export const localSyncQueueRepository = new LocalSyncQueueRepository()
