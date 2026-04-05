import type { PrepTopicProgressSnapshot } from '@/domain/prep/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'

type UpdatePrepTopicProgressInput = {
  topicId: string
  patch: Partial<PrepTopicProgressSnapshot>
  userId?: string
  syncMode?: SyncWriteMode
}

type UpdatePrepTopicProgressResult = {
  pendingCount: number
}

export async function updatePrepTopicProgress({
  topicId,
  patch,
  userId,
  syncMode,
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
  return persistSyncableChange({
    actionType: 'upsertSettings',
    entityId: nextSettings.id,
    payload: nextSettings,
    userId,
    mode: syncMode,
  })
}
