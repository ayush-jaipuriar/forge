import type { WorkoutLogEntry } from '@/domain/physical/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type UpdateWorkoutLogInput = {
  date: string
  patch: WorkoutLogEntry
  userId?: string
}

type UpdateWorkoutLogResult = {
  pendingCount: number
}

export async function updateWorkoutLog({
  date,
  patch,
  userId,
}: UpdateWorkoutLogInput): Promise<UpdateWorkoutLogResult> {
  const currentSettings = await localSettingsRepository.getDefault()
  const currentWorkout = currentSettings.workoutLogs[date]

  if (JSON.stringify(currentWorkout) === JSON.stringify(patch)) {
    return {
      pendingCount: await localSyncQueueRepository.countOutstanding(),
    }
  }

  const nextSettings = {
    ...currentSettings,
    workoutLogs: {
      ...currentSettings.workoutLogs,
      [date]: patch,
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
