import type { DayMode, DayType, EnergyStatus, SleepStatus } from '@/domain/common/types'
import {
  createDefaultCalendarConnectionSnapshot,
} from '@/domain/calendar/types'
import type { CalendarConnectionSnapshot } from '@/domain/calendar/types'
import type { WorkoutLogEntry } from '@/domain/physical/types'
import type { PrepTopicProgressSnapshot } from '@/domain/prep/types'

export type DailySignalSnapshot = {
  sleepStatus: SleepStatus
  energyStatus: EnergyStatus
  sleepDurationHours?: number
}

export type UserSettings = {
  id: 'default'
  notificationsEnabled: boolean
  calendarIntegration: CalendarConnectionSnapshot
  dayModeOverrides: Record<string, DayMode>
  dayTypeOverrides: Record<string, DayType>
  dailySignals: Record<string, DailySignalSnapshot>
  prepTopicProgress: Record<string, PrepTopicProgressSnapshot>
  workoutLogs: Record<string, WorkoutLogEntry>
  updatedAt: string
}

export function createDefaultUserSettings(): UserSettings {
  return {
    id: 'default',
    notificationsEnabled: true,
    calendarIntegration: createDefaultCalendarConnectionSnapshot(),
    dayModeOverrides: {},
    dayTypeOverrides: {},
    dailySignals: {},
    prepTopicProgress: {},
    workoutLogs: {},
    updatedAt: new Date().toISOString(),
  }
}
