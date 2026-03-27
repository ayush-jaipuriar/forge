import type { DayMode, EnergyStatus, SleepStatus } from '@/domain/common/types'

export type DailySignalSnapshot = {
  sleepStatus: SleepStatus
  energyStatus: EnergyStatus
}

export type UserSettings = {
  id: 'default'
  notificationsEnabled: boolean
  calendarConnected: boolean
  dayModeOverrides: Record<string, DayMode>
  dailySignals: Record<string, DailySignalSnapshot>
  updatedAt: string
}

export function createDefaultUserSettings(): UserSettings {
  return {
    id: 'default',
    notificationsEnabled: true,
    calendarConnected: false,
    dayModeOverrides: {},
    dailySignals: {},
    updatedAt: new Date().toISOString(),
  }
}
