import type { BlockStatus, DayType, Weekday } from '@/domain/common/types'
import { getWeekdayFromDateKey } from '@/domain/routine/week'
import type { RoutineTemplate } from '@/domain/routine/types'

const allowedDayTypesByWeekday: Record<Weekday, DayType[]> = {
  monday: ['wfhHighOutput', 'wfoContinuity', 'lowEnergy', 'survival'],
  tuesday: ['wfhHighOutput', 'wfoContinuity', 'lowEnergy', 'survival'],
  wednesday: ['wfhHighOutput', 'wfoContinuity', 'lowEnergy', 'survival'],
  thursday: ['wfhHighOutput', 'wfoContinuity', 'lowEnergy', 'survival'],
  friday: ['wfhHighOutput', 'wfoContinuity', 'lowEnergy', 'survival'],
  saturday: ['weekendDeepWork', 'weekendConsolidation', 'lowEnergy', 'survival'],
  sunday: ['weekendConsolidation', 'weekendDeepWork', 'lowEnergy', 'survival'],
}

const scheduleBlockTransitions: Record<BlockStatus, BlockStatus[]> = {
  planned: ['completed', 'moved', 'skipped'],
  completed: ['planned'],
  moved: ['planned'],
  skipped: ['planned'],
}

export function getScheduledDayTypeForDate(dateKey: string, routine: RoutineTemplate) {
  const weekday = getWeekdayFromDateKey(dateKey)
  const scheduledEntry = routine.weeklySchedule.find((entry) => entry.weekday === weekday)

  if (!scheduledEntry) {
    throw new Error(`No scheduled day type exists for date "${dateKey}".`)
  }

  return scheduledEntry.dayType
}

export function getAllowedDayTypeOverrides(dateKey: string) {
  return allowedDayTypesByWeekday[getWeekdayFromDateKey(dateKey)]
}

export function isDayTypeOverrideAllowed(dateKey: string, dayType: DayType) {
  return getAllowedDayTypeOverrides(dateKey).includes(dayType)
}

export function getAllowedScheduleBlockTransitions(status: BlockStatus) {
  return scheduleBlockTransitions[status]
}

export const dayTypeLabels: Record<DayType, string> = {
  wfhHighOutput: 'WFH High Output',
  wfoContinuity: 'WFO Continuity',
  weekendDeepWork: 'Weekend Deep Work',
  weekendConsolidation: 'Weekend Consolidation',
  lowEnergy: 'Low Energy',
  survival: 'Survival',
}
