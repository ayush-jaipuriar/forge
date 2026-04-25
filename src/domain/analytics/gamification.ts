import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type { AnalyticsInsight } from '@/domain/analytics/types'
import {
  createDefaultStreakSnapshot,
  type AnalyticsBreakdownDatum,
  type AnalyticsRollingWindowKey,
  type MomentumLevel,
  type MomentumSnapshot,
  type ReadinessProjectionSnapshot,
  type StreakCategory,
  type StreakEntry,
  type StreakSnapshot,
  type WeeklyMission,
  type WeeklyMissionKind,
} from '@/domain/analytics/types'
import type { PrepDomainKey } from '@/domain/prep/types'

const corePrepDomains: PrepDomainKey[] = ['dsa', 'systemDesign', 'lld', 'javaBackend']

export type DisciplinePosture = {
  label: string
  detail: string
  level: MomentumLevel
}

export function deriveAnalyticsGamification({
  facts,
  insights,
  projection,
  prepDomainBalance,
  anchorDate,
}: {
  facts: AnalyticsDayFact[]
  insights: AnalyticsInsight[]
  projection: ReadinessProjectionSnapshot
  prepDomainBalance: AnalyticsBreakdownDatum<PrepDomainKey>[]
  anchorDate: string
}): {
  streakSnapshot: StreakSnapshot
  missions: WeeklyMission[]
  posture: DisciplinePosture
} {
  if (facts.length < 4) {
    const streakSnapshot = createDefaultStreakSnapshot(anchorDate)

    return {
      streakSnapshot,
      missions: [],
      posture: getDisciplinePosture(streakSnapshot.momentum, projection),
    }
  }

  const streakSnapshot = deriveStreakSnapshot({
    facts,
    projection,
    anchorDate,
  })

  return {
    streakSnapshot,
    missions: deriveWeeklyMissions({
      facts,
      insights,
      projection,
      prepDomainBalance,
      streakSnapshot,
      anchorDate,
    }),
    posture: getDisciplinePosture(streakSnapshot.momentum, projection),
  }
}

function deriveStreakSnapshot({
  facts,
  projection,
  anchorDate,
}: {
  facts: AnalyticsDayFact[]
  projection: ReadinessProjectionSnapshot
  anchorDate: string
}): StreakSnapshot {
  const snapshot = createDefaultStreakSnapshot(anchorDate)
  const sortedFacts = [...facts].sort((left, right) => left.date.localeCompare(right.date))
  const trailingWindow: AnalyticsRollingWindowKey = sortedFacts.length >= 10 ? '14d' : '7d'

  return {
    ...snapshot,
    activeStreaks: [
      buildStreakEntry({
        category: 'execution',
        facts: sortedFacts,
        isRelevant: () => true,
        isSuccess: isStrongExecutionDay,
        getBreakReason: (fact) =>
          fact.missedPrimeBlock
            ? 'A prime block was missed.'
            : 'Projected score fell below the strong-day execution threshold.',
      }),
      buildStreakEntry({
        category: 'deepWork',
        facts: sortedFacts,
        isRelevant: isDeepWorkOpportunity,
        isSuccess: (fact) => fact.completedDeepBlocks > 0 && !fact.missedPrimeBlock,
        getBreakReason: (fact) =>
          fact.missedPrimeBlock
            ? 'The prime deep-work block was missed.'
            : 'No deep-work block landed on a day that needed one.',
      }),
      buildStreakEntry({
        category: 'prep',
        facts: sortedFacts,
        isRelevant: (fact) => fact.dayType !== 'survival',
        isSuccess: (fact) => fact.prepMinutes >= 60 || fact.interviewPrepScore >= 60,
        getBreakReason: (fact) =>
          fact.prepMinutes === 0
            ? 'No meaningful prep session landed.'
            : 'Prep volume stayed below the substantive threshold.',
      }),
      buildStreakEntry({
        category: 'workout',
        facts: sortedFacts,
        isRelevant: (fact) => fact.workoutExpected,
        isSuccess: (fact) => fact.workoutCompleted,
        getBreakReason: () => 'A scheduled workout did not complete.',
      }),
      buildStreakEntry({
        category: 'sleep',
        facts: sortedFacts,
        isRelevant: (fact) => fact.sleepStatus !== 'unknown',
        isSuccess: (fact) => fact.sleepStatus === 'met',
        getBreakReason: () => 'Sleep target was missed.',
      }),
      buildStreakEntry({
        category: 'logging',
        facts: sortedFacts,
        isRelevant: () => true,
        isSuccess: (fact) => fact.sleepStatus !== 'unknown' || fact.requiredOutputsCaptured > 0,
        getBreakReason: () => 'The daily record was too thin to keep analytics trustworthy.',
      }),
    ],
    momentum: deriveMomentumSnapshot({
      facts: sortedFacts,
      projection,
      trailingWindow,
    }),
  }
}

