import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type { AnalyticsComparisonDatum } from '@/domain/analytics/chartData'
import type {
  AnalyticsCoachSummary,
  AnalyticsInsight,
  AnalyticsInsightEvidence,
  AnalyticsInsightRuleKey,
  AnalyticsRollingWindowKey,
  AnalyticsBreakdownDatum,
  ProjectionConfidenceLevel,
  ReadinessProjectionSnapshot,
} from '@/domain/analytics/types'
import { prepDomainLabels } from '@/domain/prep/selectors'
import type { PrepDomainKey } from '@/domain/prep/types'

type AnalyticsInsightContext = {
  windowKey: AnalyticsRollingWindowKey
  facts: AnalyticsDayFact[]
  prepDomainBalance: AnalyticsBreakdownDatum<PrepDomainKey>[]
  sleepPerformanceCorrelation: AnalyticsComparisonDatum[]
  workoutProductivityCorrelation: AnalyticsComparisonDatum[]
  wfoWfhComparison: AnalyticsComparisonDatum[]
  timeWindowPerformance: AnalyticsComparisonDatum[]
  projection: ReadinessProjectionSnapshot
  scoreTrend: Array<{ value: number }>
  deepWorkTrend: Array<{ value: number }>
}

type AnalyticsInsightRule = {
  key: AnalyticsInsightRuleKey
  evaluate: (context: AnalyticsInsightContext) => AnalyticsInsight | null
}

export function evaluateAnalyticsInsights(context: AnalyticsInsightContext): {
  insights: AnalyticsInsight[]
  coachSummary: AnalyticsCoachSummary
} {
  const generatedAt = new Date().toISOString()
  const rules: AnalyticsInsightRule[] = [
    {
      key: 'sleep-vs-prep-quality',
      evaluate: (ctx) => evaluateSleepPrepRule(ctx, generatedAt),
    },
    {
      key: 'gym-vs-mental-performance',
      evaluate: (ctx) => evaluateWorkoutPerformanceRule(ctx, generatedAt),
    },
    {
      key: 'topic-neglect',
      evaluate: (ctx) => evaluateTopicNeglectRule(ctx, generatedAt),
    },
    {
      key: 'weekend-utilization',
      evaluate: (ctx) => evaluateWeekendUtilizationRule(ctx, generatedAt),
    },
    {
      key: 'most-missed-time-window',
      evaluate: (ctx) => evaluateMissedTimeWindowRule(ctx, generatedAt),
    },
    {
      key: 'best-performing-time-window',
      evaluate: (ctx) => evaluateBestTimeWindowRule(ctx, generatedAt),
    },
    {
      key: 'pace-prediction',
      evaluate: (ctx) => evaluatePacePredictionRule(ctx, generatedAt),
    },
    {
      key: 'wfo-vs-wfh-difference',
      evaluate: (ctx) => evaluateWfoWfhRule(ctx, generatedAt),
    },
    {
      key: 'deep-block-completion-trend',
      evaluate: (ctx) => evaluateDeepBlockTrendRule(ctx, generatedAt),
    },
    {
      key: 'readiness-progression-pace',
      evaluate: (ctx) => evaluateReadinessPaceRule(ctx, generatedAt),
    },
    {
      key: 'behind-target-warning',
      evaluate: (ctx) => evaluateBehindTargetRule(ctx, generatedAt),
    },
    {
      key: 'low-energy-success-pattern',
      evaluate: (ctx) => evaluateLowEnergySuccessRule(ctx, generatedAt),
    },
  ]

  const insights = rules
    .map((rule) => rule.evaluate(context))
    .filter((insight): insight is AnalyticsInsight => Boolean(insight))
    .sort(compareInsights)

  return {
    insights,
    coachSummary: buildCoachSummary(insights, context.windowKey),
  }
}

function evaluateSleepPrepRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const met = context.sleepPerformanceCorrelation.find((entry) => entry.key === 'met')
  const missed = context.sleepPerformanceCorrelation.find((entry) => entry.key === 'missed')

  if (!met || !missed) {
    return null
  }

  const prepDelta = round(met.primaryValue - missed.primaryValue)

  if (Math.abs(prepDelta) < 8) {
    return null
  }

  return createInsight({
    id: 'sleep-vs-prep-quality',
    ruleKey: 'sleep-vs-prep-quality',
    severity: prepDelta >= 12 ? 'warning' : 'info',
    confidence: getBucketConfidence(Math.min(met.sampleSize, missed.sampleSize)),
    title: 'Sleep quality is shifting prep output',
    summary:
      prepDelta > 0
        ? `Sleep-target misses are correlating with roughly ${prepDelta} lower prep-score points in this window.`
        : `Current data is not showing the usual sleep penalty, which likely means the sample is still noisy.`,
    supportingEvidence: [
      evidence('Sleep target met', `${met.primaryValue} prep score`, 'positive'),
      evidence('Sleep target missed', `${missed.primaryValue} prep score`, prepDelta > 0 ? 'negative' : 'neutral'),
      evidence('Sample', `${met.sampleSize}/${missed.sampleSize} day(s)`, 'neutral'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateWorkoutPerformanceRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const completed = context.workoutProductivityCorrelation.find((entry) => entry.key === 'workout-complete')
  const missed = context.workoutProductivityCorrelation.find((entry) => entry.key === 'workout-missed')

  if (!completed || !missed) {
    return null
  }

  const prepDelta = round(completed.primaryValue - missed.primaryValue)

  if (Math.abs(prepDelta) < 8) {
    return null
  }

  return createInsight({
    id: 'gym-vs-mental-performance',
    ruleKey: 'gym-vs-mental-performance',
    severity: prepDelta >= 10 ? 'warning' : 'info',
    confidence: getBucketConfidence(Math.min(completed.sampleSize, missed.sampleSize)),
    title: 'Workout completion is correlating with sharper prep days',
    summary:
      prepDelta > 0
        ? `Workout-complete days are averaging about ${prepDelta} higher prep-score points than workout-expected days that drifted.`
        : `Workout completion is not yet separating the prep scores meaningfully in this window.`,
    supportingEvidence: [
      evidence('Workout completed', `${completed.primaryValue} prep score`, 'positive'),
      evidence('Workout drifted', `${missed.primaryValue} prep score`, prepDelta > 0 ? 'negative' : 'neutral'),
      evidence('Compared days', `${completed.sampleSize}/${missed.sampleSize}`, 'neutral'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateTopicNeglectRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const coreDomains: PrepDomainKey[] = ['dsa', 'systemDesign', 'lld', 'javaBackend']
  const seenDomains = new Set(context.prepDomainBalance.map((entry) => entry.key as PrepDomainKey))
  const missingDomains = coreDomains.filter((domain) => !seenDomains.has(domain))
  const weakestTrackedDomain = [...context.prepDomainBalance].sort((left, right) => left.value - right.value)[0]
  const strongestTrackedDomain = [...context.prepDomainBalance].sort((left, right) => right.value - left.value)[0]

  const neglectedDomains = missingDomains.length > 0
    ? missingDomains
    : weakestTrackedDomain && strongestTrackedDomain && weakestTrackedDomain.value < strongestTrackedDomain.value * 0.25
      ? [weakestTrackedDomain.key as PrepDomainKey]
      : []

  if (neglectedDomains.length === 0) {
    return null
  }

  return createInsight({
    id: 'topic-neglect',
    ruleKey: 'topic-neglect',
    severity: 'warning',
    confidence: neglectedDomains.length >= 2 ? 'high' : 'medium',
    title: 'One or more prep domains are underweight',
    summary: `The current window is underweighting ${neglectedDomains
      .map((domain) => prepDomainLabels[domain])
      .join(', ')}, which increases the chance of readiness imbalance.`,
    supportingEvidence: [
      evidence('Neglected domains', neglectedDomains.map((domain) => prepDomainLabels[domain]).join(', '), 'negative'),
      strongestTrackedDomain
        ? evidence('Most active domain', `${strongestTrackedDomain.label} · ${strongestTrackedDomain.value}h`, 'neutral')
        : evidence('Most active domain', 'No tracked domain yet', 'neutral'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateWeekendUtilizationRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const weekendFacts = context.facts.filter((fact) =>
    ['saturday', 'sunday'].includes(fact.weekday) ||
    fact.dayType === 'weekendDeepWork' ||
    fact.dayType === 'weekendConsolidation',
  )

  if (weekendFacts.length < 2) {
    return null
  }

  const weekendScore = average(weekendFacts.map((fact) => fact.projectedScore))
  const weekendCompletion = average(weekendFacts.map((fact) => getCompletionRate(fact)))

  if (weekendScore >= 70 && weekendCompletion >= 60) {
    return createInsight({
      id: 'weekend-utilization',
      ruleKey: 'weekend-utilization',
      severity: 'info',
      confidence: getBucketConfidence(weekendFacts.length),
      title: 'Weekends are carrying meaningful execution weight',
      summary: 'Weekend days are currently supporting the broader readiness push instead of disappearing into recovery-only drift.',
      supportingEvidence: [
        evidence('Weekend score', `${weekendScore}/100`, 'positive'),
        evidence('Weekend completion', `${weekendCompletion}%`, 'positive'),
      ],
      sourceWindow: context.windowKey,
      generatedAt,
    })
  }

  if (weekendScore < 55 || weekendCompletion < 45) {
    return createInsight({
      id: 'weekend-utilization',
      ruleKey: 'weekend-utilization',
      severity: 'warning',
      confidence: getBucketConfidence(weekendFacts.length),
      title: 'Weekend utilization is softer than the target requires',
      summary: 'The weekend pattern is not adding enough meaningful execution pressure, which matters because the target pace assumes weekends stay useful.',
      supportingEvidence: [
        evidence('Weekend score', `${weekendScore}/100`, 'negative'),
        evidence('Weekend completion', `${weekendCompletion}%`, 'negative'),
      ],
      sourceWindow: context.windowKey,
      generatedAt,
    })
  }

  return null
}

function evaluateMissedTimeWindowRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const worstBand = [...context.timeWindowPerformance].sort(
    (left, right) => (right.secondaryValue ?? 0) - (left.secondaryValue ?? 0),
  )[0]

  if (!worstBand || (worstBand.secondaryValue ?? 0) < 30 || worstBand.sampleSize < 3) {
    return null
  }

  return createInsight({
    id: 'most-missed-time-window',
    ruleKey: 'most-missed-time-window',
    severity: 'warning',
    confidence: getBucketConfidence(worstBand.sampleSize),
    title: `${worstBand.label} is the main skip-pressure zone`,
    summary: `${worstBand.label} is absorbing the highest skip rate in the current window, so it is the clearest schedule-friction candidate right now.`,
    supportingEvidence: [
      evidence('Skipped share', `${worstBand.secondaryValue ?? 0}%`, 'negative'),
      evidence('Completed share', `${worstBand.primaryValue}%`, 'neutral'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateBestTimeWindowRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const bestBand = [...context.timeWindowPerformance].sort((left, right) => right.primaryValue - left.primaryValue)[0]

  if (!bestBand || bestBand.primaryValue < 70 || bestBand.sampleSize < 3) {
    return null
  }

  return createInsight({
    id: 'best-performing-time-window',
    ruleKey: 'best-performing-time-window',
    severity: 'info',
    confidence: getBucketConfidence(bestBand.sampleSize),
    title: `${bestBand.label} is the most reliable execution window`,
    summary: `The current window suggests ${bestBand.label} is where blocks are most likely to land cleanly, so prime work should be protected there first.`,
    supportingEvidence: [
      evidence('Completion share', `${bestBand.primaryValue}%`, 'positive'),
      evidence('Skip share', `${bestBand.secondaryValue ?? 0}%`, 'neutral'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluatePacePredictionRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  if (context.projection.status === 'insufficientData') {
    return null
  }

  return createInsight({
    id: 'pace-prediction',
    ruleKey: 'pace-prediction',
    severity: context.projection.status === 'onTrack' ? 'info' : 'warning',
    confidence: context.projection.confidence,
    title: 'Current pace projection is now readable',
    summary: context.projection.summary,
    supportingEvidence: [
      evidence('Projected readiness', `${context.projection.projectedReadinessPercent}%`, context.projection.status === 'onTrack' ? 'positive' : 'negative'),
      evidence('Estimated ready date', context.projection.estimatedReadyDate ?? 'No clear estimate yet', 'neutral'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateWfoWfhRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const wfh = context.wfoWfhComparison.find((entry) => entry.key === 'wfh')
  const wfo = context.wfoWfhComparison.find((entry) => entry.key === 'wfo')

  if (!wfh || !wfo) {
    return null
  }

  const delta = round(wfh.primaryValue - wfo.primaryValue)

  if (Math.abs(delta) < 8) {
    return null
  }

  return createInsight({
    id: 'wfo-vs-wfh-difference',
    ruleKey: 'wfo-vs-wfh-difference',
    severity: delta > 0 ? 'warning' : 'info',
    confidence: getBucketConfidence(Math.min(wfh.sampleSize, wfo.sampleSize)),
    title: 'WFH and WFO days are separating in quality',
    summary:
      delta > 0
        ? `WFH high-output days are averaging ${delta} more projected-score points than WFO continuity days in this window.`
        : `WFO continuity days are currently matching or beating WFH quality, which is a useful signal for continuity planning.`,
    supportingEvidence: [
      evidence('WFH score', `${wfh.primaryValue}`, delta > 0 ? 'positive' : 'neutral'),
      evidence('WFO score', `${wfo.primaryValue}`, delta > 0 ? 'negative' : 'positive'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateDeepBlockTrendRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  if (context.deepWorkTrend.length < 6) {
    return null
  }

  const midpoint = Math.floor(context.deepWorkTrend.length / 2)
  const earlyAverage = average(context.deepWorkTrend.slice(0, midpoint).map((entry) => entry.value))
  const lateAverage = average(context.deepWorkTrend.slice(midpoint).map((entry) => entry.value))
  const delta = round(lateAverage - earlyAverage)

  if (Math.abs(delta) < 0.5) {
    return null
  }

  return createInsight({
    id: 'deep-block-completion-trend',
    ruleKey: 'deep-block-completion-trend',
    severity: delta < 0 ? 'warning' : 'info',
    confidence: getBucketConfidence(context.deepWorkTrend.length),
    title: delta < 0 ? 'Deep-block throughput is softening' : 'Deep-block throughput is improving',
    summary:
      delta < 0
        ? 'Recent deep-work completion is lagging the earlier half of the window, which usually shows up in readiness pace shortly after.'
        : 'Recent deep-work completion is stronger than the earlier half of the window, which is a good sign for sustained prep velocity.',
    supportingEvidence: [
      evidence('Early-window average', `${earlyAverage} blocks`, delta < 0 ? 'neutral' : 'negative'),
      evidence('Recent-window average', `${lateAverage} blocks`, delta < 0 ? 'negative' : 'positive'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateReadinessPaceRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  if (context.projection.status === 'insufficientData') {
    return null
  }

  const delta = round(context.projection.weeklyReadinessVelocity - context.projection.requiredWeeklyVelocity)

  if (Math.abs(delta) < 0.8) {
    return null
  }

  return createInsight({
    id: 'readiness-progression-pace',
    ruleKey: 'readiness-progression-pace',
    severity: delta < 0 ? 'warning' : 'info',
    confidence: context.projection.confidence,
    title: delta < 0 ? 'Readiness velocity is below the requirement' : 'Readiness velocity is exceeding the requirement',
    summary:
      delta < 0
        ? `The current weekly readiness velocity is trailing the required pace by about ${Math.abs(delta)} point(s).`
        : `The current weekly readiness velocity is beating the required pace by about ${delta} point(s).`,
    supportingEvidence: [
      evidence('Current weekly velocity', `${context.projection.weeklyReadinessVelocity}`, delta < 0 ? 'negative' : 'positive'),
      evidence('Required weekly velocity', `${context.projection.requiredWeeklyVelocity}`, 'neutral'),
    ],
    sourceWindow: context.windowKey,
    generatedAt,
  })
}

function evaluateBehindTargetRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  if (context.projection.status === 'critical' || context.projection.status === 'slipping' || context.projection.status === 'atRisk') {
    return createInsight({
      id: 'behind-target-warning',
      ruleKey: 'behind-target-warning',
      severity: context.projection.status === 'critical' ? 'critical' : 'warning',
      confidence: context.projection.confidence,
      title: 'Target-date risk is active',
      summary:
        context.projection.targetSlipDays > 0
          ? `At the current pace, readiness is slipping roughly ${context.projection.targetSlipDays} day(s) past the target window.`
          : 'The current pace is not yet strong enough to support the target with confidence.',
      supportingEvidence: [
        evidence('Projection status', context.projection.statusLabel, 'negative'),
        evidence('Projected readiness', `${context.projection.projectedReadinessPercent}%`, 'negative'),
      ],
      sourceWindow: context.windowKey,
      generatedAt,
    })
  }

  return null
}

function evaluateLowEnergySuccessRule(
  context: AnalyticsInsightContext,
  generatedAt: string,
): AnalyticsInsight | null {
  const lowEnergyFacts = context.facts.filter(
    (fact) =>
      fact.dayMode === 'lowEnergy' ||
      fact.dayMode === 'survival' ||
      fact.dayType === 'lowEnergy' ||
      fact.dayType === 'survival',
  )

  if (lowEnergyFacts.length < 2) {
    return null
  }

  const averageScore = average(lowEnergyFacts.map((fact) => fact.projectedScore))
  const primeMissRate = round(
    (lowEnergyFacts.filter((fact) => fact.missedPrimeBlock).length / lowEnergyFacts.length) * 100,
  )

  if (averageScore >= 60 && primeMissRate <= 35) {
    return createInsight({
      id: 'low-energy-success-pattern',
      ruleKey: 'low-energy-success-pattern',
      severity: 'info',
      confidence: getBucketConfidence(lowEnergyFacts.length),
      title: 'Low-energy days are still salvageable',
      summary: 'Fallback execution is still producing usable output, which means the downgrade patterns are helping instead of just rationalizing drift.',
      supportingEvidence: [
        evidence('Fallback-day score', `${averageScore}/100`, 'positive'),
        evidence('Prime-miss rate', `${primeMissRate}%`, 'neutral'),
      ],
      sourceWindow: context.windowKey,
      generatedAt,
    })
  }

  if (averageScore < 45) {
    return createInsight({
      id: 'low-energy-success-pattern',
      ruleKey: 'low-energy-success-pattern',
      severity: 'warning',
      confidence: getBucketConfidence(lowEnergyFacts.length),
      title: 'Low-energy days are still collapsing too hard',
      summary: 'The current fallback pattern is not yet preserving enough useful output when energy drops, which makes mode downgrades less effective than they should be.',
      supportingEvidence: [
        evidence('Fallback-day score', `${averageScore}/100`, 'negative'),
        evidence('Observed fallback days', `${lowEnergyFacts.length}`, 'neutral'),
      ],
      sourceWindow: context.windowKey,
      generatedAt,
    })
  }

  return null
}

function buildCoachSummary(
  insights: AnalyticsInsight[],
  windowKey: AnalyticsRollingWindowKey,
): AnalyticsCoachSummary {
  const critical = insights.find((insight) => insight.severity === 'critical')
  if (critical) {
    return {
      title: 'Immediate intervention is warranted',
      summary: `${critical.title}. ${critical.summary}`,
      severity: 'critical',
    }
  }

  const warning = insights.find((insight) => insight.severity === 'warning')
  if (warning) {
    return {
      title: 'The current window has a clear pressure point',
      summary: `${warning.title}. ${warning.summary}`,
      severity: 'warning',
    }
  }

  const positive = insights.find((insight) =>
    insight.supportingEvidence.some((item) => item.direction === 'positive'),
  )
  if (positive) {
    return {
      title: 'A usable execution pattern is emerging',
      summary: `${positive.title}. ${positive.summary}`,
      severity: 'info',
    }
  }

  return {
    title: 'Pattern detection is warming up',
    summary: `Forge is reading the ${windowKey.toUpperCase()} window, but the current mix of data is still too flat to surface a stronger coaching summary.`,
    severity: 'info',
  }
}

function compareInsights(left: AnalyticsInsight, right: AnalyticsInsight) {
  const severityWeight = {
    critical: 3,
    warning: 2,
    info: 1,
  } satisfies Record<AnalyticsInsight['severity'], number>
  const confidenceWeight = {
    high: 3,
    medium: 2,
    low: 1,
  } satisfies Record<ProjectionConfidenceLevel, number>

  const severityDelta = severityWeight[right.severity] - severityWeight[left.severity]
  if (severityDelta !== 0) {
    return severityDelta
  }

  return confidenceWeight[right.confidence] - confidenceWeight[left.confidence]
}

function createInsight(input: AnalyticsInsight): AnalyticsInsight {
  return input
}

function evidence(label: string, value: string, direction: AnalyticsInsightEvidence['direction'] = 'neutral') {
  return { label, value, direction }
}

function getBucketConfidence(sampleSize: number): ProjectionConfidenceLevel {
  if (sampleSize >= 6) {
    return 'high'
  }
  if (sampleSize >= 3) {
    return 'medium'
  }
  return 'low'
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function getCompletionRate(fact: AnalyticsDayFact) {
  const totalBlocks = fact.timeBandOutcomes.reduce((sum, band) => sum + band.totalBlocks, 0)
  if (totalBlocks === 0) {
    return 0
  }
  return round((fact.completedBlocks / totalBlocks) * 100)
}

function round(value: number) {
  return Number(value.toFixed(1))
}
