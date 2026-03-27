import type { EnergyStatus, SleepStatus } from '@/domain/common/types'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type UpdateDailySignalsInput = {
  date: string
  sleepStatus?: SleepStatus
  energyStatus?: EnergyStatus
  userId?: string
}

type UpdateDailySignalsResult = {
  pendingCount: number
}

export async function updateDailySignals({
  date,
  sleepStatus,
  energyStatus,
  userId,
}: UpdateDailySignalsInput): Promise<UpdateDailySignalsResult> {
  const currentSettings = await localSettingsRepository.getDefault()
  const currentSignals = currentSettings.dailySignals[date] ?? {
    sleepStatus: 'unknown' as const,
    energyStatus: 'unknown' as const,
  }
  const nextSignals = {
    sleepStatus: sleepStatus ?? currentSignals.sleepStatus,
    energyStatus: energyStatus ?? currentSignals.energyStatus,
  }

  if (currentSignals.sleepStatus === nextSignals.sleepStatus && currentSignals.energyStatus === nextSignals.energyStatus) {
    return {
      pendingCount: await localSyncQueueRepository.countOutstanding(),
    }
  }

  const nextSettings = {
    ...currentSettings,
    dailySignals: {
      ...currentSettings.dailySignals,
      [date]: nextSignals,
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