function buildStreakEntry({
  category,
  facts,
  isRelevant,
  isSuccess,
  getBreakReason,
}: {
  category: StreakCategory
  facts: AnalyticsDayFact[]
  isRelevant: (fact: AnalyticsDayFact) => boolean
  isSuccess: (fact: AnalyticsDayFact) => boolean
  getBreakReason: (fact: AnalyticsDayFact) => string
}): StreakEntry {
  const relevantFacts = facts.filter(isRelevant)

  if (relevantFacts.length === 0) {
    return {
      category,
      current: 0,
      longest: 0,
    }
  }

  const current = getCurrentStreak(relevantFacts, isSuccess)
  const longest = getLongestStreak(relevantFacts, isSuccess)
  const lastBreak = [...relevantFacts].reverse().find((fact) => !isSuccess(fact))

  return {
    category,
    current,
    longest,
    lastBreakDate: lastBreak?.date,
    lastBreakReason: lastBreak ? getBreakReason(lastBreak) : undefined,
  }
}

function deriveMomentumSnapshot({
  facts,
  projection,
  trailingWindow,
}: {
  facts: AnalyticsDayFact[]
  projection: ReadinessProjectionSnapshot
  trailingWindow: AnalyticsRollingWindowKey
}): MomentumSnapshot {
  const trailingFacts = facts.slice(-14)

  if (trailingFacts.length < 4) {
      return {
        score: 0,
        level: 'insufficientData',
        label: 'Observation window only',
        explanation: 'Momentum needs a wider recent sample before it becomes trustworthy.',
      trailingWindow,
    }
  }

  const trackedDays = trailingFacts.length
  const projectedScoreAverage = average(trailingFacts.map((fact) => fact.projectedScore))
  const strongExecutionRate = trailingFacts.filter(isStrongExecutionDay).length / trackedDays
  const deepWorkOpportunityFacts = trailingFacts.filter(isDeepWorkOpportunity)
  const deepWorkRate =
    deepWorkOpportunityFacts.length === 0
      ? 0.6
      : deepWorkOpportunityFacts.filter((fact) => fact.completedDeepBlocks > 0 && !fact.missedPrimeBlock).length /
        deepWorkOpportunityFacts.length
  const outputRate = trailingFacts.filter((fact) => fact.requiredOutputsCaptured > 0).length / trackedDays
  const loggedSleepFacts = trailingFacts.filter((fact) => fact.sleepStatus !== 'unknown')
  const sleepRate =
    loggedSleepFacts.length === 0 ? 0.5 : loggedSleepFacts.filter((fact) => fact.sleepStatus === 'met').length / loggedSleepFacts.length
  const workoutExpectedFacts = trailingFacts.filter((fact) => fact.workoutExpected)
  const workoutRate =
    workoutExpectedFacts.length === 0
      ? 0.7
      : workoutExpectedFacts.filter((fact) => fact.workoutCompleted).length / workoutExpectedFacts.length
  const fallbackRate = trailingFacts.filter((fact) => fact.fallbackActivated).length / trackedDays
  const primeMissRate = trailingFacts.filter((fact) => fact.missedPrimeBlock).length / trackedDays

  const score = clamp(
    round(
      projectedScoreAverage * 0.45 +
        strongExecutionRate * 25 +
        deepWorkRate * 15 +
        outputRate * 8 +
        sleepRate * 7 +
        workoutRate * 5 -
        fallbackRate * 10 -
        primeMissRate * 15,
    ),
    0,
    100,
  )
  const level = getMomentumLevel(score)

  return {
    score,
    level,
    label: getMomentumLabel(level),
    explanation: getMomentumExplanation({
      level,
      projection,
      primeMissRate,
      fallbackRate,
    }),
    trailingWindow,
  }
}

