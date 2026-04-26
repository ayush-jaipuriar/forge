import type { BlockStatus } from '@/domain/common/types'
import { localDayInstanceRepository, localSyncQueueRepository } from '@/data/local'
import { FirestoreDayInstanceRepository } from '@/data/firebase/firestoreDayInstanceRepository'
import { updateBlockExecutionNote, updateBlockStatus } from '@/domain/routine/mutations'
import type { DayInstance } from '@/domain/routine/types'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'
import { assertAuthenticatedCloudWriteAvailable, isAuthenticatedCloudMode } from '@/services/sync/sourceOfTruth'

const firestoreDayInstanceRepository = new FirestoreDayInstanceRepository()

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

  if (isAuthenticatedCloudMode(userId, syncMode)) {
    if (!userId) {
      throw new Error('Forge needs an authenticated user before saving cloud day state.')
    }

    assertAuthenticatedCloudWriteAvailable(userId, syncMode)
    await firestoreDayInstanceRepository.upsert(userId, nextDayInstance)
    await localDayInstanceRepository.upsert(nextDayInstance)
    await markCalendarMirrorsStaleIfEnabled()

    return {
      pendingCount: 0,
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
