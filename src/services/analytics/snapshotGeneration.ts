import { forgePrepTaxonomy, forgeWorkoutSchedule } from '@/data/seeds'
import { deriveAnalyticsDayFact, type AnalyticsDayFact } from '@/domain/analytics/facts'
import { buildDailyAnalyticsSnapshot, buildRollingAnalyticsSnapshot, buildWeeklyAnalyticsSnapshot, filterFactsForRollingWindow } from '@/domain/analytics/rollups'
import { buildReadinessProjectionSnapshot } from '@/domain/analytics/projections'
import type {
  AnalyticsMetadataSnapshot,
  AnalyticsRollingWindowKey,
  ReadinessProjectionSnapshot,
  RollingAnalyticsSnapshot,
  DailyAnalyticsSnapshot,
  WeeklyAnalyticsSnapshot,
} from '@/domain/analytics/types'
import { analyticsRollingWindowKeys, createDefaultAnalyticsMetadataSnapshot } from '@/domain/analytics/types'
import { getWorkoutForDate } from '@/domain/physical/selectors'
import { getFocusedPrepDomains, mergePrepTopicProgress } from '@/domain/prep/selectors'
import { calculateReadinessSnapshot } from '@/domain/readiness/calculateReadinessSnapshot'
import { calculateDayScorePreview } from '@/domain/scoring/calculateDayScorePreview'
import { getDateKey } from '@/domain/routine/week'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'

export type AnalyticsSnapshotBundle = {
  facts: AnalyticsDayFact[]
  dailySnapshots: DailyAnalyticsSnapshot[]
  weeklySnapshots: WeeklyAnalyticsSnapshot[]
  rollingSnapshots: RollingAnalyticsSnapshot[]
  projection: ReadinessProjectionSnapshot
  metadata: AnalyticsMetadataSnapshot
}

export function generateAnalyticsSnapshotBundle({
  dayInstances,
  settings,
  anchorDate = new Date(),
  rollingWindows = analyticsRollingWindowKeys,
}: {
  dayInstances: DayInstance[]
  settings: UserSettings
  anchorDate?: Date
  rollingWindows?: readonly AnalyticsRollingWindowKey[]
}): AnalyticsSnapshotBundle {
  const anchorDateKey = getDateKey(anchorDate)
  const topicRecords = mergePrepTopicProgress(forgePrepTaxonomy, settings.prepTopicProgress)
  const facts = dayInstances
    .map((dayInstance) => {
      const focusAreas = [...new Set(dayInstance.blocks.flatMap((block) => block.focusAreas))]
      const focusedPrepDomains = getFocusedPrepDomains(topicRecords, focusAreas)
      const dailySignal = settings.dailySignals[dayInstance.date] ?? {
        sleepStatus: 'unknown' as const,
        energyStatus: 'unknown' as const,
        sleepDurationHours: undefined,
      }
      const scheduledWorkout =
        forgeWorkoutSchedule.find((entry) => entry.weekday === dayInstance.weekday && entry.dayTypes.includes(dayInstance.dayType)) ??
        null
      const workoutState = getWorkoutForDate({
        date: dayInstance.date,
        scheduledWorkout,
        workoutLogs: settings.workoutLogs,
      })
      const readinessSnapshot = calculateReadinessSnapshot({
        date: dayInstance.date,
        focusedDomains: focusedPrepDomains,
        topics: topicRecords,
      })
      const scorePreview = calculateDayScorePreview(dayInstance, {
        scheduledWorkout,
        workoutState,
        sleepStatus: dailySignal.sleepStatus,
        readinessSnapshot,
      })

      return deriveAnalyticsDayFact({
        dayInstance,
        scorePreview,
        sleepStatus: dailySignal.sleepStatus,
        sleepDurationHours: dailySignal.sleepDurationHours,
        workoutState,
        focusedPrepDomains: focusedPrepDomains.map((domain) => domain.domain),
      })
    })
    .sort((left, right) => left.date.localeCompare(right.date))

  const dailySnapshots = facts.map((fact) =>
    buildDailyAnalyticsSnapshot({
      fact,
      prepTopics: topicRecords,
    }),
  )
  const weeklySnapshots = buildWeeklySnapshots(facts, topicRecords)
  const rollingSnapshots = rollingWindows.map((windowKey) =>
    buildRollingAnalyticsSnapshot({
      windowKey,
      facts: filterFactsForRollingWindow({
        facts,
        windowKey,
        anchorDate: anchorDateKey,
      }),
      prepTopics: topicRecords,
      anchorDate: anchorDateKey,
    }),
  )
  const latestReadinessSnapshot = calculateReadinessSnapshot({
    date: anchorDateKey,
    focusedDomains: getFocusedPrepDomains(topicRecords, []),
    topics: topicRecords,
  })
  const projection = buildReadinessProjectionSnapshot({
    facts,
    readinessSnapshot: latestReadinessSnapshot,
    anchorDate: anchorDateKey,
  })
  const metadata = {
    ...createDefaultAnalyticsMetadataSnapshot(),
    lastDailySnapshotDate: dailySnapshots.at(-1)?.date,
    lastWeeklySnapshotWeekKey: weeklySnapshots.at(-1)?.weekKey,
    latestProjectionGeneratedAt: projection.generatedAt,
    functionsEnabled: true,
    appCheckStatus: 'planned',
    updatedAt: new Date().toISOString(),
  } satisfies AnalyticsMetadataSnapshot

  return {
    facts,
    dailySnapshots,
    weeklySnapshots,
    rollingSnapshots,
    projection,
    metadata,
  }
}

function buildWeeklySnapshots(facts: AnalyticsDayFact[], prepTopics: ReturnType<typeof mergePrepTopicProgress>) {
  const factsByWeek = new Map<string, AnalyticsDayFact[]>()

  for (const fact of facts) {
    const weekKey = getWeekKey(fact.date)
    const existing = factsByWeek.get(weekKey) ?? []
    existing.push(fact)
    factsByWeek.set(weekKey, existing)
  }

  return [...factsByWeek.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([weekKey, weekFacts]) =>
      buildWeeklyAnalyticsSnapshot({
        weekKey,
        facts: weekFacts,
        prepTopics,
      }),
    )
}

export function getWeekKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)

  return date.toISOString().slice(0, 10)
}
