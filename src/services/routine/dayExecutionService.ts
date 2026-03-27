import type { BlockStatus } from '@/domain/common/types'
import { localDayInstanceRepository, localSyncQueueRepository } from '@/data/local'
import { updateBlockStatus } from '@/domain/routine/mutations'
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
  let dayInstance = await localDayInstanceRepository.getByDate(date)

  if (!dayInstance) {
    dayInstance = (await getOrCreateTodayWorkspace(new Date(`${date}T00:00:00`))).dayInstance
  }

  const nextDayInstance = updateBlockStatus(dayInstance, blockId, status)

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

function isOnline() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return navigator.onLine
}
