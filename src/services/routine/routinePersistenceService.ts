import { forgeRoutine, forgeWorkoutSchedule } from '@/data/seeds'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { getCurrentBlock, getTopPriorityBlocks } from '@/domain/routine/selectors'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { formatDateLabel, formatWeekdayLabel, generateWeekInstances, getDateKey } from '@/domain/routine/week'
import type { DayInstance } from '@/domain/routine/types'

export async function getOrCreateTodayWorkspace(date = new Date()) {
  const dateKey = getDateKey(date)
  const settings = await localSettingsRepository.getDefault()
  const dayMode = settings?.dayModeOverrides[dateKey] ?? 'normal'

  let dayInstance = await localDayInstanceRepository.getByDate(dateKey)

  if (!dayInstance || dayInstance.dayMode !== dayMode) {
    dayInstance = generateDayInstance({
      date: dateKey,
      routine: forgeRoutine,
      dayMode,
    })

    await localDayInstanceRepository.upsert(dayInstance)
  }

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

export async function getOrCreateWeeklyWorkspace(anchorDate = new Date()) {
  const anchorDateKey = getDateKey(anchorDate)
  const settings = await localSettingsRepository.getDefault()
  const dayModesByDate = settings?.dayModeOverrides ?? {}
  const generatedWeek = generateWeekInstances({
    anchorDate: anchorDateKey,
    routine: forgeRoutine,
    dayModesByDate,
  })

  const existingInstances = await localDayInstanceRepository.getByDates(generatedWeek.map((instance) => instance.date))
  const existingByDate = new Map(existingInstances.map((instance) => [instance.date, instance]))
  const mergedWeek = generatedWeek.map((generatedInstance) => {
    const existing = existingByDate.get(generatedInstance.date)

    if (!existing || existing.dayMode !== generatedInstance.dayMode || existing.dayType !== generatedInstance.dayType) {
      return generatedInstance
    }

    return existing
  })

  await localDayInstanceRepository.upsertMany(mergedWeek)

  return mergedWeek.map((instance) => ({
    ...instance,
    dateLabel: formatDateLabel(instance.date),
    weekdayLabel: formatWeekdayLabel(instance.date),
  }))
}

export async function persistDayInstanceLocally(instance: DayInstance) {
  await localDayInstanceRepository.upsert(instance)
}
