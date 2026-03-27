import { forgePrepTaxonomy, forgeRoutine, forgeWorkoutSchedule } from '@/data/seeds'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { getWorkoutForDate } from '@/domain/physical/selectors'
import { getCurrentBlock, getTopPriorityBlocks } from '@/domain/routine/selectors'
import { getFocusedPrepDomains, mergePrepTopicProgress } from '@/domain/prep/selectors'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { formatDateLabel, formatWeekdayLabel, generateWeekInstances, getDateKey } from '@/domain/routine/week'
import { calculateDayScorePreview } from '@/domain/scoring/calculateDayScorePreview'
import { calculateReadinessSnapshot } from '@/domain/readiness/calculateReadinessSnapshot'
import { getFallbackModeSuggestion } from '@/domain/recommendation/getFallbackModeSuggestion'
import { getNextActionRecommendation } from '@/domain/recommendation/getNextActionRecommendation'
import { dayTypeLabels, getAllowedDayTypeOverrides, getScheduledDayTypeForDate } from '@/domain/schedule/overrideRules'
import type { DayInstance } from '@/domain/routine/types'

export async function getOrCreateTodayWorkspace(date = new Date()) {
  const dateKey = getDateKey(date)
  const settings = await localSettingsRepository.getDefault()
  const dayMode = settings?.dayModeOverrides[dateKey] ?? 'normal'
  const dayTypeOverride = settings?.dayTypeOverrides[dateKey]
  const dailySignals = settings?.dailySignals[dateKey] ?? {
    sleepStatus: 'unknown' as const,
    energyStatus: 'unknown' as const,
    sleepDurationHours: undefined,
  }
  const scheduledDayType = getScheduledDayTypeForDate(dateKey, forgeRoutine)
  const effectiveDayType = dayTypeOverride ?? scheduledDayType

  let dayInstance = await localDayInstanceRepository.getByDate(dateKey)

  if (!dayInstance || dayInstance.dayMode !== dayMode || dayInstance.dayType !== effectiveDayType) {
    dayInstance = generateDayInstance({
      date: dateKey,
      routine: forgeRoutine,
      dayMode,
      overrideDayType: dayTypeOverride,
    })

    await localDayInstanceRepository.upsert(dayInstance)
  }

  const scheduledWorkout =
    forgeWorkoutSchedule.find((entry) => entry.weekday === dayInstance.weekday && entry.dayTypes.includes(dayInstance.dayType)) ??
    null
  const workoutState = getWorkoutForDate({
    date: dateKey,
    scheduledWorkout,
    workoutLogs: settings?.workoutLogs ?? {},
  })
  const topPriorities = getTopPriorityBlocks(dayInstance)
  const focusAreas = [...new Set(dayInstance.blocks.flatMap((block) => block.focusAreas))]
  const prepTopics = mergePrepTopicProgress(forgePrepTaxonomy, settings?.prepTopicProgress ?? {})
  const focusedPrepDomains = getFocusedPrepDomains(prepTopics, [...focusAreas, ...topPriorities.flatMap((block) => block.focusAreas)])
  const currentBlock = getCurrentBlock(dayInstance)
  const readinessSnapshot = calculateReadinessSnapshot({
    date: dateKey,
    focusedDomains: focusedPrepDomains,
    topics: prepTopics,
  })
  const scorePreview = calculateDayScorePreview(dayInstance, {
    scheduledWorkout,
    workoutState,
    sleepStatus: dailySignals.sleepStatus,
    readinessSnapshot,
  })
  const fallbackSuggestion = getFallbackModeSuggestion({
    dayInstance,
    scorePreview,
    sleepStatus: dailySignals.sleepStatus,
    energyStatus: dailySignals.energyStatus,
  })

  return {
    dateKey,
    dateLabel: formatDateLabel(dateKey),
    weekdayLabel: formatWeekdayLabel(dateKey),
    dayInstance,
    baseDayType: scheduledDayType,
    isDayTypeOverridden: effectiveDayType !== scheduledDayType,
    currentBlock,
    topPriorities,
    scheduledWorkout,
    workoutState,
    focusedPrepDomains,
    readinessSnapshot,
    sleepStatus: dailySignals.sleepStatus,
    energyStatus: dailySignals.energyStatus,
    sleepDurationHours: dailySignals.sleepDurationHours,
    scorePreview,
    fallbackSuggestion,
    recommendation: getNextActionRecommendation({
      dayInstance,
      currentBlock,
      topPriorities,
      scorePreview,
      readinessSnapshot,
      scheduledWorkout,
      workoutState,
      sleepStatus: dailySignals.sleepStatus,
      energyStatus: dailySignals.energyStatus,
      schedulePressureLevel: readinessSnapshot.paceSnapshot.paceLevel,
      conflictState: 'clear',
      fallbackState: fallbackSuggestion ? 'suggested' : dayInstance.dayMode === 'normal' || dayInstance.dayMode === 'ideal' ? 'stable' : 'active',
    }),
  }
}

export async function getOrCreateWeeklyWorkspace(anchorDate = new Date()) {
  const anchorDateKey = getDateKey(anchorDate)
  const settings = await localSettingsRepository.getDefault()
  const dayModesByDate = settings?.dayModeOverrides ?? {}
  const dayTypesByDate = settings?.dayTypeOverrides ?? {}
  const generatedWeek = generateWeekInstances({
    anchorDate: anchorDateKey,
    routine: forgeRoutine,
    dayModesByDate,
    dayTypesByDate,
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
    baseDayType: getScheduledDayTypeForDate(instance.date, forgeRoutine),
    isDayTypeOverridden: (dayTypesByDate[instance.date] ?? getScheduledDayTypeForDate(instance.date, forgeRoutine)) !== getScheduledDayTypeForDate(instance.date, forgeRoutine),
    allowedDayTypes: getAllowedDayTypeOverrides(instance.date).map((dayType) => ({
      value: dayType,
      label: dayTypeLabels[dayType],
    })),
  }))
}

export async function persistDayInstanceLocally(instance: DayInstance) {
  await localDayInstanceRepository.upsert(instance)
}
