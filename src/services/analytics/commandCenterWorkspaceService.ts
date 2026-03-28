import { forgePrepTaxonomy } from '@/data/seeds'
import type { AnalyticsBreakdownDatum } from '@/domain/analytics/types'
import { analyticsRollingWindowKeys, type AnalyticsRollingWindowKey } from '@/domain/analytics/types'
import {
  buildPrepTopicHoursChart,
  type AnalyticsComparisonDatum,
  type AnalyticsCurveDatum,
  type AnalyticsHeatmapCell,
  type AnalyticsStreakCalendar,
  type AnalyticsTopicHoursDatum,
} from '@/domain/analytics/chartData'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import type { DisciplinePosture } from '@/domain/analytics/gamification'
import { mergePrepTopicProgress } from '@/domain/prep/selectors'
import { deriveAnalyticsInterpretation } from '@/services/analytics/analyticsInterpretationService'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'
import { getDateKey } from '@/domain/routine/week'
import type { MomentumSnapshot, StreakEntry, WeeklyMission } from '@/domain/analytics/types'

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
  confidence: 'low' | 'medium' | 'high'
}

export type CommandCenterInsight = {
  id: string
  title: string
  summary: string
  tone: 'neutral' | 'positive' | 'warning'
  supportingEvidence: string[]
  confidence: 'low' | 'medium' | 'high'
}

export type CommandCenterCoachSummary = {
  title: string
  summary: string
  severity: 'info' | 'warning' | 'critical'
}

export type CommandCenterOperatingTier = DisciplinePosture

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
  coachSummary: CommandCenterCoachSummary
  operatingTier: CommandCenterOperatingTier
  momentum: MomentumSnapshot
  streaks: StreakEntry[]
  missions: WeeklyMission[]
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
  const {
    snapshot,
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
  } = deriveAnalyticsInterpretation({
    bundle,
    windowKey,
    anchorDateKey,
  })
  const dataState = getCommandCenterDataState(snapshot.summaryMetrics.trackedDays)
  const mappedWarnings = insightEvaluation.insights
    .filter((insight) => insight.severity !== 'info')
    .map(mapInsightToWarning)
    .slice(0, 4)
  const mappedInsights = insightEvaluation.insights
    .filter((insight) => insight.severity === 'info')
    .map(mapInsightToCard)
    .slice(0, 5)
  const emptyHistoryWarning: CommandCenterWarning = {
    id: 'history-empty',
    title: 'History window is still empty',
    detail:
      'Command Center can render the shell now, but the analytics engine needs persisted day instances before it can produce trustworthy patterns.',
    severity: 'warning',
    confidence: 'low',
  }
  const limitedHistoryWarning: CommandCenterWarning = {
    id: 'history-limited',
    title: 'Sample size is still narrow',
    detail: `Only ${snapshot.summaryMetrics.trackedDays} tracked day(s) are inside this window, so trend cards should be treated as directional rather than stable.`,
    severity: 'info',
    confidence: 'low',
  }
  const warnings: CommandCenterWarning[] =
    dataState === 'empty'
      ? [emptyHistoryWarning]
      : dataState === 'limited'
        ? [limitedHistoryWarning, ...mappedWarnings].slice(0, 4)
        : mappedWarnings

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
    coachSummary: {
      title: insightEvaluation.coachSummary.title,
      summary: insightEvaluation.coachSummary.summary,
      severity: insightEvaluation.coachSummary.severity,
    },
    operatingTier: gamification.posture,
    momentum: gamification.streakSnapshot.momentum,
    streaks: gamification.streakSnapshot.activeStreaks,
    missions: gamification.missions,
    readinessCurve,
    prepTopicHours: buildPrepTopicHoursChart(topicRecords),
    sleepPerformanceCorrelation,
    wfoWfhComparison,
    timeWindowPerformance,
    completionHeatmap,
    streakCalendar,
    workoutProductivityCorrelation,
    scoreTrend: scoreTrend.map((point) => ({
      label: point.label,
      value: point.value,
      secondaryValue: point.target,
    })),
    deepWorkTrend: deepWorkTrend.map((point) => ({
      label: point.label,
      value: point.value,
      secondaryValue: point.target,
    })),
    timeBandPressure: [...snapshot.breakdowns.byTimeBand].sort((left, right) => right.value - left.value),
    prepDomainBalance,
    warnings,
    insights: mappedInsights,
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

function getCommandCenterDataState(trackedDays: number): CommandCenterDataState {
  if (trackedDays === 0) {
    return 'empty'
  }

  if (trackedDays < 7) {
    return 'limited'
  }

  return 'ready'
}

function mapInsightToWarning(insight: {
  id: string
  title: string
  summary: string
  severity: 'info' | 'warning' | 'critical'
  confidence: 'low' | 'medium' | 'high'
}) {
  return {
    id: insight.id,
    title: insight.title,
    detail: insight.summary,
    severity: insight.severity,
    confidence: insight.confidence,
  } satisfies CommandCenterWarning
}

function mapInsightToCard(insight: {
  id: string
  title: string
  summary: string
  supportingEvidence: Array<{ label: string; value: string; direction?: 'positive' | 'negative' | 'neutral' }>
  confidence: 'low' | 'medium' | 'high'
}) {
  const positiveCount = insight.supportingEvidence.filter((item) => item.direction === 'positive').length
  const negativeCount = insight.supportingEvidence.filter((item) => item.direction === 'negative').length

  return {
    id: insight.id,
    title: insight.title,
    summary: insight.summary,
    tone: positiveCount > negativeCount ? 'positive' : negativeCount > 0 ? 'warning' : 'neutral',
    supportingEvidence: insight.supportingEvidence.map((item) => `${item.label}: ${item.value}`),
    confidence: insight.confidence,
  } satisfies CommandCenterInsight
}
