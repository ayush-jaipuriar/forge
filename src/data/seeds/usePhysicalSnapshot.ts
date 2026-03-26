import { forgeWorkoutSchedule } from '@/data/seeds'
import { getTodayRoutineSnapshot } from '@/data/seeds/useRoutineSnapshot'
import { getScheduledWorkoutForDay, getWeeklyWorkoutSummary } from '@/domain/physical/selectors'

export function getPhysicalSnapshot(date = new Date()) {
  const { dayInstance, scheduledWorkout } = getTodayRoutineSnapshot(date)

  return {
    dayInstance,
    scheduledWorkout:
      scheduledWorkout ?? getScheduledWorkoutForDay(forgeWorkoutSchedule, dayInstance.weekday, dayInstance.dayType),
    weeklyWorkoutSummary: getWeeklyWorkoutSummary(forgeWorkoutSchedule),
  }
}
