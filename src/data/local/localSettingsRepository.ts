import type { SettingsRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import { createDefaultUserSettings } from '@/domain/settings/types'

export class LocalSettingsRepository implements SettingsRepository {
  async getDefault() {
    const db = await getForgeDb()
    const settings = await db.get('settings', 'default')

    if (settings) {
      return settings
    }

    const defaultSettings = createDefaultUserSettings()
    await db.put('settings', defaultSettings)

    return defaultSettings
  }

  async upsert(settings: ReturnType<typeof createDefaultUserSettings>) {
    const db = await getForgeDb()
    await db.put('settings', settings)
  }
}