function deriveWeeklyMissions({
  facts,
  insights,
  projection,
  prepDomainBalance,
  streakSnapshot,
  anchorDate,
}: {
  facts: AnalyticsDayFact[]
  insights: AnalyticsInsight[]
  projection: ReadinessProjectionSnapshot
  prepDomainBalance: AnalyticsBreakdownDatum<PrepDomainKey>[]
  streakSnapshot: StreakSnapshot
  anchorDate: string
}): WeeklyMission[] {
  const weekKey = getWeekKey(anchorDate)
  const dueDate = addDays(weekKey, 6)
  const currentWeekFacts = facts.filter((fact) => fact.date >= weekKey && fact.date <= anchorDate)
  const insightKeys = new Set(insights.map((insight) => insight.ruleKey))
  const underweightDomains = getUnderweightDomains(prepDomainBalance)
  const weekendFacts = facts.filter((fact) => isWeekendFact(fact))
  const weekendPressure = weekendFacts.length >= 2 && average(weekendFacts.map((fact) => fact.projectedScore)) < 60
  const workoutExpectedFacts = facts.filter((fact) => fact.workoutExpected)
  const workoutMissRate =
    workoutExpectedFacts.length === 0
      ? 0
      : workoutExpectedFacts.filter((fact) => !fact.workoutCompleted).length / workoutExpectedFacts.length
  const sleepFacts = facts.filter((fact) => fact.sleepStatus !== 'unknown')
  const sleepMissRate = sleepFacts.length === 0 ? 0 : sleepFacts.filter((fact) => fact.sleepStatus === 'missed').length / sleepFacts.length
  const deepWorkStreak = findStreak(streakSnapshot, 'deepWork')
  const wfoFacts = facts.filter((fact) => fact.dayType === 'wfoContinuity')
  const wfhFacts = facts.filter((fact) => fact.dayType === 'wfhHighOutput')
  const wfoGap =
    wfoFacts.length > 0 && wfhFacts.length > 0
      ? average(wfhFacts.map((fact) => fact.projectedScore)) - average(wfoFacts.map((fact) => fact.projectedScore))
      : 0

  const candidates: Array<WeeklyMission & { score: number }> = []

  if (
    projection.status === 'critical' ||
    projection.status === 'slipping' ||
    insightKeys.has('behind-target-warning') ||
    (deepWorkStreak?.current ?? 0) < 2
  ) {
    const progress = currentWeekFacts.filter((fact) => fact.completedDeepBlocks > 0 && !fact.missedPrimeBlock).length

    candidates.push(
      mission({
        weekKey,
        dueDate,
        kind: 'deep-work-consistency',
        title: 'Protect four deep-work landings',
        description: 'Land four deep-work days this week without a prime miss so the target pace stops bleeding.',
        rationale:
          projection.status === 'critical' || projection.status === 'slipping'
            ? 'Projection risk is real, so deep-work continuity has to carry the recovery.'
            : 'The execution floor is too soft unless deep-work days start chaining together again.',
        unit: 'days',
        target: 4,
        progress,
        priority: projection.status === 'critical' || projection.status === 'slipping' ? 'high' : 'medium',
        score: projection.status === 'critical' ? 100 : projection.status === 'slipping' ? 92 : 76,
        anchorDate,
      }),
    )
  }

  if (sleepMissRate >= 0.3 || insightKeys.has('sleep-vs-prep-quality')) {
    candidates.push(
      mission({
        weekKey,
        dueDate,
        kind: 'sleep-recovery',
        title: 'Win back five sleep-target nights',
        description: 'Sleep has to stop sabotaging prep quality. Hit the target on five nights this week.',
        rationale: 'Sleep is already showing up in the analytics as a prep-quality multiplier, so this is not cosmetic recovery work.',
        unit: 'days',
        target: 5,
        progress: currentWeekFacts.filter((fact) => fact.sleepStatus === 'met').length,
        priority: projection.status === 'critical' || projection.status === 'slipping' ? 'high' : 'medium',
        score: projection.status === 'critical' ? 95 : 74,
        anchorDate,
      }),
    )
  }

  if (workoutExpectedFacts.length > 0 && (workoutMissRate >= 0.25 || insightKeys.has('gym-vs-mental-performance'))) {
    const expectedThisWeek = currentWeekFacts.filter((fact) => fact.workoutExpected).length
    candidates.push(
      mission({
        weekKey,
        dueDate,
        kind: 'workout-consistency',
        title: 'Hold workout continuity on expected days',
        description: 'Complete the scheduled training sessions instead of letting physical consistency drift when prep load rises.',
        rationale: 'Workout completion is already separating stronger prep days from weaker ones in the current evidence window.',
        unit: 'sessions',
        target: Math.max(2, Math.min(3, expectedThisWeek || 3)),
        progress: currentWeekFacts.filter((fact) => fact.workoutExpected && fact.workoutCompleted).length,
        priority: 'medium',
        score: 62,
        anchorDate,
      }),
    )
  }

  if (underweightDomains.length > 0) {
    const touchedDomains = new Set(currentWeekFacts.flatMap((fact) => fact.focusedPrepDomains))
    candidates.push(
      mission({
        weekKey,
        dueDate,
        kind: 'topic-neglect-recovery',
        title: 'Touch the underweight prep domains',
        description: `Reintroduce ${underweightDomains.join(', ')} into this week so readiness breadth stops narrowing.`,
        rationale: 'Topic neglect is a hidden readiness tax because weak domains stay invisible until interviews expose them.',
        unit: 'topics',
        target: Math.min(2, underweightDomains.length),
        progress: underweightDomains.filter((domain) => touchedDomains.has(domain)).length,
        priority: 'high',
        score: 88,
        anchorDate,
      }),
    )
  }

  if (weekendPressure || insightKeys.has('weekend-utilization')) {
    candidates.push(
      mission({
        weekKey,
        dueDate,
        kind: 'weekend-utilization',
        title: 'Make both weekend days count',
        description: 'Use the weekend as real readiness leverage, not just vague catch-up time.',
        rationale: 'The target pace assumes weekends stay useful, so soft weekends quietly create target slip.',
        unit: 'days',
        target: 2,
        progress: currentWeekFacts.filter((fact) => isWeekendFact(fact) && isUsefulWeekendDay(fact)).length,
        priority: 'medium',
        score: 58,
        anchorDate,
      }),
    )
  }

  if (wfoGap >= 10 || insightKeys.has('wfo-vs-wfh-difference')) {
    candidates.push(
      mission({
        weekKey,
        dueDate,
        kind: 'wfo-continuity',
        title: 'Hold continuity on WFO days',
        description: 'Close the WFO drop-off by keeping continuity days useful instead of surrendering them to baseline drift.',
        rationale: 'WFH strength does not help enough if WFO days keep collapsing the weekly average.',
        unit: 'days',
        target: Math.max(1, Math.min(3, currentWeekFacts.filter((fact) => fact.dayType === 'wfoContinuity').length || 2)),
        progress: currentWeekFacts.filter((fact) => fact.dayType === 'wfoContinuity' && fact.projectedScore >= 60).length,
        priority: 'medium',
        score: 54,
        anchorDate,
      }),
    )
  }

  if (candidates.length === 0) {
    candidates.push(
      mission({
        weekKey,
        dueDate,
        kind: 'deep-work-consistency',
        title: 'Protect the current execution floor',
        description: 'Keep landing deep-work days so momentum stays real instead of becoming a short-lived spike.',
        rationale: 'When no obvious deficit dominates, Forge defaults to protecting the highest-leverage behavior rather than inventing a vanity mission.',
        unit: 'days',
        target: 4,
        progress: currentWeekFacts.filter((fact) => fact.completedDeepBlocks > 0 && !fact.missedPrimeBlock).length,
        priority: 'medium',
        score: 50,
        anchorDate,
      }),
    )
  }

  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(stripMissionScore)
}

