import { localSettingsRepository } from '@/data/local'
import { forgeWorkoutSchedule } from '@/data/seeds'
import { deriveSleepStatusFromDuration, getWeeklyWorkoutSummary, getWorkoutForDate } from '@/domain/physical/selectors'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'

const SLEEP_TARGET_HOURS = 7.5

export async function getPhysicalWorkspace(date = new Date()) {
  const settings = await localSettingsRepository.getDefault()
  const todayWorkspace = await getOrCreateTodayWorkspace(date)
  const dailySignals = settings.dailySignals[todayWorkspace.dateKey] ?? {
    sleepStatus: 'unknown' as const,
    energyStatus: 'unknown' as const,
    sleepDurationHours: undefined,
  }
  const workout = getWorkoutForDate({
    date: todayWorkspace.dateKey,
    scheduledWorkout: todayWorkspace.scheduledWorkout,
    workoutLogs: settings.workoutLogs,
  })

  return {
    dateKey: todayWorkspace.dateKey,
    dayInstance: todayWorkspace.dayInstance,
    scheduledWorkout: todayWorkspace.scheduledWorkout,
    workout,
    weeklyWorkoutSummary: getWeeklyWorkoutSummary(forgeWorkoutSchedule, settings.workoutLogs),
    sleepDurationHours: dailySignals.sleepDurationHours,
    sleepStatus: deriveSleepStatusFromDuration(dailySignals.sleepDurationHours, SLEEP_TARGET_HOURS),
    sleepTargetHours: SLEEP_TARGET_HOURS,
  }
}
