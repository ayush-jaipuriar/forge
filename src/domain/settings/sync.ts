import type { CalendarConnectionSnapshot } from '@/domain/calendar/types'
import type { DayMode, DayType } from '@/domain/common/types'
import type { WorkoutLogEntry } from '@/domain/physical/types'
import type { PrepTopicProgressSnapshot } from '@/domain/prep/types'
import type { DailySignalSnapshot, UserSettings } from '@/domain/settings/types'

type SettingsPatchBase = {
  settingsId: UserSettings['id']
  updatedAt: string
}

export type SettingsSyncPatch =
  | (SettingsPatchBase & {
      type: 'setNotificationsEnabled'
      value: boolean
    })
  | (SettingsPatchBase & {
      type: 'setCalendarIntegration'
      value: CalendarConnectionSnapshot
    })
  | (SettingsPatchBase & {
      type: 'mergeDayModeOverrides'
      entries: Record<string, DayMode | null>
    })
  | (SettingsPatchBase & {
      type: 'mergeDayTypeOverrides'
      entries: Record<string, DayType | null>
    })
  | (SettingsPatchBase & {
      type: 'mergeDailySignals'
      entries: Record<string, DailySignalSnapshot | null>
    })
  | (SettingsPatchBase & {
      type: 'mergePrepTopicProgress'
      entries: Record<string, PrepTopicProgressSnapshot | null>
    })
  | (SettingsPatchBase & {
      type: 'mergeWorkoutLogs'
      entries: Record<string, WorkoutLogEntry | null>
    })

export function applySettingsSyncPatch(settings: UserSettings, patch: SettingsSyncPatch): UserSettings {
  switch (patch.type) {
    case 'setNotificationsEnabled':
      return {
        ...settings,
        notificationsEnabled: patch.value,
        updatedAt: patch.updatedAt,
      }
    case 'setCalendarIntegration':
      return {
        ...settings,
        calendarIntegration: patch.value,
        updatedAt: patch.updatedAt,
      }
    case 'mergeDayModeOverrides':
      return {
        ...settings,
        dayModeOverrides: mergeSettingsRecord(settings.dayModeOverrides, patch.entries),
        updatedAt: patch.updatedAt,
      }
    case 'mergeDayTypeOverrides':
      return {
        ...settings,
        dayTypeOverrides: mergeSettingsRecord(settings.dayTypeOverrides, patch.entries),
        updatedAt: patch.updatedAt,
      }
    case 'mergeDailySignals':
      return {
        ...settings,
        dailySignals: mergeSettingsRecord(settings.dailySignals, patch.entries),
        updatedAt: patch.updatedAt,
      }
    case 'mergePrepTopicProgress':
      return {
        ...settings,
        prepTopicProgress: mergeSettingsRecord(settings.prepTopicProgress, patch.entries),
        updatedAt: patch.updatedAt,
      }
    case 'mergeWorkoutLogs':
      return {
        ...settings,
        workoutLogs: mergeSettingsRecord(settings.workoutLogs, patch.entries),
        updatedAt: patch.updatedAt,
      }
  }
}

export function getSettingsPatchEntityId(patch: SettingsSyncPatch) {
  switch (patch.type) {
    case 'setNotificationsEnabled':
      return `${patch.settingsId}:notificationsEnabled`
    case 'setCalendarIntegration':
      return `${patch.settingsId}:calendarIntegration`
    case 'mergeDayModeOverrides':
      return `${patch.settingsId}:dayModeOverrides:${serializePatchEntries(patch.entries)}`
    case 'mergeDayTypeOverrides':
      return `${patch.settingsId}:dayTypeOverrides:${serializePatchEntries(patch.entries)}`
    case 'mergeDailySignals':
      return `${patch.settingsId}:dailySignals:${serializePatchEntries(patch.entries)}`
    case 'mergePrepTopicProgress':
      return `${patch.settingsId}:prepTopicProgress:${serializePatchEntries(patch.entries)}`
    case 'mergeWorkoutLogs':
      return `${patch.settingsId}:workoutLogs:${serializePatchEntries(patch.entries)}`
  }
}

function mergeSettingsRecord<T>(current: Record<string, T>, entries: Record<string, T | null>) {
  const next = {
    ...current,
  }

  for (const [key, value] of Object.entries(entries)) {
    if (value === null) {
      delete next[key]
      continue
    }

    next[key] = value
  }

  return next
}

function serializePatchEntries(entries: Record<string, unknown>) {
  return Object.keys(entries)
    .sort((left, right) => left.localeCompare(right))
    .join(',')
}
