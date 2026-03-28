import { forgePrepTaxonomy } from '@/data/seeds'
import type { AnalyticsBreakdownDatum } from '@/domain/analytics/types'
import { analyticsRollingWindowKeys, type AnalyticsRollingWindowKey } from '@/domain/analytics/types'
import {
  buildCompletionHeatmap,
  buildDeepBlockTrendChart,
  buildExecutionStreakCalendar,
  buildPrepTopicHoursChart,
  buildProjectionCurveChart,
  buildScoreTrendChart,
  buildSleepPerformanceCorrelation,
  buildTimeWindowPerformance,
  buildWfoWfhComparison,
  buildWorkoutProductivityCorrelation,
  type AnalyticsComparisonDatum,
  type AnalyticsCurveDatum,
  type AnalyticsHeatmapCell,
  type AnalyticsStreakCalendar,
  type AnalyticsTopicHoursDatum,
} from '@/domain/analytics/chartData'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { mergePrepTopicProgress } from '@/domain/prep/selectors'
import type { PrepDomainKey } from '@/domain/prep/types'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'
import { getDateKey } from '@/domain/routine/week'

export type CommandCenterDataState = 'empty' | 'limited' | 'ready'

export type CommandCenterMetricCard = {
  id: string
  eyebrow: string
  value: string
  detail: string
  tone: 'neutral' | 'success' | 'warning'
}

export type CommandCenterWarning = {
  id: string
  title: string
  detail: string
  severity: 'info' | 'warning' | 'critical'
}

export type CommandCenterInsight = {
  id: string
  title: string
  summary: string
  tone: 'neutral' | 'positive' | 'warning'
  supportingEvidence: string[]
}

export type CommandCenterTrendPoint = {
  label: string
  value: number
  secondaryValue?: number
}

export type CommandCenterWorkspace = {
  anchorDate: string
  windowKey: AnalyticsRollingWindowKey
  availableWindows: readonly AnalyticsRollingWindowKey[]
  generatedAt: string
  dataState: CommandCenterDataState
  trackedDays: number
  sourceLabel: string
  metrics: CommandCenterMetricCard[]
  readinessCurve: AnalyticsCurveDatum[]
  prepTopicHours: AnalyticsTopicHoursDatum[]
  sleepPerformanceCorrelation: AnalyticsComparisonDatum[]
  wfoWfhComparison: AnalyticsComparisonDatum[]
  timeWindowPerformance: AnalyticsComparisonDatum[]
  completionHeatmap: AnalyticsHeatmapCell[]
  streakCalendar: AnalyticsStreakCalendar
  workoutProductivityCorrelation: AnalyticsComparisonDatum[]
  scoreTrend: CommandCenterTrendPoint[]
  deepWorkTrend: CommandCenterTrendPoint[]
  timeBandPressure: AnalyticsBreakdownDatum[]
  prepDomainBalance: AnalyticsBreakdownDatum[]
  warnings: CommandCenterWarning[]
  insights: CommandCenterInsight[]
  projection: ReturnType<typeof generateAnalyticsSnapshotBundle>['projection']
}

