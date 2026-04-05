import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'

export async function updateNotificationPreference({
  enabled,
  userId,
  syncMode,
}: {
  enabled: boolean
  userId?: string
  syncMode?: SyncWriteMode
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

  return {
    settings: nextSettings,
    ...(await persistSyncableChange({
      actionType: 'upsertSettings',
      entityId: nextSettings.id,
      payload: nextSettings,
      userId,
      mode: syncMode,
    })),
  }
}
