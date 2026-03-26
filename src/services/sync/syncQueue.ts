import type { SyncActionType, SyncPayloadMap, SyncQueueItem } from '@/domain/execution/sync'

export function createSyncQueueItem<TAction extends SyncActionType>(
  actionType: TAction,
  entityId: string,
  payload: SyncPayloadMap[TAction],
): SyncQueueItem<TAction> {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    actionType,
    entityId,
    status: 'pending',
    payload,
    attemptCount: 0,
    queuedAt: timestamp,
    updatedAt: timestamp,
    lastError: null,
  }
}
