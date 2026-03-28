import type { PrepTopicRecord } from '@/domain/prep/types'
import { getPrepDomainSummaries } from '@/domain/prep/selectors'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type {
  AnalyticsRollingWindowKey,
  AnalyticsBreakdowns,
  AnalyticsBreakdownDatum,
  AnalyticsSummaryMetrics,
  DailyAnalyticsSnapshot,
  RollingAnalyticsSnapshot,
  WeeklyAnalyticsSnapshot,
} from '@/domain/analytics/types'
import { ANALYTICS_SNAPSHOT_VERSION, analyticsRollingWindowKeys, analyticsTimeBands } from '@/domain/analytics/types'

export function buildAnalyticsSummaryMetrics(facts: AnalyticsDayFact[]): AnalyticsSummaryMetrics {
  const trackedDays = facts.length

  return {
    trackedDays,
    completedBlocks: sum(facts, 'completedBlocks'),
    skippedBlocks: sum(facts, 'skippedBlocks'),
    movedBlocks: sum(facts, 'movedBlocks'),
    completedDeepBlocks: sum(facts, 'completedDeepBlocks'),
    missedPrimeBlocks: facts.filter((fact) => fact.missedPrimeBlock).length,
    requiredOutputsCaptured: sum(facts, 'requiredOutputsCaptured'),
    prepHours: round(sum(facts, 'prepMinutes') / 60),
    workoutsScheduled: facts.filter((fact) => fact.workoutExpected).length,
    workoutsCompleted: facts.filter((fact) => fact.workoutCompleted).length,
    sleepTargetMetDays: facts.filter((fact) => fact.sleepStatus === 'met').length,
    lowEnergyDays: facts.filter((fact) => fact.dayMode === 'lowEnergy' || fact.dayType === 'lowEnergy').length,
    survivalDays: facts.filter((fact) => fact.dayMode === 'survival' || fact.dayType === 'survival').length,
    fallbackActivations: facts.filter((fact) => fact.fallbackActivated).length,
    scoreAverages: {
      master: average(facts.map((fact) => fact.earnedScore)),
      interviewPrep: average(facts.map((fact) => fact.interviewPrepScore)),
      physical: average(facts.map((fact) => fact.physicalScore)),
      discipline: average(facts.map((fact) => fact.disciplineScore)),
      consistency: average(facts.map((fact) => fact.consistencyScore)),
    },
  }
}

export function buildAnalyticsBreakdowns({
  facts,
  prepTopics,
}: {
  facts: AnalyticsDayFact[]
  prepTopics: PrepTopicRecord[]
}): AnalyticsBreakdowns {
  const prepDomainSummaries = getPrepDomainSummaries(prepTopics)

  return {
    byDayType: buildCountBreakdown(facts, (fact) => fact.dayType),
    byWeekday: buildCountBreakdown(facts, (fact) => fact.weekday),
    byTimeBand: analyticsTimeBands.map((band) => {
      const matchingBandOutcomes = facts.flatMap((fact) => fact.timeBandOutcomes).filter((entry) => entry.band === band)
      const skipped = matchingBandOutcomes.reduce((sum, entry) => sum + entry.skippedBlocks, 0)
      const completed = matchingBandOutcomes.reduce((sum, entry) => sum + entry.completedBlocks, 0)
      const total = matchingBandOutcomes.reduce((sum, entry) => sum + entry.totalBlocks, 0)

      return {
        key: band,
        label: bandLabel(band),
        value: skipped,
        secondaryValue: completed,
        percent: total === 0 ? 0 : round((skipped / total) * 100),
      }
    }),
    byPrepDomain: prepDomainSummaries.map((summary) => ({
      key: summary.domain,
      label: summary.label,
      value: round(summary.hoursSpent),
      secondaryValue: summary.touchedTopicCount,
      percent: summary.topicCount === 0 ? 0 : round((summary.touchedTopicCount / summary.topicCount) * 100),
    })),
    byWarState: buildCountBreakdown(facts, (fact) => fact.warState),
  }
}

export function filterFactsForRollingWindow({
  facts,
  windowKey,
  anchorDate,
}: {
  facts: AnalyticsDayFact[]
  windowKey: AnalyticsRollingWindowKey
  anchorDate: string
}) {
  const daySpan = getRollingWindowDaySpan(windowKey)
  const anchor = new Date(`${anchorDate}T00:00:00`)
  const start = new Date(anchor)
  start.setDate(start.getDate() - (daySpan - 1))

  return facts.filter((fact) => {
    const factDate = new Date(`${fact.date}T00:00:00`)
    return factDate >= start && factDate <= anchor
  })
}

