import type { BlockStatus } from '@/domain/common/types'
import { localDayInstanceRepository, localSyncQueueRepository } from '@/data/local'
import { updateBlockExecutionNote, updateBlockStatus } from '@/domain/routine/mutations'
import type { DayInstance } from '@/domain/routine/types'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type UpdateDayBlockStatusInput = {
  date: string
  blockId: string
  status: BlockStatus
  userId?: string
}

type UpdateDayBlockStatusResult = {
  pendingCount: number
}

export async function updateDayBlockStatus({
  date,
  blockId,
  status,
  userId,
}: UpdateDayBlockStatusInput): Promise<UpdateDayBlockStatusResult> {
  return updateDayInstance({
    date,
    userId,
    updater: (dayInstance) => updateBlockStatus(dayInstance, blockId, status),
  })
}

type UpdateDayBlockNoteInput = {
  date: string
  blockId: string
  executionNote: string
  userId?: string
}

export async function updateDayBlockNote({
  date,
  blockId,
  executionNote,
  userId,
}: UpdateDayBlockNoteInput): Promise<UpdateDayBlockStatusResult> {
  return updateDayInstance({
    date,
    userId,
    updater: (dayInstance) => updateBlockExecutionNote(dayInstance, blockId, executionNote),
  })
}

async function updateDayInstance({
  date,
  userId,
  updater,
}: {
  date: string
  userId?: string
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
  const outstandingItems = await localSyncQueueRepository.listOutstanding()
  const supersededDayItems = outstandingItems.filter(
    (item) => item.actionType === 'upsertDayInstance' && item.entityId === nextDayInstance.id,
  )

  await Promise.all(supersededDayItems.map((item) => localSyncQueueRepository.remove(item.id)))
  await localSyncQueueRepository.enqueue(createSyncQueueItem('upsertDayInstance', nextDayInstance.id, nextDayInstance))
  await markCalendarMirrorsStaleIfEnabled()

  if (userId && isOnline()) {
    const pendingCount = await flushSyncQueue(userId)

    return {
      pendingCount,
    }
  }

  return {
    pendingCount: await localSyncQueueRepository.countOutstanding(),
  }
}

async function getExistingOrGeneratedDayInstance(date: string) {
  const existing = await localDayInstanceRepository.getByDate(date)

  if (existing) {
    return existing
  }

  return (await getOrCreateTodayWorkspace(new Date(`${date}T00:00:00`))).dayInstance
}

function isOnline() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return navigator.onLine
}
