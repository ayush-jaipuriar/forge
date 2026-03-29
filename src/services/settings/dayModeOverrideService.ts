import type { DayMode } from '@/domain/common/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { markCalendarMirrorsStaleIfEnabled } from '@/services/calendar/calendarIntegrationService'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type UpdateDayModeOverrideInput = {
  date: string
  dayMode: DayMode
  userId?: string
}

type UpdateDayModeOverrideResult = {
  pendingCount: number
}

export async function updateDayModeOverride({
  date,
  dayMode,
  userId,
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
