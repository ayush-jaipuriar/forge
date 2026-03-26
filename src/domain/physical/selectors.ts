import type { WorkoutScheduleEntry } from '@/domain/physical/types'
import type { DayType, Weekday } from '@/domain/common/types'

export function getScheduledWorkoutForDay(
  schedule: WorkoutScheduleEntry[],
  weekday: Weekday,
  dayType: DayType,
) {
  return schedule.find((entry) => entry.weekday === weekday && entry.dayTypes.includes(dayType)) ?? null
}

export function getWeeklyWorkoutSummary(schedule: WorkoutScheduleEntry[]) {
  const scheduledSessions = schedule.filter((entry) => entry.status === 'scheduled')
  const optionalSessions = schedule.filter((entry) => entry.status === 'optional')

  return {
    scheduledCount: scheduledSessions.length,
    optionalCount: optionalSessions.length,
    labels: schedule.map((entry) => `${capitalize(entry.weekday)}: ${entry.label}`),
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
