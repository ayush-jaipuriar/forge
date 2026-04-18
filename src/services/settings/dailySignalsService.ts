import type { EnergyStatus, SleepStatus } from '@/domain/common/types'
import { localSettingsRepository } from '@/data/local'
import { deriveSleepStatusFromDuration } from '@/domain/physical/selectors'
import type { SyncWriteMode } from '@/services/sync/persistSyncableChange'
import { getOutstandingSyncCount, persistSettingsPatch } from '@/services/settings/settingsSyncPersistence'

type UpdateDailySignalsInput = {
  date: string
  sleepStatus?: SleepStatus
  energyStatus?: EnergyStatus
  sleepDurationHours?: number | null
  userId?: string
  syncMode?: SyncWriteMode
}

type UpdateDailySignalsResult = {
  pendingCount: number
}

export async function updateDailySignals({
  date,
  sleepStatus,
  energyStatus,
  sleepDurationHours,
  userId,
  syncMode,
}: UpdateDailySignalsInput): Promise<UpdateDailySignalsResult> {
  const currentSettings = await localSettingsRepository.getDefault()
  const currentSignals = currentSettings.dailySignals[date] ?? {
    sleepStatus: 'unknown' as const,
    energyStatus: 'unknown' as const,
    sleepDurationHours: undefined,
  }
  const nextSleepDurationHours =
    sleepDurationHours === null ? undefined : sleepDurationHours ?? currentSignals.sleepDurationHours
  const nextSignals = {
    sleepStatus:
      sleepStatus ??
      (sleepDurationHours !== undefined ? deriveSleepStatusFromDuration(nextSleepDurationHours) : currentSignals.sleepStatus),
    energyStatus: energyStatus ?? currentSignals.energyStatus,
    sleepDurationHours: nextSleepDurationHours,
  }

  if (
    currentSignals.sleepStatus === nextSignals.sleepStatus &&
    currentSignals.energyStatus === nextSignals.energyStatus &&
    currentSignals.sleepDurationHours === nextSignals.sleepDurationHours
  ) {
    return {
      pendingCount: await getOutstandingSyncCount(),
    }
  }

  const patch = {
    type: 'mergeDailySignals' as const,
    settingsId: currentSettings.id,
    entries: {
      [date]: nextSignals,
    },
    updatedAt: new Date().toISOString(),
  }

  return persistSettingsPatch({
    patch,
    userId,
    syncMode,
  })
}
