import type { DayType, SleepStatus, Weekday, WorkoutStatus } from '@/domain/common/types'
import type { WorkoutLogEntry, WorkoutScheduleEntry, WorkoutType } from '@/domain/physical/types'

export function getScheduledWorkoutForDay(
  schedule: WorkoutScheduleEntry[],
  weekday: Weekday,
  dayType: DayType,
) {
  return schedule.find((entry) => entry.weekday === weekday && entry.dayTypes.includes(dayType)) ?? null
}

export function getWorkoutForDate({
  date,
  scheduledWorkout,
  workoutLogs,
}: {
  date: string
  scheduledWorkout: WorkoutScheduleEntry | null
  workoutLogs: Record<string, WorkoutLogEntry>
}) {
  const loggedWorkout = workoutLogs[date]

  if (loggedWorkout) {
    return loggedWorkout
  }

  if (scheduledWorkout) {
    return {
      date,
      workoutType: scheduledWorkout.workoutType,
      label: scheduledWorkout.label,
      status: scheduledWorkout.status,
    }
  }

  return {
    date,
    workoutType: 'rest' as WorkoutType,
    label: 'Recovery / Flex',
    status: 'optional' as WorkoutStatus,
  }
}

export function getWeeklyWorkoutSummary(
  schedule: WorkoutScheduleEntry[],
  workoutLogs: Record<string, WorkoutLogEntry> = {},
) {
  const scheduledSessions = schedule.filter((entry) => entry.status === 'scheduled')
  const optionalSessions = schedule.filter((entry) => entry.status === 'optional')
  const logs = Object.values(workoutLogs)
  const doneCount = logs.filter((entry) => entry.status === 'done').length
  const skippedCount = logs.filter((entry) => entry.status === 'skipped').length
  const rescheduledCount = logs.filter((entry) => entry.status === 'rescheduled').length

  return {
    scheduledCount: scheduledSessions.length,
    optionalCount: optionalSessions.length,
    doneCount,
    skippedCount,
    rescheduledCount,
    labels: schedule.map((entry) => `${capitalize(entry.weekday)}: ${entry.label}`),
  }
}

export function deriveSleepStatusFromDuration(sleepDurationHours?: number, targetHours = 7.5): SleepStatus {
  if (sleepDurationHours == null || Number.isNaN(sleepDurationHours)) {
    return 'unknown'
  }

  return sleepDurationHours >= targetHours ? 'met' : 'missed'
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
