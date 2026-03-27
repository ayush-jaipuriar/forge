import type { PrepTopicProgressSnapshot } from '@/domain/prep/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type UpdatePrepTopicProgressInput = {
  topicId: string
  patch: Partial<PrepTopicProgressSnapshot>
  userId?: string
}

type UpdatePrepTopicProgressResult = {
  pendingCount: number
}

export async function updatePrepTopicProgress({
  topicId,
  patch,
  userId,
}: UpdatePrepTopicProgressInput): Promise<UpdatePrepTopicProgressResult> {
  const currentSettings = await localSettingsRepository.getDefault()
  const currentProgress = currentSettings.prepTopicProgress[topicId] ?? {
    revisionCount: 0,
    solvedCount: 0,
    exposureCount: 0,
    hoursSpent: 0,
  }
  const nextProgress = {
    ...currentProgress,
    ...patch,
    revisionCount: Math.max(0, patch.revisionCount ?? currentProgress.revisionCount),
    solvedCount: Math.max(0, patch.solvedCount ?? currentProgress.solvedCount),
    exposureCount: Math.max(0, patch.exposureCount ?? currentProgress.exposureCount),
    hoursSpent: Math.max(0, Number((patch.hoursSpent ?? currentProgress.hoursSpent).toFixed(1))),
  }

  if (JSON.stringify(currentProgress) === JSON.stringify(nextProgress)) {
    return {
      pendingCount: await localSyncQueueRepository.countOutstanding(),
    }
  }

  const nextSettings = {
    ...currentSettings,
    prepTopicProgress: {
      ...currentSettings.prepTopicProgress,
      [topicId]: nextProgress,
    },
    updatedAt: new Date().toISOString(),
  }

  await localSettingsRepository.upsert(nextSettings)
  const outstandingItems = await localSyncQueueRepository.listOutstanding()
  const supersededSettingsItems = outstandingItems.filter(
    (item) => item.actionType === 'upsertSettings' && item.entityId === nextSettings.id,
  )

  await Promise.all(supersededSettingsItems.map((item) => localSyncQueueRepository.remove(item.id)))
  await localSyncQueueRepository.enqueue(createSyncQueueItem('upsertSettings', nextSettings.id, nextSettings))

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
