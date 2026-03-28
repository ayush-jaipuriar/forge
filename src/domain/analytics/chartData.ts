import type { PrepTopicRecord } from '@/domain/prep/types'
import type { ReadinessProjectionSnapshot } from '@/domain/analytics/types'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'

export type AnalyticsCurveDatum = {
  label: string
  date: string
  value: number
  target?: number
}

export type AnalyticsComparisonDatum = {
  key: string
  label: string
  primaryValue: number
  secondaryValue?: number
  supportValue?: number
  sampleSize: number
  detail: string
}

export type AnalyticsHeatmapCell = {
  date: string
  label: string
  intensity: 0 | 1 | 2 | 3 | 4
  completionPercent: number
  score: number
  status: 'none' | 'weak' | 'steady' | 'strong'
}

export type AnalyticsStreakCalendar = {
  cells: AnalyticsHeatmapCell[]
  currentStreak: number
  longestStreak: number
  thresholdLabel: string
}

export type AnalyticsTopicHoursDatum = {
  key: string
  label: string
  domain: string
  hours: number
  readinessLabel: string
}

export function buildProjectionCurveChart(projection: ReadinessProjectionSnapshot): AnalyticsCurveDatum[] {
  if (projection.curve.length === 0) {
    return []
  }

  return projection.curve.map((point) => ({
    label: point.date.slice(5),
    date: point.date,
    value: point.readinessPercent,
    target: 85,
  }))
}

export function buildPrepTopicHoursChart(topics: PrepTopicRecord[], limit = 8): AnalyticsTopicHoursDatum[] {
  return topics
    .filter((topic) => topic.hoursSpent > 0)
    .sort((left, right) => right.hoursSpent - left.hoursSpent)
    .slice(0, limit)
    .map((topic) => ({
      key: topic.id,
      label: topic.title,
      domain: topic.domain,
      hours: round(topic.hoursSpent),
      readinessLabel: topic.readinessLevel,
    }))
}

export function buildSleepPerformanceCorrelation(facts: AnalyticsDayFact[]): AnalyticsComparisonDatum[] {
  const groups = [
    {
      key: 'met',
      label: 'Sleep target met',
      entries: facts.filter((fact) => fact.sleepStatus === 'met'),
    },
    {
      key: 'missed',
      label: 'Sleep target missed',
      entries: facts.filter((fact) => fact.sleepStatus === 'missed'),
    },
    {
      key: 'unknown',
      label: 'Sleep not logged',
      entries: facts.filter((fact) => fact.sleepStatus === 'unknown'),
    },
  ]

  return groups
    .filter((group) => group.entries.length > 0)
    .map((group) => ({
      key: group.key,
      label: group.label,
      primaryValue: average(group.entries.map((fact) => fact.interviewPrepScore)),
      secondaryValue: average(group.entries.map((fact) => fact.projectedScore)),
      supportValue: average(group.entries.map((fact) => fact.sleepDurationHours ?? 0)),
      sampleSize: group.entries.length,
      detail: `${group.entries.length} tracked day(s) in this sleep bucket.`,
    }))
}

export function hasMeaningfulSleepPerformanceComparison(data: AnalyticsComparisonDatum[]) {
  const keys = new Set(data.map((entry) => entry.key))

  return keys.has('met') && keys.has('missed')
}

export function buildWfoWfhComparison(facts: AnalyticsDayFact[]): AnalyticsComparisonDatum[] {
  const groups = [
    {
      key: 'wfh',
      label: 'WFH High Output',
      entries: facts.filter((fact) => fact.dayType === 'wfhHighOutput'),
    },
    {
      key: 'wfo',
      label: 'WFO Continuity',
      entries: facts.filter((fact) => fact.dayType === 'wfoContinuity'),
    },
  ]

  return groups
    .filter((group) => group.entries.length > 0)
    .map((group) => ({
      key: group.key,
      label: group.label,
      primaryValue: average(group.entries.map((fact) => fact.projectedScore)),
      secondaryValue: average(group.entries.map((fact) => fact.completedDeepBlocks)),
      supportValue: average(group.entries.map((fact) => getCompletionPercent(fact))),
      sampleSize: group.entries.length,
      detail: `${group.entries.length} ${group.label.toLowerCase()} day(s) in the selected window.`,
    }))
}

export function buildTimeWindowPerformance(facts: AnalyticsDayFact[]): AnalyticsComparisonDatum[] {
  const totals = new Map<
    string,
    {
      completed: number
      skipped: number
      total: number
    }
  >()

  for (const fact of facts) {
    for (const band of fact.timeBandOutcomes) {
      const current = totals.get(band.band) ?? {
        completed: 0,
        skipped: 0,
        total: 0,
      }

      totals.set(band.band, {
        completed: current.completed + band.completedBlocks,
        skipped: current.skipped + band.skippedBlocks,
        total: current.total + band.totalBlocks,
      })
    }
  }

  return [...totals.entries()]
    .map(([key, value]) => ({
      key,
      label: toLabel(key),
      primaryValue: value.total === 0 ? 0 : round((value.completed / value.total) * 100),
      secondaryValue: value.total === 0 ? 0 : round((value.skipped / value.total) * 100),
      supportValue: value.completed,
      sampleSize: value.total,
      detail: `${value.completed} completed block(s) and ${value.skipped} skipped block(s) in this time band.`,
    }))
    .sort((left, right) => right.primaryValue - left.primaryValue)
}

