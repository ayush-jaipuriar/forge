import { beforeEach, describe, expect, it } from 'vitest'
import { localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { forgeRoutine } from '@/data/seeds'
import { createDefaultUserSettings } from '@/domain/settings/types'

describe('sync queue helpers', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('creates a queue item for day-instance upserts with retry metadata', () => {
    const instance = generateDayInstance({
      date: '2026-03-23',
      routine: forgeRoutine,
    })

    const item = createSyncQueueItem('upsertDayInstance', instance.id, instance)

    expect(item.actionType).toBe('upsertDayInstance')
    expect(item.entityId).toBe(instance.id)
    expect(item.status).toBe('pending')
    expect(item.attemptCount).toBe(0)
  })

  it('creates a queue item for settings upserts', () => {
    const settings = createDefaultUserSettings()
    const item = createSyncQueueItem('upsertSettings', settings.id, settings)

    expect(item.actionType).toBe('upsertSettings')
    expect(item.payload.dayModeOverrides).toEqual({})
  })

  it('creates a queue item for settings subtree patches', () => {
    const item = createSyncQueueItem('patchSettings', 'default:notificationsEnabled', {
      type: 'setNotificationsEnabled',
      settingsId: 'default',
      value: false,
      updatedAt: '2026-04-18T10:00:00.000Z',
    })

    expect(item.actionType).toBe('patchSettings')
    expect(item.entityId).toBe('default:notificationsEnabled')
    expect(item.payload.type).toBe('setNotificationsEnabled')
  })

  it('keeps failed items outstanding and replayable until they are removed', async () => {
    const settings = createDefaultUserSettings()
    const item = createSyncQueueItem('upsertSettings', settings.id, settings)

    await localSyncQueueRepository.enqueue(item)
    await localSyncQueueRepository.markFailed(item.id, 'temporary outage')

    const outstandingItems = await localSyncQueueRepository.listOutstanding()
    const replayableItems = await localSyncQueueRepository.listReplayable()
    const outstandingCount = await localSyncQueueRepository.countOutstanding()

    expect(outstandingCount).toBe(1)
    expect(outstandingItems).toHaveLength(1)
    expect(outstandingItems[0].status).toBe('failed')
    expect(replayableItems).toHaveLength(1)
    expect(replayableItems[0].status).toBe('failed')
  })
})
