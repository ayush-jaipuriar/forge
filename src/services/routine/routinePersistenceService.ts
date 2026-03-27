import { forgePrepTaxonomy, forgeRoutine, forgeWorkoutSchedule } from '@/data/seeds'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { getCurrentBlock, getTopPriorityBlocks } from '@/domain/routine/selectors'
import { getFocusedPrepDomains } from '@/domain/prep/selectors'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { formatDateLabel, formatWeekdayLabel, generateWeekInstances, getDateKey } from '@/domain/routine/week'
import { calculateDayScorePreview } from '@/domain/scoring/calculateDayScorePreview'
import { calculateReadinessSnapshot } from '@/domain/readiness/calculateReadinessSnapshot'
import { getNextActionRecommendation } from '@/domain/recommendation/getNextActionRecommendation'
import type { DayInstance } from '@/domain/routine/types'

export async function getOrCreateTodayWorkspace(date = new Date()) {
  const dateKey = getDateKey(date)
  const settings = await localSettingsRepository.getDefault()
  const dayMode = settings?.dayModeOverrides[dateKey] ?? 'normal'
  const dailySignals = settings?.dailySignals[dateKey] ?? {
    sleepStatus: 'unknown' as const,
    energyStatus: 'unknown' as const,
  }

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
  const topPriorities = getTopPriorityBlocks(dayInstance)
  const focusAreas = [...new Set(dayInstance.blocks.flatMap((block) => block.focusAreas))]
  const focusedPrepDomains = getFocusedPrepDomains(forgePrepTaxonomy, [...focusAreas, ...topPriorities.flatMap((block) => block.focusAreas)])
  const currentBlock = getCurrentBlock(dayInstance)
  const readinessSnapshot = calculateReadinessSnapshot({
    date: dateKey,
    focusedDomains: focusedPrepDomains,
    topics: forgePrepTaxonomy,
  })
  const scorePreview = calculateDayScorePreview(dayInstance, {
    scheduledWorkout,
    sleepStatus: dailySignals.sleepStatus,
    readinessSnapshot,
  })

  return {
    dateKey,
    dateLabel: formatDateLabel(dateKey),
    weekdayLabel: formatWeekdayLabel(dateKey),
    dayInstance,
    currentBlock,
    topPriorities,
    scheduledWorkout,
    focusedPrepDomains,
    readinessSnapshot,
    sleepStatus: dailySignals.sleepStatus,
    energyStatus: dailySignals.energyStatus,
    scorePreview,
    recommendation: getNextActionRecommendation({
      dayInstance,
      currentBlock,
      topPriorities,
      scorePreview,
      readinessSnapshot,
      scheduledWorkout,
      sleepStatus: dailySignals.sleepStatus,
      energyStatus: dailySignals.energyStatus,
    }),
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