export function buildCompletionHeatmap(
  facts: AnalyticsDayFact[],
  anchorDate: string,
  days = 35,
): AnalyticsHeatmapCell[] {
  const factsByDate = new Map(facts.map((fact) => [fact.date, fact]))
  const cells: AnalyticsHeatmapCell[] = []

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = addDays(anchorDate, -index)
    const fact = factsByDate.get(date)

    if (!fact) {
      cells.push({
        date,
        label: date.slice(-2),
        intensity: 0,
        completionPercent: 0,
        score: 0,
        status: 'none',
      })
      continue
    }

    const completionPercent = getCompletionPercent(fact)
    cells.push({
      date,
      label: date.slice(-2),
      intensity: getIntensity(completionPercent),
      completionPercent,
      score: fact.projectedScore,
      status: getHeatmapStatus(completionPercent, fact.projectedScore),
    })
  }

  return cells
}

export function buildExecutionStreakCalendar(
  facts: AnalyticsDayFact[],
  anchorDate: string,
  days = 35,
): AnalyticsStreakCalendar {
  const cells = buildCompletionHeatmap(facts, anchorDate, days)
  const streakDates = facts
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((fact) => isStrongExecutionDay(fact))
  const currentStreak = getCurrentStreak(
    facts
      .sort((left, right) => left.date.localeCompare(right.date))
      .map((fact) => ({
        date: fact.date,
        success: isStrongExecutionDay(fact),
      })),
  )
  const longestStreak = getLongestStreak(streakDates)

  return {
    cells: cells.map((cell) => ({
      ...cell,
      status:
        cell.status === 'none'
          ? 'none'
          : isStrongExecutionCell(cell, facts)
            ? 'strong'
            : cell.score >= 55
              ? 'steady'
              : 'weak',
    })),
    currentStreak,
    longestStreak,
    thresholdLabel: 'Strong day = projected score >= 70 and no prime miss.',
  }
}

export function buildWorkoutProductivityCorrelation(facts: AnalyticsDayFact[]): AnalyticsComparisonDatum[] {
  const groups = [
    {
      key: 'workout-complete',
      label: 'Workout completed',
      entries: facts.filter((fact) => fact.workoutExpected && fact.workoutCompleted),
    },
    {
      key: 'workout-missed',
      label: 'Workout missed or pending',
      entries: facts.filter((fact) => fact.workoutExpected && !fact.workoutCompleted),
    },
  ]

  return groups
    .filter((group) => group.entries.length > 0)
    .map((group) => ({
      key: group.key,
      label: group.label,
      primaryValue: average(group.entries.map((fact) => fact.interviewPrepScore)),
      secondaryValue: average(group.entries.map((fact) => fact.projectedScore)),
      supportValue: average(group.entries.map((fact) => fact.completedDeepBlocks)),
      sampleSize: group.entries.length,
      detail: `${group.entries.length} workout-expected day(s) contributed to this comparison.`,
    }))
}

export function buildScoreTrendChart(facts: AnalyticsDayFact[], limit = 14) {
  return facts.slice(-limit).map((fact) => ({
    label: fact.date.slice(5),
    date: fact.date,
    value: fact.projectedScore,
    target: fact.earnedScore,
  }))
}

export function buildDeepBlockTrendChart(facts: AnalyticsDayFact[], limit = 14) {
  return facts.slice(-limit).map((fact) => ({
    label: fact.date.slice(5),
    date: fact.date,
    value: fact.completedDeepBlocks,
    target: round(fact.prepMinutes / 60),
  }))
}

function getCompletionPercent(fact: AnalyticsDayFact) {
  const totalBlocks = fact.timeBandOutcomes.reduce((sum, band) => sum + band.totalBlocks, 0)

  if (totalBlocks === 0) {
    return 0
  }

  return round((fact.completedBlocks / totalBlocks) * 100)
}

function getIntensity(percent: number): 0 | 1 | 2 | 3 | 4 {
  if (percent >= 85) {
    return 4
  }
  if (percent >= 70) {
    return 3
  }
  if (percent >= 50) {
    return 2
  }
  if (percent > 0) {
    return 1
  }
  return 0
}

function getHeatmapStatus(percent: number, score: number): AnalyticsHeatmapCell['status'] {
  if (percent >= 70 && score >= 70) {
    return 'strong'
  }
  if (percent >= 45 || score >= 55) {
    return 'steady'
  }
  return 'weak'
}

function isStrongExecutionDay(fact: AnalyticsDayFact) {
  return fact.projectedScore >= 70 && !fact.missedPrimeBlock
}

function isStrongExecutionCell(cell: AnalyticsHeatmapCell, facts: AnalyticsDayFact[]) {
  const fact = facts.find((entry) => entry.date === cell.date)

  if (!fact) {
    return false
  }

  return isStrongExecutionDay(fact)
}

function getCurrentStreak(days: Array<{ date: string; success: boolean }>) {
  let streak = 0

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (!days[index]?.success) {
      break
    }

    streak += 1
  }

  return streak
}

function getLongestStreak(days: boolean[]) {
  let longest = 0
  let current = 0

  for (const day of days) {
    if (day) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  }

  return longest
}

function addDays(dateKey: string, offset: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
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

function toLabel(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase())
}
