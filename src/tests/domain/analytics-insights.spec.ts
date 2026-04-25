import { evaluateAnalyticsInsights } from '@/domain/analytics/insights'
import type { AnalyticsComparisonDatum } from '@/domain/analytics/chartData'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type { AnalyticsBreakdownDatum, ReadinessProjectionSnapshot } from '@/domain/analytics/types'
import type { PrepDomainKey } from '@/domain/prep/types'

describe('analytics insights engine', () => {
  it('emits the milestone-6 rule families from explicit evidence inputs', () => {
    const result = evaluateAnalyticsInsights({
      windowKey: '30d',
      facts: [
        createFact({ date: '2026-03-22', sleepStatus: 'met', projectedScore: 78, interviewPrepScore: 80 }),
        createFact({ date: '2026-03-23', sleepStatus: 'missed', projectedScore: 52, interviewPrepScore: 54 }),
        createFact({
          date: '2026-03-29',
          weekday: 'saturday',
          dayType: 'weekendDeepWork',
          projectedScore: 42,
          completedBlocks: 1,
          timeBandOutcomes: [band('morning', 1, 3)],
        }),
        createFact({
          date: '2026-03-30',
          weekday: 'sunday',
          dayType: 'weekendConsolidation',
          projectedScore: 46,
          completedBlocks: 1,
          timeBandOutcomes: [band('morning', 1, 3)],
        }),
      ],
      prepDomainBalance: [breakdown('dsa', 'DSA', 6, 4, 80)],
      sleepPerformanceCorrelation: [
        comparison('met', 'Sleep target met', 80, 78, 3),
        comparison('missed', 'Sleep target missed', 54, 52, 3),
      ],
      workoutProductivityCorrelation: [
        comparison('workout-complete', 'Workout completed', 79, 81, 3),
        comparison('workout-missed', 'Workout drifted', 55, 58, 3),
      ],
      wfoWfhComparison: [
        comparison('wfh', 'WFH High Output', 82, 2, 4),
        comparison('wfo', 'WFO Continuity', 61, 0.5, 4),
      ],
      timeWindowPerformance: [
        comparison('morning', 'Morning', 78, 18, 8),
        comparison('evening', 'Evening', 28, 48, 8),
      ],
      projection: projection({
        status: 'slipping',
        statusLabel: 'Projection suggests the current pace is slipping.',
        projectedReadinessPercent: 71,
        targetSlipDays: 12,
        weeklyReadinessVelocity: 3.2,
        requiredWeeklyVelocity: 5.1,
        summary: 'At the current pace, readiness slips by roughly 12 day(s).',
        confidence: 'medium',
      }),
      scoreTrend: [{ value: 56 }, { value: 59 }, { value: 63 }, { value: 61 }],
      deepWorkTrend: [{ value: 2 }, { value: 2 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 1 }],
    })

    expect(result.insights.map((insight) => insight.ruleKey)).toEqual(
      expect.arrayContaining([
        'sleep-vs-prep-quality',
        'gym-vs-mental-performance',
        'topic-neglect',
        'weekend-utilization',
        'most-missed-time-window',
        'best-performing-time-window',
        'pace-prediction',
        'wfo-vs-wfh-difference',
        'deep-block-completion-trend',
        'readiness-progression-pace',
        'behind-target-warning',
      ]),
    )
  })

  it('emits a low-energy success pattern when fallback days still land useful output', () => {
    const result = evaluateAnalyticsInsights({
      windowKey: '14d',
      facts: [
        createFact({ date: '2026-03-22', dayMode: 'lowEnergy', projectedScore: 62, missedPrimeBlock: false }),
        createFact({ date: '2026-03-23', dayType: 'lowEnergy', projectedScore: 64, missedPrimeBlock: false }),
      ],
      prepDomainBalance: [breakdown('dsa', 'DSA', 2, 2, 100)],
      sleepPerformanceCorrelation: [],
      workoutProductivityCorrelation: [],
      wfoWfhComparison: [],
      timeWindowPerformance: [],
      projection: projection({ status: 'insufficientData', statusLabel: 'Need more data.', projectedReadinessPercent: 0 }),
      scoreTrend: [],
      deepWorkTrend: [],
    })

    expect(result.insights.find((insight) => insight.ruleKey === 'low-energy-success-pattern')).toMatchObject({
      severity: 'info',
    })
  })

  it('builds a coach summary from the highest-severity active insight', () => {
    const result = evaluateAnalyticsInsights({
      windowKey: '30d',
      facts: [createFact({ date: '2026-03-22' })],
      prepDomainBalance: [breakdown('dsa', 'DSA', 2, 2, 100)],
      sleepPerformanceCorrelation: [],
      workoutProductivityCorrelation: [],
      wfoWfhComparison: [],
      timeWindowPerformance: [],
      projection: projection({
        status: 'critical',
        statusLabel: 'Projection shows a meaningful target slip.',
        projectedReadinessPercent: 58,
        targetSlipDays: 35,
        weeklyReadinessVelocity: 2,
        requiredWeeklyVelocity: 6,
        summary: 'At the current pace, readiness slips badly.',
      }),
      scoreTrend: [],
      deepWorkTrend: [],
    })

    expect(result.coachSummary.severity).toBe('critical')
    expect(result.coachSummary.title).toMatch(/review needed now/i)
  })
})

