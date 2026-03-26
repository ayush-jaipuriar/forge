import { forgeRoutine, forgeWorkoutSchedule } from '@/data/seeds'
import { getCurrentBlock, getTopPriorityBlocks } from '@/domain/routine/selectors'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { formatDateLabel, formatWeekdayLabel, generateWeekInstances, getDateKey } from '@/domain/routine/week'

export function getTodayRoutineSnapshot(date = new Date()) {
  const dateKey = getDateKey(date)
  const dayInstance = generateDayInstance({
    date: dateKey,
    routine: forgeRoutine,
  })

  const scheduledWorkout =
    forgeWorkoutSchedule.find((entry) => entry.weekday === dayInstance.weekday && entry.dayTypes.includes(dayInstance.dayType)) ??
    null

  return {
    dateKey,
    dateLabel: formatDateLabel(dateKey),
    weekdayLabel: formatWeekdayLabel(dateKey),
    dayInstance,
    currentBlock: getCurrentBlock(dayInstance),
    topPriorities: getTopPriorityBlocks(dayInstance),
    scheduledWorkout,
  }
}

export function getWeeklyRoutineSnapshot(anchorDate = new Date()) {
  const weekInstances = generateWeekInstances({
    anchorDate: getDateKey(anchorDate),
    routine: forgeRoutine,
  })

  return weekInstances.map((instance) => ({
    ...instance,
    dateLabel: formatDateLabel(instance.date),
    weekdayLabel: formatWeekdayLabel(instance.date),
  }))
}
