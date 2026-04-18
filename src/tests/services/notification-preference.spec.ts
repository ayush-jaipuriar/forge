import { beforeEach, describe, expect, it } from 'vitest'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { updateNotificationPreference } from '@/services/settings/notificationPreferenceService'

describe('notification preference service', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists the notification toggle in settings and queues a sync write', async () => {
    const result = await updateNotificationPreference({
      enabled: false,
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(settings?.notificationsEnabled).toBe(false)
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0]).toMatchObject({
      actionType: 'patchSettings',
      entityId: 'default:notificationsEnabled',
    })
  })

  it('keeps guest notification preference changes local-only when sync is disabled', async () => {
    const result = await updateNotificationPreference({
      enabled: false,
      syncMode: 'localOnly',
    })

    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(0)
    expect(queueItems).toHaveLength(0)
  })
})
