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
      actionType: 'patchSettings',
      entityId: 'default:dayModeOverrides:2026-03-26',
      status: 'pending',
    })
    expect(queueItems[0].actionType).toBe('patchSettings')

    if (queueItems[0].actionType !== 'patchSettings') {
      throw new Error('Expected a settings patch sync queue item.')
    }

    expect(queueItems[0].payload.type).toBe('mergeDayModeOverrides')

    if (queueItems[0].payload.type !== 'mergeDayModeOverrides') {
      throw new Error('Expected a day-mode settings patch payload.')
    }

    expect(queueItems[0].payload.entries['2026-03-26']).toBe('survival')
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

  it('replaces superseded settings patch queue items so the latest field write wins', async () => {
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
    expect(queueItems[0].actionType).toBe('patchSettings')

    if (queueItems[0].actionType !== 'patchSettings') {
      throw new Error('Expected a settings patch sync queue item.')
    }

    expect(queueItems[0].payload.type).toBe('mergeDayModeOverrides')

    if (queueItems[0].payload.type !== 'mergeDayModeOverrides') {
      throw new Error('Expected a day-mode settings patch payload.')
    }

    expect(queueItems[0].payload.entries['2026-03-26']).toBe('survival')
  })

  it('keeps unrelated settings patches outstanding side by side instead of collapsing them', async () => {
    await updateDayModeOverride({
      date: '2026-03-26',
      dayMode: 'survival',
    })

    const { updateNotificationPreference } = await import('@/services/settings/notificationPreferenceService')

    await updateNotificationPreference({
      enabled: false,
    })

    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(queueItems).toHaveLength(2)
    expect(queueItems.map((item) => item.entityId).sort()).toEqual([
      'default:dayModeOverrides:2026-03-26',
      'default:notificationsEnabled',
    ])
  })

  it('keeps guest day-mode writes local-only when sync is disabled', async () => {
    const result = await updateDayModeOverride({
      date: '2026-03-26',
      dayMode: 'survival',
      syncMode: 'localOnly',
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(0)
    expect(settings?.dayModeOverrides['2026-03-26']).toBe('survival')
    expect(queueItems).toHaveLength(0)
  })
})
