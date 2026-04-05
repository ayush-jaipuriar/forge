import type { DayType } from '@/domain/common/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { forgeRoutine } from '@/data/seeds'
import { isDayTypeOverrideAllowed, getScheduledDayTypeForDate } from '@/domain/schedule/overrideRules'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'

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
      pendingCount: await localSyncQueueRepository.countOutstanding(),
    }
  }

  const nextDayTypeOverrides = { ...currentSettings.dayTypeOverrides }

  if (dayType === scheduledDayType) {
    delete nextDayTypeOverrides[date]
  } else {
    nextDayTypeOverrides[date] = dayType
  }

  const nextSettings = {
    ...currentSettings,
    dayTypeOverrides: nextDayTypeOverrides,
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
