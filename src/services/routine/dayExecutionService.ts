import type { BlockStatus } from '@/domain/common/types'
import { localDayInstanceRepository, localSyncQueueRepository } from '@/data/local'
import { updateBlockExecutionNote, updateBlockStatus } from '@/domain/routine/mutations'
import type { DayInstance } from '@/domain/routine/types'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'

type UpdateDayBlockStatusInput = {
  date: string
  blockId: string
  status: BlockStatus
  userId?: string
  syncMode?: SyncWriteMode
}

type UpdateDayBlockStatusResult = {
  pendingCount: number
}

export async function updateDayBlockStatus({
  date,
  blockId,
  status,
  userId,
  syncMode,
}: UpdateDayBlockStatusInput): Promise<UpdateDayBlockStatusResult> {
  return updateDayInstance({
    date,
    userId,
    syncMode,
    updater: (dayInstance) => updateBlockStatus(dayInstance, blockId, status),
  })
}

type UpdateDayBlockNoteInput = {
  date: string
  blockId: string
  executionNote: string
  userId?: string
  syncMode?: SyncWriteMode
}

export async function updateDayBlockNote({
  date,
  blockId,
  executionNote,
  userId,
  syncMode,
}: UpdateDayBlockNoteInput): Promise<UpdateDayBlockStatusResult> {
  return updateDayInstance({
    date,
    userId,
    syncMode,
    updater: (dayInstance) => updateBlockExecutionNote(dayInstance, blockId, executionNote),
  })
}

async function updateDayInstance({
  date,
  userId,
  syncMode,
  updater,
}: {
  date: string
  userId?: string
  syncMode?: SyncWriteMode
  updater: (dayInstance: DayInstance) => DayInstance
}): Promise<UpdateDayBlockStatusResult> {
  const dayInstance = await getExistingOrGeneratedDayInstance(date)
  const nextDayInstance = updater(dayInstance)

  if (nextDayInstance === dayInstance) {
    return {
      pendingCount: await localSyncQueueRepository.countOutstanding(),
    }
  }

  await localDayInstanceRepository.upsert(nextDayInstance)
  await markCalendarMirrorsStaleIfEnabled()
  return persistSyncableChange({
    actionType: 'upsertDayInstance',
    entityId: nextDayInstance.id,
    payload: nextDayInstance,
    userId,
    mode: syncMode,
  })
}

async function getExistingOrGeneratedDayInstance(date: string) {
  const existing = await localDayInstanceRepository.getByDate(date)

  if (existing) {
    return existing
  }

  return (await getOrCreateTodayWorkspace(new Date(`${date}T00:00:00`))).dayInstance
}
