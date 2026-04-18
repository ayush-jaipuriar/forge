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
      sleepDurationHours: undefined,
    })
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0]).toMatchObject({
      actionType: 'patchSettings',
      entityId: 'default:dailySignals:2026-03-27',
    })
  })

  it('derives sleep target status from manual duration input', async () => {
    await updateDailySignals({
      date: '2026-03-27',
      sleepDurationHours: 8,
    })

    const settings = await localSettingsRepository.getDefault()

    expect(settings?.dailySignals['2026-03-27']).toEqual({
      sleepStatus: 'met',
      energyStatus: 'unknown',
      sleepDurationHours: 8,
    })
  })

  it('keeps guest signal writes local-only when sync is disabled', async () => {
    const result = await updateDailySignals({
      date: '2026-03-27',
      sleepStatus: 'met',
      energyStatus: 'high',
      syncMode: 'localOnly',
    })

    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(0)
    expect(queueItems).toHaveLength(0)
  })
})