function mission({
  weekKey,
  dueDate,
  kind,
  title,
  description,
  rationale,
  unit,
  target,
  progress,
  priority,
  score,
  anchorDate,
}: {
  weekKey: string
  dueDate: string
  kind: WeeklyMissionKind
  title: string
  description: string
  rationale: string
  unit: WeeklyMission['unit']
  target: number
  progress: number
  priority: WeeklyMission['priority']
  score: number
  anchorDate: string
}): WeeklyMission & { score: number } {
  const boundedProgress = Math.max(0, Math.min(progress, target))

  return {
    id: `${weekKey}-${kind}`,
    weekKey,
    kind,
    title,
    description,
    rationale,
    unit,
    target,
    progress: boundedProgress,
    priority,
    status: boundedProgress >= target ? 'completed' : anchorDate > dueDate ? 'missed' : 'active',
    dueDate,
    score,
  }
}

function stripMissionScore(candidate: WeeklyMission & { score: number }): WeeklyMission {
  return {
    id: candidate.id,
    weekKey: candidate.weekKey,
    kind: candidate.kind,
    title: candidate.title,
    description: candidate.description,
    rationale: candidate.rationale,
    unit: candidate.unit,
    target: candidate.target,
    progress: candidate.progress,
    priority: candidate.priority,
    status: candidate.status,
    dueDate: candidate.dueDate,
  }
}

