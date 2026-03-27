import type { DayMode, DayType, EnergyStatus, SleepStatus } from '@/domain/common/types'
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
  calendarConnected: boolean
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
    calendarConnected: false,
    dayModeOverrides: {},
    dayTypeOverrides: {},
    dailySignals: {},
    prepTopicProgress: {},
    workoutLogs: {},
    updatedAt: new Date().toISOString(),
  }
}
