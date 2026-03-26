import type { BlockKind, BlockStatus, DayMode, DayType, Weekday } from '@/domain/common/types'

export type BlockTemplate = {
  id: string
  title: string
  kind: BlockKind
  startTime?: string
  endTime?: string
  durationMinutes?: number
  detail: string
  focusAreas?: string[]
  requiredOutput?: boolean
  optional?: boolean
}

export type DayTemplate = {
  dayType: DayType
  label: string
  focusLabel: string
  wakeWindow?: string
  sleepWindow?: string
  expectationSummary: string[]
  blocks: BlockTemplate[]
}

export type WeeklyRoutineEntry = {
  weekday: Weekday
  dayType: DayType
}

export type RoutineTemplate = {
  weeklySchedule: WeeklyRoutineEntry[]
  templatesByDayType: Record<DayType, DayTemplate>
}

export type DayInstance = {
  id: string
  date: string
  weekday: Weekday
  dayType: DayType
  dayMode: DayMode
  label: string
  focusLabel: string
  wakeWindow?: string
  sleepWindow?: string
  expectationSummary: string[]
  blocks: BlockInstance[]
}

export type BlockInstance = {
  id: string
  templateId: string
  title: string
  kind: BlockKind
  status: BlockStatus
  startTime?: string
  endTime?: string
  durationMinutes?: number
  detail: string
  focusAreas: string[]
  requiredOutput: boolean
  optional: boolean
  date: string
}
