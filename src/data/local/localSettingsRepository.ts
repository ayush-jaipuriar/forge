import type { SettingsRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { createDefaultCalendarConnectionSnapshot } from '@/domain/calendar/types'

export class LocalSettingsRepository implements SettingsRepository {
  async getDefault() {
    const db = await getForgeDb()
    const settings = await db.get('settings', 'default')

    if (settings) {
      const legacyCalendarConnected = 'calendarConnected' in settings ? settings.calendarConnected : undefined
      const normalizedSettings = {
        ...createDefaultUserSettings(),
        ...settings,
        calendarIntegration: settings.calendarIntegration ?? {
          ...createDefaultCalendarConnectionSnapshot(),
          connectionStatus: legacyCalendarConnected ? 'scaffoldingReady' : 'notConnected',
        },
        dayModeOverrides: settings.dayModeOverrides ?? {},
        dayTypeOverrides: settings.dayTypeOverrides ?? {},
        dailySignals: settings.dailySignals ?? {},
        prepTopicProgress: settings.prepTopicProgress ?? {},
        workoutLogs: settings.workoutLogs ?? {},
      }

      await db.put('settings', normalizedSettings)

      return normalizedSettings
    }

    const defaultSettings = createDefaultUserSettings()
    await db.put('settings', defaultSettings)

    return defaultSettings
  }

  async upsert(settings: ReturnType<typeof createDefaultUserSettings>) {
    const db = await getForgeDb()
    await db.put('settings', {
      ...createDefaultUserSettings(),
      ...settings,
      calendarIntegration: settings.calendarIntegration ?? createDefaultCalendarConnectionSnapshot(),
      dayModeOverrides: settings.dayModeOverrides ?? {},
      dayTypeOverrides: settings.dayTypeOverrides ?? {},
      dailySignals: settings.dailySignals ?? {},
      prepTopicProgress: settings.prepTopicProgress ?? {},
      workoutLogs: settings.workoutLogs ?? {},
    })
  }
}
