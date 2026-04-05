import type { DayMode } from '@/domain/common/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'

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
      pendingCount: await localSyncQueueRepository.countOutstanding(),
    }
  }

  const nextSettings = {
    ...currentSettings,
    dayModeOverrides: {
      ...currentSettings.dayModeOverrides,
      [date]: dayMode,
    },
    updatedAt: new Date().toISOString(),
  }

  await localSettingsRepository.upsert(nextSettings)
  await markCalendarMirrorsStaleIfEnabled()
  return persistSyncableChange({
    actionType: 'upsertSettings',
    entityId: nextSettings.id,
    payload: nextSettings,
    userId,
    mode: syncMode,
  })
}
