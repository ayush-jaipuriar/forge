import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { createSyncQueueItem } from '@/services/sync/syncQueue'

export async function updateNotificationPreference({
  enabled,
}: {
  enabled: boolean
}) {
  const current = await localSettingsRepository.getDefault()
  const settings = current ?? (await localSettingsRepository.getDefault())

  if (!settings) {
    throw new Error('Forge could not load settings before updating notification preference.')
  }

  if (settings.notificationsEnabled === enabled) {
    return {
      settings,
      pendingCount: await localSyncQueueRepository.countOutstanding(),
    }
  }

  const nextSettings = {
    ...settings,
    notificationsEnabled: enabled,
    updatedAt: new Date().toISOString(),
  }

  await localSettingsRepository.upsert(nextSettings)
  await localSyncQueueRepository.enqueue(createSyncQueueItem('upsertSettings', nextSettings.id, nextSettings))

  return {
    settings: nextSettings,
    pendingCount: await localSyncQueueRepository.countOutstanding(),
  }
}
