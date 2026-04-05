import { localSyncQueueRepository } from '@/data/local'
import type { AnySyncQueueItem, SyncActionType, SyncPayloadMap } from '@/domain/execution/sync'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

export type SyncWriteMode = 'cloud' | 'localOnly'

type PersistSyncableChangeInput<TAction extends SyncActionType> = {
  actionType: TAction
  entityId: string
  payload: SyncPayloadMap[TAction]
  userId?: string
  mode?: SyncWriteMode
}

export async function persistSyncableChange<TAction extends SyncActionType>({
  actionType,
  entityId,
  payload,
  userId,
  mode = 'cloud',
}: PersistSyncableChangeInput<TAction>) {
  if (mode === 'localOnly') {
    return {
      pendingCount: 0,
    }
  }

  const outstandingItems = await localSyncQueueRepository.listOutstanding()
  const supersededItems = outstandingItems.filter(
    (item) => item.actionType === actionType && item.entityId === entityId,
  )

  await Promise.all(supersededItems.map((item) => localSyncQueueRepository.remove(item.id)))
  await localSyncQueueRepository.enqueue(createSyncQueueItem(actionType, entityId, payload) as AnySyncQueueItem)

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
