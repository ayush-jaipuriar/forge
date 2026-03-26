import { beforeEach, describe, expect, it } from 'vitest'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { updateDayModeOverride } from '@/services/settings/dayModeOverrideService'

describe('updateDayModeOverride', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists the override locally and queues a settings sync item', async () => {
    const result = await updateDayModeOverride({
      date: '2026-03-26',
      dayMode: 'survival',
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(settings?.dayModeOverrides['2026-03-26']).toBe('survival')
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0]).toMatchObject({
      actionType: 'upsertSettings',
      entityId: 'default',
      status: 'pending',
    })
    expect(queueItems[0].actionType).toBe('upsertSettings')

    if (queueItems[0].actionType !== 'upsertSettings') {
      throw new Error('Expected a settings sync queue item.')
    }

    expect(queueItems[0].payload.dayModeOverrides['2026-03-26']).toBe('survival')
  })

  it('does not enqueue a duplicate settings write when the selected mode is already persisted', async () => {
    await updateDayModeOverride({
      date: '2026-03-26',
      dayMode: 'survival',
    })

    const result = await updateDayModeOverride({
      date: '2026-03-26',
      dayMode: 'survival',
    })

    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(queueItems).toHaveLength(1)
  })

  it('replaces superseded settings queue items so the latest settings snapshot wins', async () => {
    await updateDayModeOverride({
      date: '2026-03-26',
      dayMode: 'lowEnergy',
    })

    await updateDayModeOverride({
      date: '2026-03-26',
      dayMode: 'survival',
    })

    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertSettings')

    if (queueItems[0].actionType !== 'upsertSettings') {
      throw new Error('Expected a settings sync queue item.')
    }

    expect(queueItems[0].payload.dayModeOverrides['2026-03-26']).toBe('survival')
  })
})
