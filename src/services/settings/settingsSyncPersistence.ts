import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { FirestoreSettingsRepository } from '@/data/firebase/firestoreSettingsRepository'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { applySettingsSyncPatch, getSettingsPatchEntityId, type SettingsSyncPatch } from '@/domain/settings/sync'
import { persistSyncableChange, type SyncWriteMode } from '@/services/sync/persistSyncableChange'
import { assertAuthenticatedCloudWriteAvailable, isAuthenticatedCloudMode } from '@/services/sync/sourceOfTruth'

const firestoreSettingsRepository = new FirestoreSettingsRepository()

type PersistSettingsPatchInput = {
  patch: SettingsSyncPatch
  userId?: string
  syncMode?: SyncWriteMode
}

type PersistSettingsPatchResult = {
  settings: ReturnType<typeof createDefaultUserSettings>
  pendingCount: number
}

export async function persistSettingsPatch({
  patch,
  userId,
  syncMode,
}: PersistSettingsPatchInput): Promise<PersistSettingsPatchResult> {
  const currentSettings = (await localSettingsRepository.getDefault()) ?? createDefaultUserSettings()
  const nextSettings = applySettingsSyncPatch(currentSettings, patch)

  if (isAuthenticatedCloudMode(userId, syncMode)) {
    if (!userId) {
      throw new Error('Forge needs an authenticated user before saving cloud settings.')
    }

    assertAuthenticatedCloudWriteAvailable(userId, syncMode)
    await firestoreSettingsRepository.patch(userId, patch)
    await localSettingsRepository.upsert(nextSettings)

    return {
      settings: nextSettings,
      pendingCount: 0,
    }
  }

  await localSettingsRepository.upsert(nextSettings)

  const result = await persistSyncableChange({
    actionType: 'patchSettings',
    entityId: getSettingsPatchEntityId(patch),
    payload: patch,
    userId,
    mode: syncMode,
  })

  return {
    settings: nextSettings,
    pendingCount: result.pendingCount,
  }
}

export async function getOutstandingSyncCount() {
  return localSyncQueueRepository.countOutstanding()
}