function findStreak(snapshot: StreakSnapshot, category: StreakCategory) {
  return snapshot.activeStreaks.find((entry) => entry.category === category)
}

function isStrongExecutionDay(fact: AnalyticsDayFact) {
  return fact.projectedScore >= 70 && !fact.missedPrimeBlock
}

function isDeepWorkOpportunity(fact: AnalyticsDayFact) {
  return ['wfhHighOutput', 'weekendDeepWork'].includes(fact.dayType) || fact.completedDeepBlocks > 0 || fact.missedPrimeBlock
}

function isWeekendFact(fact: AnalyticsDayFact) {
  return ['saturday', 'sunday'].includes(fact.weekday) || ['weekendDeepWork', 'weekendConsolidation'].includes(fact.dayType)
}

function isUsefulWeekendDay(fact: AnalyticsDayFact) {
  return fact.projectedScore >= 65 && getCompletionPercent(fact) >= 55
}

function getUnderweightDomains(prepDomainBalance: AnalyticsBreakdownDatum<PrepDomainKey>[]) {
  const domainValues = new Map(prepDomainBalance.map((entry) => [entry.key, entry.value]))
  const strongestValue = Math.max(0, ...prepDomainBalance.map((entry) => entry.value))

  return corePrepDomains.filter((domain) => {
    const value = domainValues.get(domain) ?? 0

    return strongestValue === 0 ? value === 0 : value < strongestValue * 0.25
  })
}

