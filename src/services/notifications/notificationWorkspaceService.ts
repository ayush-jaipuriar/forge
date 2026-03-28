import { forgePrepTaxonomy, forgeRoutine, forgeWorkoutSchedule } from '@/data/seeds'
import { deriveAnalyticsInterpretation } from '@/services/analytics/analyticsInterpretationService'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { getWorkoutForDate } from '@/domain/physical/selectors'
import { getFocusedPrepDomains, mergePrepTopicProgress } from '@/domain/prep/selectors'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { getDateKey } from '@/domain/routine/week'
import { calculateReadinessSnapshot } from '@/domain/readiness/calculateReadinessSnapshot'
import { getFallbackModeSuggestion } from '@/domain/recommendation/getFallbackModeSuggestion'
import type { FallbackModeSuggestion } from '@/domain/recommendation/types'
import { calculateDayScorePreview } from '@/domain/scoring/calculateDayScorePreview'
import type { DayScorePreview } from '@/domain/scoring/types'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'

export type NotificationTodayWorkspace = {
  dayInstance: DayInstance
  scorePreview: DayScorePreview
  fallbackSuggestion: FallbackModeSuggestion | null
}

export type NotificationOperationalSummary = {
  coachSummary: ReturnType<typeof deriveAnalyticsInterpretation>['insightEvaluation']['coachSummary']
  projection: ReturnType<typeof generateAnalyticsSnapshotBundle>['projection']
  missions: ReturnType<typeof deriveAnalyticsInterpretation>['gamification']['missions']
}

export function buildNotificationEvaluationWorkspace({
  settings,
  dayInstances,
  anchorDate,
}: {
  settings: UserSettings | null
  dayInstances: DayInstance[]
  anchorDate: Date
}) {
  const normalizedSettings = settings ?? createDefaultUserSettings()
  const anchorDateKey = getDateKey(anchorDate)
  const dayMode = normalizedSettings.dayModeOverrides[anchorDateKey] ?? 'normal'
  const dayTypeOverride = normalizedSettings.dayTypeOverrides[anchorDateKey]
  const dailySignals = normalizedSettings.dailySignals[anchorDateKey] ?? {
    sleepStatus: 'unknown' as const,
    energyStatus: 'unknown' as const,
    sleepDurationHours: undefined,
  }
  const existingDayInstance = dayInstances.find((instance) => instance.date === anchorDateKey)
  const dayInstance =
    existingDayInstance && existingDayInstance.dayMode === dayMode && existingDayInstance.dayType === (dayTypeOverride ?? existingDayInstance.dayType)
      ? existingDayInstance
      : generateDayInstance({
          date: anchorDateKey,
          routine: forgeRoutine,
          dayMode,
          overrideDayType: dayTypeOverride,
        })

  const scheduledWorkout =
    forgeWorkoutSchedule.find((entry) => entry.weekday === dayInstance.weekday && entry.dayTypes.includes(dayInstance.dayType)) ?? null
  const workoutState = getWorkoutForDate({
    date: anchorDateKey,
    scheduledWorkout,
    workoutLogs: normalizedSettings.workoutLogs ?? {},
  })
  const prepTopics = mergePrepTopicProgress(forgePrepTaxonomy, normalizedSettings.prepTopicProgress ?? {})
  const focusedPrepDomains = getFocusedPrepDomains(
    prepTopics,
    [...new Set(dayInstance.blocks.flatMap((block) => block.focusAreas))],
  )
  const readinessSnapshot = calculateReadinessSnapshot({
    date: anchorDateKey,
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

  const bundle = generateAnalyticsSnapshotBundle({
    dayInstances: dayInstances.length === 0 ? [dayInstance] : dayInstances,
    settings: normalizedSettings,
    anchorDate,
  })
  const { insightEvaluation, gamification } = deriveAnalyticsInterpretation({
    bundle,
    windowKey: '30d',
    anchorDateKey: bundle.projection.lastEvaluatedDate,
  })

  return {
    today: {
      dayInstance,
      scorePreview,
      fallbackSuggestion,
    },
    summary: {
      coachSummary: insightEvaluation.coachSummary,
      projection: bundle.projection,
      missions: gamification.missions,
    },
  }
}
