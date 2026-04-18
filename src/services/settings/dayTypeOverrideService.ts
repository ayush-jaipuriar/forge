import type { DayType } from '@/domain/common/types'
import { localSettingsRepository } from '@/data/local'
import { forgeRoutine } from '@/data/seeds'
import { isDayTypeOverrideAllowed, getScheduledDayTypeForDate } from '@/domain/schedule/overrideRules'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import type { SyncWriteMode } from '@/services/sync/persistSyncableChange'
import { getOutstandingSyncCount, persistSettingsPatch } from '@/services/settings/settingsSyncPersistence'

type UpdateDayTypeOverrideInput = {
  date: string
  dayType: DayType
  userId?: string
  syncMode?: SyncWriteMode
}

type UpdateDayTypeOverrideResult = {
  pendingCount: number
}

export async function updateDayTypeOverride({
  date,
  dayType,
  userId,
  syncMode,
}: UpdateDayTypeOverrideInput): Promise<UpdateDayTypeOverrideResult> {
  if (!isDayTypeOverrideAllowed(date, dayType)) {
    throw new Error('That day-type override is outside the V1 schedule guardrails.')
  }

  const currentSettings = await localSettingsRepository.getDefault()
  const scheduledDayType = getScheduledDayTypeForDate(date, forgeRoutine)
  const currentDayType = currentSettings.dayTypeOverrides[date] ?? scheduledDayType

  if (currentDayType === dayType) {
    return {
      pendingCount: await getOutstandingSyncCount(),
    }
  }

  const patch = {
    type: 'mergeDayTypeOverrides' as const,
    settingsId: currentSettings.id,
    entries: {
      [date]: dayType === scheduledDayType ? null : dayType,
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