export async function getCommandCenterWorkspace(
  windowKey: AnalyticsRollingWindowKey = '30d',
  anchorDate = new Date(),
): Promise<CommandCenterWorkspace> {
  const anchorDateKey = getDateKey(anchorDate)
  const settings = await localSettingsRepository.getDefault()
  const dayInstances = await localDayInstanceRepository.listAll()
  const topicRecords = mergePrepTopicProgress(forgePrepTaxonomy, settings.prepTopicProgress)
  const bundle = generateAnalyticsSnapshotBundle({
    dayInstances,
    settings,
    anchorDate,
  })
  const snapshot =
    bundle.rollingSnapshots.find((entry) => entry.windowKey === windowKey) ??
    bundle.rollingSnapshots.find((entry) => entry.windowKey === '30d') ??
    bundle.rollingSnapshots[0]
  const factsInWindow = bundle.facts.filter(
    (fact) => fact.date >= snapshot.sourceRange.startDate && fact.date <= snapshot.sourceRange.endDate,
  )
  const dataState = getCommandCenterDataState(snapshot.summaryMetrics.trackedDays)

  const prepDomainBalance = buildPrepDomainBalance({
    factsInWindow,
    prepDomainReference: snapshot.breakdowns.byPrepDomain,
    trackedDays: snapshot.summaryMetrics.trackedDays,
  })

  return {
    anchorDate: anchorDateKey,
    windowKey,
    availableWindows: analyticsRollingWindowKeys,
    generatedAt: snapshot.generatedAt,
    dataState,
    trackedDays: snapshot.summaryMetrics.trackedDays,
    sourceLabel: `${snapshot.sourceRange.startDate} -> ${snapshot.sourceRange.endDate}`,
    metrics: buildMetricCards({
      trackedDays: snapshot.summaryMetrics.trackedDays,
      scoreAverage: snapshot.summaryMetrics.scoreAverages.master,
      deepBlocks: snapshot.summaryMetrics.completedDeepBlocks,
      projectionPercent: bundle.projection.projectedReadinessPercent,
      projectionStatusLabel: bundle.projection.statusLabel,
      dataState,
    }),
    readinessCurve: buildProjectionCurveChart(bundle.projection),
    prepTopicHours: buildPrepTopicHoursChart(topicRecords),
    sleepPerformanceCorrelation: buildSleepPerformanceCorrelation(factsInWindow),
    wfoWfhComparison: buildWfoWfhComparison(factsInWindow),
    timeWindowPerformance: buildTimeWindowPerformance(factsInWindow),
    completionHeatmap: buildCompletionHeatmap(factsInWindow, anchorDateKey),
    streakCalendar: buildExecutionStreakCalendar(factsInWindow, anchorDateKey),
    workoutProductivityCorrelation: buildWorkoutProductivityCorrelation(factsInWindow),
    scoreTrend: buildScoreTrendChart(factsInWindow).map((point) => ({
      label: point.label,
      value: point.value,
      secondaryValue: point.target,
    })),
    deepWorkTrend: buildDeepBlockTrendChart(factsInWindow).map((point) => ({
      label: point.label,
      value: point.value,
      secondaryValue: point.target,
    })),
    timeBandPressure: [...snapshot.breakdowns.byTimeBand].sort((left, right) => right.value - left.value),
    prepDomainBalance,
    warnings: buildWarnings({
      dataState,
      trackedDays: snapshot.summaryMetrics.trackedDays,
      projection: bundle.projection,
      missedPrimeBlocks: snapshot.summaryMetrics.missedPrimeBlocks,
      workoutsScheduled: snapshot.summaryMetrics.workoutsScheduled,
      workoutsCompleted: snapshot.summaryMetrics.workoutsCompleted,
    }),
    insights: buildInsights({
      dataState,
      timeBandPressure: snapshot.breakdowns.byTimeBand,
      prepDomainBalance,
      scoreAverage: snapshot.summaryMetrics.scoreAverages.master,
      sleepTargetMetDays: snapshot.summaryMetrics.sleepTargetMetDays,
      trackedDays: snapshot.summaryMetrics.trackedDays,
    }),
    projection: bundle.projection,
  }
}

function buildMetricCards({
  trackedDays,
  scoreAverage,
  deepBlocks,
  projectionPercent,
  projectionStatusLabel,
  dataState,
}: {
  trackedDays: number
  scoreAverage: number
  deepBlocks: number
  projectionPercent: number
  projectionStatusLabel: string
  dataState: CommandCenterDataState
}): CommandCenterMetricCard[] {
  return [
    {
      id: 'tracked-days',
      eyebrow: 'Tracked Days',
      value: `${trackedDays}`,
      detail:
        dataState === 'empty'
          ? 'No persisted day instances yet. Command Center is waiting for historical execution records.'
          : 'Historical day instances available for charting and projection.',
      tone: dataState === 'ready' ? 'success' : 'warning',
    },
    {
      id: 'score-average',
      eyebrow: 'Average Score',
      value: `${scoreAverage}/100`,
      detail: 'Rolling average across the selected window, used as a stability signal rather than a vanity KPI.',
      tone: scoreAverage >= 75 ? 'success' : scoreAverage >= 55 ? 'neutral' : 'warning',
    },
    {
      id: 'deep-blocks',
      eyebrow: 'Deep Blocks Landed',
      value: `${deepBlocks}`,
      detail: 'Completed deep-work blocks inside the active window. Missed prime blocks will show up in the risk stack.',
      tone: deepBlocks > 0 ? 'success' : 'warning',
    },
    {
      id: 'projection',
      eyebrow: 'Projected Readiness',
      value: `${projectionPercent}%`,
      detail: projectionStatusLabel,
      tone: projectionPercent >= 85 ? 'success' : 'warning',
    },
  ]
}

