import type { DayMode } from '@/domain/common/types'

export type UserSettings = {
  id: 'default'
  notificationsEnabled: boolean
  calendarConnected: boolean
  dayModeOverrides: Record<string, DayMode>
  updatedAt: string
}

export function createDefaultUserSettings(): UserSettings {
  return {
    id: 'default',
    notificationsEnabled: true,
    calendarConnected: false,
    dayModeOverrides: {},
    updatedAt: new Date().toISOString(),
  }
}
