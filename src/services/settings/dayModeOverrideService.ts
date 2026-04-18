import type { DayMode } from '@/domain/common/types'
import { localSettingsRepository } from '@/data/local'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import type { SyncWriteMode } from '@/services/sync/persistSyncableChange'
import { getOutstandingSyncCount, persistSettingsPatch } from '@/services/settings/settingsSyncPersistence'

type UpdateDayModeOverrideInput = {
  date: string
  dayMode: DayMode
  userId?: string
  syncMode?: SyncWriteMode
}

type UpdateDayModeOverrideResult = {
  pendingCount: number
}

export async function updateDayModeOverride({
  date,
  dayMode,
  userId,
  syncMode,
}: UpdateDayModeOverrideInput): Promise<UpdateDayModeOverrideResult> {
  const currentSettings = await localSettingsRepository.getDefault()

  if (currentSettings.dayModeOverrides[date] === dayMode) {
    return {
      pendingCount: await getOutstandingSyncCount(),
    }
  }

  const patch = {
    type: 'mergeDayModeOverrides' as const,
    settingsId: currentSettings.id,
    entries: {
      [date]: dayMode,
    },
    updatedAt: new Date().toISOString(),
  }

  const result = await persistSettingsPatch({
    patch,
    userId,
    syncMode,
  })
  await markCalendarMirrorsStaleIfEnabled()

  return {
    pendingCount: result.pendingCount,
  }
}