export function buildDailyAnalyticsSnapshot({
  fact,
  prepTopics,
  generatedAt = new Date().toISOString(),
}: {
  fact: AnalyticsDayFact
  prepTopics: PrepTopicRecord[]
  generatedAt?: string
}): DailyAnalyticsSnapshot {
  return {
    id: `daily-${fact.date}`,
    granularity: 'daily',
    snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
    generatedAt,
    date: fact.date,
    sourceRange: {
      startDate: fact.date,
      endDate: fact.date,
      dayCount: 1,
    },
    summaryMetrics: buildAnalyticsSummaryMetrics([fact]),
    breakdowns: buildAnalyticsBreakdowns({
      facts: [fact],
      prepTopics,
    }),
  }
}

export function buildWeeklyAnalyticsSnapshot({
  weekKey,
  facts,
  prepTopics,
  generatedAt = new Date().toISOString(),
}: {
  weekKey: string
  facts: AnalyticsDayFact[]
  prepTopics: PrepTopicRecord[]
  generatedAt?: string
}): WeeklyAnalyticsSnapshot {
  return {
    id: `weekly-${weekKey}`,
    granularity: 'weekly',
    snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
    generatedAt,
    weekKey,
    sourceRange: buildSourceRange(facts, weekKey),
    summaryMetrics: buildAnalyticsSummaryMetrics(facts),
    breakdowns: buildAnalyticsBreakdowns({
      facts,
      prepTopics,
    }),
  }
}

export function buildRollingAnalyticsSnapshot({
  windowKey,
  facts,
  prepTopics,
  anchorDate,
  generatedAt = new Date().toISOString(),
}: {
  windowKey: AnalyticsRollingWindowKey
  facts: AnalyticsDayFact[]
  prepTopics: PrepTopicRecord[]
  anchorDate: string
  generatedAt?: string
}): RollingAnalyticsSnapshot {
  return {
    id: `rolling-${windowKey}`,
    granularity: 'rolling',
    snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
    generatedAt,
    windowKey,
    sourceRange: buildSourceRange(facts, anchorDate),
    summaryMetrics: buildAnalyticsSummaryMetrics(facts),
    breakdowns: buildAnalyticsBreakdowns({
      facts,
      prepTopics,
    }),
  }
}

export function getRollingWindowDaySpan(windowKey: AnalyticsRollingWindowKey) {
  switch (windowKey) {
    case '7d':
      return 7
    case '14d':
      return 14
    case '30d':
      return 30
    case '90d':
      return 90
    default:
      return 7
  }
}

export function isRollingWindowKey(value: string): value is AnalyticsRollingWindowKey {
  return analyticsRollingWindowKeys.includes(value as AnalyticsRollingWindowKey)
}

function buildCountBreakdown<T extends string>(facts: AnalyticsDayFact[], selector: (fact: AnalyticsDayFact) => T): AnalyticsBreakdownDatum<T>[] {
  const counts = new Map<T, number>()

  for (const fact of facts) {
    const key = selector(fact)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()].map(([key, value]) => ({
    key,
    label: keyLabel(key),
    value,
    percent: facts.length === 0 ? 0 : round((value / facts.length) * 100),
  }))
}

function buildSourceRange(facts: AnalyticsDayFact[], fallbackDate: string) {
  if (facts.length === 0) {
    return {
      startDate: fallbackDate,
      endDate: fallbackDate,
      dayCount: 0,
    }
  }

  const sorted = [...facts].sort((left, right) => left.date.localeCompare(right.date))

  return {
    startDate: sorted[0].date,
    endDate: sorted[sorted.length - 1].date,
    dayCount: sorted.length,
  }
}

function sum<T extends keyof AnalyticsDayFact>(facts: AnalyticsDayFact[], key: T) {
  return facts.reduce((total, fact) => total + (typeof fact[key] === 'number' ? (fact[key] as number) : 0), 0)
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function round(value: number) {
  return Number(value.toFixed(1))
}

function bandLabel(band: string) {
  return keyLabel(band)
}

function keyLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase())
}