function createFact(overrides: Partial<AnalyticsDayFact> & { date: string }): AnalyticsDayFact {
  const { date, ...factOverrides } = overrides

  return {
    date,
    weekday: 'friday',
    dayType: 'wfhHighOutput',
    dayMode: 'normal',
    warState: 'onTrack',
    earnedScore: 52,
    projectedScore: 62,
    interviewPrepScore: 58,
    physicalScore: 54,
    disciplineScore: 57,
    consistencyScore: 56,
    sleepStatus: 'unknown',
    sleepDurationHours: undefined,
    workoutStatus: 'scheduled',
    workoutExpected: false,
    workoutCompleted: false,
    completedBlocks: 3,
    skippedBlocks: 1,
    movedBlocks: 0,
    completedDeepBlocks: 1,
    missedPrimeBlock: false,
    requiredOutputsCaptured: 1,
    prepMinutes: 60,
    fallbackActivated: false,
    focusedPrepDomains: ['dsa'],
    timeBandOutcomes: [band('morning', 2, 3)],
    ...factOverrides,
  }
}

function band(
  bandKey: AnalyticsDayFact['timeBandOutcomes'][number]['band'],
  completedBlocks: number,
  totalBlocks: number,
) {
  return {
    band: bandKey,
    completedBlocks,
    skippedBlocks: Math.max(0, totalBlocks - completedBlocks),
    movedBlocks: 0,
    totalBlocks,
  }
}

function comparison(
  key: string,
  label: string,
  primaryValue: number,
  secondaryValue: number,
  sampleSize: number,
): AnalyticsComparisonDatum {
  return {
    key,
    label,
    primaryValue,
    secondaryValue,
    sampleSize,
    detail: `${sampleSize} sample(s).`,
  }
}

function breakdown(
  key: PrepDomainKey,
  label: string,
  value: number,
  secondaryValue: number,
  percent: number,
): AnalyticsBreakdownDatum<PrepDomainKey> {
  return { key, label, value, secondaryValue, percent }
}

function projection(overrides: Partial<ReadinessProjectionSnapshot>): ReadinessProjectionSnapshot {
  return {
    id: 'default',
    snapshotVersion: 1,
    generatedAt: '2026-03-28T00:00:00.000Z',
    targetDate: '2026-06-30',
    lastEvaluatedDate: '2026-03-28',
    status: 'onTrack',
    statusLabel: 'Projection supports the current target.',
    confidence: 'low',
    currentReadinessLevel: 'building',
    projectedReadinessLevel: 'building',
    currentReadinessPercent: 52,
    projectedReadinessPercent: 80,
    estimatedReadyDate: '2026-06-28',
    targetSlipDays: 0,
    weeklyReadinessVelocity: 4.5,
    requiredWeeklyVelocity: 4,
    summary: 'Projected readiness reaches the target.',
    risks: [],
    curve: [],
    ...overrides,
  }
}
