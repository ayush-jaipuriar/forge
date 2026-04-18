import type { WorkoutLogEntry } from '@/domain/physical/types'
import { localSettingsRepository } from '@/data/local'
import type { SyncWriteMode } from '@/services/sync/persistSyncableChange'
import { getOutstandingSyncCount, persistSettingsPatch } from '@/services/settings/settingsSyncPersistence'

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
      pendingCount: await getOutstandingSyncCount(),
    }
  }

  return persistSettingsPatch({
    patch: {
      type: 'mergeWorkoutLogs',
      settingsId: currentSettings.id,
      entries: {
        [date]: patch,
      },
      updatedAt: new Date().toISOString(),
    },
    userId,
    syncMode,
  })
}
