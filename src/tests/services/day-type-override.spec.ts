import { beforeEach, describe, expect, it } from 'vitest'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { updateDayTypeOverride } from '@/services/settings/dayTypeOverrideService'

describe('updateDayTypeOverride', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists an allowed day-type override locally and queues a settings sync item', async () => {
    const result = await updateDayTypeOverride({
      date: '2026-03-24',
      dayType: 'lowEnergy',
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(settings?.dayTypeOverrides['2026-03-24']).toBe('lowEnergy')
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertSettings')

    if (queueItems[0].actionType !== 'upsertSettings') {
      throw new Error('Expected a settings sync queue item.')
    }

    expect(queueItems[0].payload.dayTypeOverrides['2026-03-24']).toBe('lowEnergy')
  })

  it('clears the stored override when the user returns to the seeded day type', async () => {
    await updateDayTypeOverride({
      date: '2026-03-24',
      dayType: 'lowEnergy',
    })

    await updateDayTypeOverride({
      date: '2026-03-24',
      dayType: 'wfoContinuity',
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(settings?.dayTypeOverrides['2026-03-24']).toBeUndefined()
    expect(queueItems).toHaveLength(1)

    if (queueItems[0].actionType !== 'upsertSettings') {
      throw new Error('Expected a settings sync queue item.')
    }

    expect(queueItems[0].payload.dayTypeOverrides['2026-03-24']).toBeUndefined()
  })

  it('rejects overrides that fall outside the weekday guardrails', async () => {
    await expect(
      updateDayTypeOverride({
        date: '2026-03-24',
        dayType: 'weekendDeepWork',
      }),
    ).rejects.toThrow(/outside the v1 schedule guardrails/i)
  })
})