function buildWarnings({
  dataState,
  trackedDays,
  projection,
  missedPrimeBlocks,
  workoutsScheduled,
  workoutsCompleted,
}: {
  dataState: CommandCenterDataState
  trackedDays: number
  projection: ReturnType<typeof generateAnalyticsSnapshotBundle>['projection']
  missedPrimeBlocks: number
  workoutsScheduled: number
  workoutsCompleted: number
}): CommandCenterWarning[] {
  const warnings: CommandCenterWarning[] = []

  if (dataState === 'empty') {
    warnings.push({
      id: 'history-empty',
      title: 'History window is still empty',
      detail:
        'Command Center can render the shell now, but the analytics engine needs persisted day instances before it can produce trustworthy patterns.',
      severity: 'warning',
    })
  } else if (dataState === 'limited') {
    warnings.push({
      id: 'history-limited',
      title: 'Sample size is still narrow',
      detail: `Only ${trackedDays} tracked day(s) are inside this window, so trend cards should be treated as directional rather than stable.`,
      severity: 'info',
    })
  }

  if (projection.status === 'critical' || projection.status === 'slipping' || projection.status === 'atRisk') {
    warnings.push({
      id: 'projection-risk',
      title: 'Readiness pace is under pressure',
      detail: projection.summary,
      severity: projection.status === 'critical' ? 'critical' : 'warning',
    })
  }

  if (missedPrimeBlocks > 0) {
    warnings.push({
      id: 'prime-block-misses',
      title: 'Prime execution blocks were missed',
      detail: `${missedPrimeBlocks} prime block miss(es) inside the selected window are already lowering the ceiling on score and readiness momentum.`,
      severity: missedPrimeBlocks >= 3 ? 'critical' : 'warning',
    })
  }

  if (workoutsScheduled > 0 && workoutsCompleted / workoutsScheduled < 0.5) {
    warnings.push({
      id: 'workout-drift',
      title: 'Physical consistency is trailing',
      detail: `${workoutsCompleted}/${workoutsScheduled} scheduled workouts landed inside this window, which weakens the physical score and recovery assumptions.`,
      severity: 'warning',
    })
  }

  return warnings.slice(0, 4)
}

function buildInsights({
  dataState,
  timeBandPressure,
  prepDomainBalance,
  scoreAverage,
  sleepTargetMetDays,
  trackedDays,
}: {
  dataState: CommandCenterDataState
  timeBandPressure: AnalyticsBreakdownDatum[]
  prepDomainBalance: AnalyticsBreakdownDatum[]
  scoreAverage: number
  sleepTargetMetDays: number
  trackedDays: number
}): CommandCenterInsight[] {
  if (dataState === 'empty') {
    return []
  }

  const bestTimeBand = [...timeBandPressure]
    .filter((entry) => (entry.secondaryValue ?? 0) > 0)
    .sort((left, right) => (left.percent ?? 100) - (right.percent ?? 100))[0]
  const mostInvestedPrepDomain = [...prepDomainBalance].sort((left, right) => right.value - left.value)[0]
  const sleepRate = trackedDays === 0 ? 0 : Math.round((sleepTargetMetDays / trackedDays) * 100)

  return [
    bestTimeBand
      ? {
          id: 'best-time-band',
          title: `${bestTimeBand.label} is holding best under pressure`,
          summary: `${bestTimeBand.label} has the lowest skip rate in the current window, which makes it the most reliable place to protect prime work.`,
          tone: 'positive',
          supportingEvidence: [
            `${bestTimeBand.percent ?? 0}% skip rate`,
            `${bestTimeBand.secondaryValue ?? 0} completed blocks`,
          ],
        }
      : null,
    mostInvestedPrepDomain
      ? {
          id: 'prep-balance',
          title: `${mostInvestedPrepDomain.label} is carrying the prep load`,
          summary: `${mostInvestedPrepDomain.value} tracked hour(s) have landed in this domain, so it is currently the clearest sign of prep attention.`,
          tone: 'neutral',
          supportingEvidence: [
            `${mostInvestedPrepDomain.secondaryValue ?? 0} touched topics`,
            `${mostInvestedPrepDomain.percent ?? 0}% taxonomy coverage`,
          ],
        }
      : null,
    {
      id: 'score-context',
      title: 'Average score is a pressure signal, not a finish line',
      summary: `The active window is averaging ${scoreAverage}/100. The point of this number is to reveal drift patterns, not to let low-value work hide prime misses.`,
      tone: scoreAverage >= 75 ? 'positive' : 'warning',
      supportingEvidence: [
        `${trackedDays} tracked day(s)`,
        `${sleepRate}% of days hit the sleep target`,
      ],
    },
  ].filter((entry): entry is CommandCenterInsight => Boolean(entry))
}

function getCommandCenterDataState(trackedDays: number): CommandCenterDataState {
  if (trackedDays === 0) {
    return 'empty'
  }

  if (trackedDays < 7) {
    return 'limited'
  }

  return 'ready'
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