function getCompletionPercent(fact: AnalyticsDayFact) {
  const totalBlocks = fact.timeBandOutcomes.reduce((sum, band) => sum + band.totalBlocks, 0)

  if (totalBlocks === 0) {
    return 0
  }

  return round((fact.completedBlocks / totalBlocks) * 100)
}

function getCurrentStreak(facts: AnalyticsDayFact[], isSuccess: (fact: AnalyticsDayFact) => boolean) {
  let streak = 0

  for (let index = facts.length - 1; index >= 0; index -= 1) {
    if (!isSuccess(facts[index])) {
      break
    }

    streak += 1
  }

  return streak
}

function getLongestStreak(facts: AnalyticsDayFact[], isSuccess: (fact: AnalyticsDayFact) => boolean) {
  let longest = 0
  let current = 0

  for (const fact of facts) {
    if (isSuccess(fact)) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  }

  return longest
}

function getMomentumLevel(score: number): MomentumLevel {
  if (score >= 82) {
    return 'surging'
  }
  if (score >= 64) {
    return 'steady'
  }
  if (score >= 44) {
    return 'building'
  }
  return 'fragile'
}

function getMomentumLabel(level: MomentumLevel) {
  switch (level) {
    case 'surging':
      return 'Attack ready'
    case 'steady':
      return 'Momentum holding'
    case 'building':
      return 'Rebuild momentum'
    case 'fragile':
      return 'Fragile continuity'
    case 'insufficientData':
    default:
      return 'Observation window only'
  }
}

function getMomentumExplanation({
  level,
  projection,
  primeMissRate,
  fallbackRate,
}: {
  level: MomentumLevel
  projection: ReadinessProjectionSnapshot
  primeMissRate: number
  fallbackRate: number
}) {
  if (level === 'surging') {
    return projection.status === 'onTrack'
      ? 'Recent execution, recovery, and output quality are reinforcing each other.'
      : 'Recent execution is strong, but the target still needs that focus protected.'
  }

  if (level === 'steady') {
    return primeMissRate >= 0.2
      ? 'The floor is solid, but prime misses are limiting stronger momentum.'
      : 'Recent behavior is holding together without obvious collapse.'
  }

  if (level === 'building') {
    return fallbackRate >= 0.25
      ? 'Continuity is coming back, but fallback days are still doing too much of the carrying.'
      : 'The floor is rebuilding, but it still needs more repeatable deep work and recovery wins.'
  }

  return 'Momentum exists, but one soft stretch can still break continuity quickly.'
}

function getDisciplinePosture(
  momentum: MomentumSnapshot,
  projection: ReadinessProjectionSnapshot,
): DisciplinePosture {
  switch (momentum.level) {
    case 'surging':
      return {
        label: 'Attack Ready',
        detail:
          projection.status === 'onTrack'
            ? 'Recent behavior supports a real attack posture, not just a cosmetic hot streak.'
            : 'Recent behavior is strong, but the target pace still needs protection.',
        level: momentum.level,
      }
    case 'steady':
      return {
        label: 'Momentum Holding',
        detail:
          projection.status === 'critical' || projection.status === 'slipping'
            ? 'The floor is holding, but the target still needs a harder push.'
            : 'Execution quality is stable enough to sustain disciplined effort.',
        level: momentum.level,
      }
    case 'building':
      return {
        label: 'Rebuild Momentum',
        detail: 'The floor is stabilizing, but deficits still outrank confidence.',
        level: momentum.level,
      }
    case 'fragile':
      return {
        label: 'Recovery Mode',
        detail: 'Continuity exists, but the current pattern is too easy to break.',
        level: momentum.level,
      }
    case 'insufficientData':
    default:
      return {
        label: 'Observation Window',
        detail: 'Forge needs more recent evidence before posture labels become useful.',
        level: momentum.level,
      }
  }
}

function getWeekKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date.toISOString().slice(0, 10)
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
  return Math.round(value * 10) / 10
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
