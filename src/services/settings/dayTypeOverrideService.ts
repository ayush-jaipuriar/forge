import type { DayType } from '@/domain/common/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { forgeRoutine } from '@/data/seeds'
import { isDayTypeOverrideAllowed, getScheduledDayTypeForDate } from '@/domain/schedule/overrideRules'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type UpdateDayTypeOverrideInput = {
  date: string
  dayType: DayType
  userId?: string
}

type UpdateDayTypeOverrideResult = {
  pendingCount: number
}

export async function updateDayTypeOverride({
  date,
  dayType,
  userId,
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
  const outstandingItems = await localSyncQueueRepository.listOutstanding()
  const supersededSettingsItems = outstandingItems.filter(
    (item) => item.actionType === 'upsertSettings' && item.entityId === nextSettings.id,
  )

  await Promise.all(supersededSettingsItems.map((item) => localSyncQueueRepository.remove(item.id)))
  await localSyncQueueRepository.enqueue(createSyncQueueItem('upsertSettings', nextSettings.id, nextSettings))
  await markCalendarMirrorsStaleIfEnabled()

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
