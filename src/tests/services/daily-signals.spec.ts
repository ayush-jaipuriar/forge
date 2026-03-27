import { beforeEach, describe, expect, it } from 'vitest'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { updateDailySignals } from '@/services/settings/dailySignalsService'

describe('updateDailySignals', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists daily sleep and energy signals and queues a settings sync item', async () => {
    const result = await updateDailySignals({
      date: '2026-03-27',
      sleepStatus: 'met',
      energyStatus: 'high',
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(settings?.dailySignals['2026-03-27']).toEqual({
      sleepStatus: 'met',
      energyStatus: 'high',
    })
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertSettings')
  })
})
