import {
  buildCompletionHeatmap,
  buildDeepBlockTrendChart,
  buildExecutionStreakCalendar,
  buildProjectionCurveChart,
  buildScoreTrendChart,
  buildSleepPerformanceCorrelation,
  buildTimeWindowPerformance,
  buildWfoWfhComparison,
  buildWorkoutProductivityCorrelation,
} from '@/domain/analytics/chartData'
import { deriveAnalyticsGamification } from '@/domain/analytics/gamification'
import { evaluateAnalyticsInsights } from '@/domain/analytics/insights'
import type { AnalyticsBreakdownDatum, AnalyticsRollingWindowKey } from '@/domain/analytics/types'
import type { PrepDomainKey } from '@/domain/prep/types'
import type { AnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'

export function deriveAnalyticsInterpretation({
  bundle,
  windowKey,
  anchorDateKey,
}: {
  bundle: AnalyticsSnapshotBundle
  windowKey: AnalyticsRollingWindowKey
  anchorDateKey: string
}) {
  const snapshot =
    bundle.rollingSnapshots.find((entry) => entry.windowKey === windowKey) ??
    bundle.rollingSnapshots.find((entry) => entry.windowKey === '30d') ??
    bundle.rollingSnapshots[0]
  const factsInWindow = bundle.facts.filter(
    (fact) => fact.date >= snapshot.sourceRange.startDate && fact.date <= snapshot.sourceRange.endDate,
  )
  const prepDomainBalance = buildPrepDomainBalance({
    factsInWindow,
    prepDomainReference: snapshot.breakdowns.byPrepDomain,
    trackedDays: snapshot.summaryMetrics.trackedDays,
  })
  const sleepPerformanceCorrelation = buildSleepPerformanceCorrelation(factsInWindow)
  const workoutProductivityCorrelation = buildWorkoutProductivityCorrelation(factsInWindow)
  const wfoWfhComparison = buildWfoWfhComparison(factsInWindow)
  const timeWindowPerformance = buildTimeWindowPerformance(factsInWindow)
  const scoreTrend = buildScoreTrendChart(factsInWindow)
  const deepWorkTrend = buildDeepBlockTrendChart(factsInWindow)
  const readinessCurve = buildProjectionCurveChart(bundle.projection)
  const completionHeatmap = buildCompletionHeatmap(factsInWindow, anchorDateKey)
  const streakCalendar = buildExecutionStreakCalendar(factsInWindow, anchorDateKey)
  const insightEvaluation = evaluateAnalyticsInsights({
    windowKey,
    facts: factsInWindow,
    prepDomainBalance,
    sleepPerformanceCorrelation,
    workoutProductivityCorrelation,
    wfoWfhComparison,
    timeWindowPerformance,
    projection: bundle.projection,
    scoreTrend,
    deepWorkTrend,
  })
  const gamification = deriveAnalyticsGamification({
    facts: factsInWindow,
    insights: insightEvaluation.insights,
    projection: bundle.projection,
    prepDomainBalance,
    anchorDate: anchorDateKey,
  })

  return {
    snapshot,
    factsInWindow,
    prepDomainBalance,
    sleepPerformanceCorrelation,
    workoutProductivityCorrelation,
    wfoWfhComparison,
    timeWindowPerformance,
    scoreTrend,
    deepWorkTrend,
    readinessCurve,
    completionHeatmap,
    streakCalendar,
    insightEvaluation,
    gamification,
  }
}

function buildPrepDomainBalance({
  factsInWindow,
  prepDomainReference,
  trackedDays,
}: {
  factsInWindow: Array<{
    focusedPrepDomains: PrepDomainKey[]
    prepMinutes: number
  }>
  prepDomainReference: AnalyticsBreakdownDatum[]
  trackedDays: number
}) {
  const labels = new Map(prepDomainReference.map((entry) => [entry.key, entry.label]))
  const stats = new Map<
    PrepDomainKey,
    {
      minutes: number
      touchedDays: number
    }
  >()

  for (const fact of factsInWindow) {
    const uniqueDomains = [...new Set(fact.focusedPrepDomains)]

    if (uniqueDomains.length === 0) {
      continue
    }

    const allocatedMinutes = fact.prepMinutes > 0 ? fact.prepMinutes / uniqueDomains.length : 0

    for (const domain of uniqueDomains) {
      const current = stats.get(domain) ?? {
        minutes: 0,
        touchedDays: 0,
      }

      stats.set(domain, {
        minutes: current.minutes + allocatedMinutes,
        touchedDays: current.touchedDays + 1,
      })
    }
  }

  return [...stats.entries()]
    .map(([key, value]) => ({
      key,
      label: labels.get(key) ?? keyLabel(key),
      value: round(value.minutes / 60),
      secondaryValue: value.touchedDays,
      percent: trackedDays === 0 ? 0 : round((value.touchedDays / trackedDays) * 100),
    }))
    .filter((entry) => entry.value > 0 || (entry.secondaryValue ?? 0) > 0)
    .sort((left, right) => right.value - left.value)
}

function round(value: number) {
  return Number(value.toFixed(1))
}

function keyLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase())
}
