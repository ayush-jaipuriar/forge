import type { WorkoutLogEntry } from '@/domain/physical/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'

type UpdateWorkoutLogInput = {
  date: string
  patch: WorkoutLogEntry
  userId?: string
  syncMode?: SyncWriteMode
}

type UpdateWorkoutLogResult = {
  pendingCount: number
}

export async function updateWorkoutLog({
  date,
  patch,
  userId,
  syncMode,
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
  return persistSyncableChange({
    actionType: 'upsertSettings',
    entityId: nextSettings.id,
    payload: nextSettings,
    userId,
    mode: syncMode,
  })
}
