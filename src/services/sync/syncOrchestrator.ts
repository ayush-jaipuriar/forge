import { FirestoreDayInstanceRepository } from '@/data/firebase/firestoreDayInstanceRepository'
import { FirestoreSettingsRepository } from '@/data/firebase/firestoreSettingsRepository'
import { localSyncQueueRepository } from '@/data/local'
import type { AnySyncQueueItem } from '@/domain/execution/sync'
import { reportMonitoringError } from '@/services/monitoring/monitoringService'

const dayInstanceRepository = new FirestoreDayInstanceRepository()
const settingsRepository = new FirestoreSettingsRepository()

export async function flushSyncQueue(userId: string) {
  const replayableItems = await localSyncQueueRepository.listReplayable()

  for (const item of replayableItems) {
    await localSyncQueueRepository.markRetrying(item.id)

    try {
      await replayQueueItem(userId, item)
      await localSyncQueueRepository.remove(item.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown sync error.'
      reportMonitoringError({
        domain: 'sync',
        action: 'flush-sync-queue-item',
        message: 'A queued local-first write failed during Firestore replay.',
        error,
        metadata: {
          queueItemId: item.id,
          actionType: item.actionType,
          userId,
        },
      })
      await localSyncQueueRepository.markFailed(item.id, message)
    }
  }

  return localSyncQueueRepository.countOutstanding()
}

async function replayQueueItem(userId: string, item: AnySyncQueueItem) {
  switch (item.actionType) {
    case 'upsertDayInstance':
      await dayInstanceRepository.upsert(userId, item.payload)
      return
    case 'upsertSettings':
      await settingsRepository.upsert(userId, item.payload)
      return
    default:
      throw new Error('Unsupported sync action.')
  }
}
