import { localSettingsRepository } from '@/data/local'
import type { SyncWriteMode } from '@/services/sync/persistSyncableChange'
import { getOutstandingSyncCount, persistSettingsPatch } from '@/services/settings/settingsSyncPersistence'

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
      pendingCount: await getOutstandingSyncCount(),
    }
  }

  const nextUpdatedAt = new Date().toISOString()
  const result = await persistSettingsPatch({
    patch: {
      type: 'setNotificationsEnabled',
      settingsId: settings.id,
      value: enabled,
      updatedAt: nextUpdatedAt,
    },
    userId,
    syncMode,
  })

  return {
    settings: result.settings,
    pendingCount: result.pendingCount,
  }
}
