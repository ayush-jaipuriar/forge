import {
  buildCompletionHeatmap,
  buildDeepBlockTrendChart,
  buildExecutionStreakCalendar,
  buildPrepTopicHoursChart,
  buildProjectionCurveChart,
  buildScoreTrendChart,
  buildSleepPerformanceCorrelation,
  hasMeaningfulSleepPerformanceComparison,
  buildTimeWindowPerformance,
  buildWfoWfhComparison,
  buildWorkoutProductivityCorrelation,
} from '@/domain/analytics/chartData'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type { PrepTopicRecord } from '@/domain/prep/types'
import type { ReadinessProjectionSnapshot } from '@/domain/analytics/types'

describe('analytics chart data', () => {
  it('builds the projected readiness curve from projection points', () => {
    const curve = buildProjectionCurveChart({
      id: 'default',
      snapshotVersion: 1,
      generatedAt: '2026-03-28T00:00:00.000Z',
      targetDate: '2026-06-30',
      lastEvaluatedDate: '2026-03-28',
      status: 'onTrack',
      statusLabel: 'Projection supports the current target.',
      confidence: 'medium',
      currentReadinessLevel: 'building',
      projectedReadinessLevel: 'onTrack',
      currentReadinessPercent: 52,
      projectedReadinessPercent: 86,
      estimatedReadyDate: '2026-06-26',
      targetSlipDays: 0,
      weeklyReadinessVelocity: 5.2,
      requiredWeeklyVelocity: 4.1,
      summary: 'Projected readiness reaches the target.',
      risks: [],
      curve: [
        { date: '2026-03-28', readinessPercent: 52, projectedScore: 66 },
        { date: '2026-04-04', readinessPercent: 57, projectedScore: 69 },
      ],
    } satisfies ReadinessProjectionSnapshot)

    expect(curve).toHaveLength(2)
    expect(curve[0]).toMatchObject({ label: '03-28', value: 52, target: 85 })
  })

  it('builds prep topic hours ordered by cumulative tracked time', () => {
    const topics = [
      createTopicRecord({ id: 'topic-a', title: 'Arrays', hoursSpent: 2.5, domain: 'dsa' }),
      createTopicRecord({ id: 'topic-b', title: 'Caching', hoursSpent: 4.25, domain: 'systemDesign' }),
      createTopicRecord({ id: 'topic-c', title: 'LLD Core', hoursSpent: 0, domain: 'lld' }),
    ]

    const chart = buildPrepTopicHoursChart(topics)

    expect(chart.map((entry) => entry.key)).toEqual(['topic-b', 'topic-a'])
    expect(chart[0]).toMatchObject({ hours: 4.3, domain: 'systemDesign' })
  })

  it('groups sleep buckets against prep and score outcomes', () => {
    const chart = buildSleepPerformanceCorrelation([
      createFact({ date: '2026-03-24', sleepStatus: 'met', interviewPrepScore: 82, projectedScore: 84 }),
      createFact({ date: '2026-03-25', sleepStatus: 'met', interviewPrepScore: 78, projectedScore: 80 }),
      createFact({ date: '2026-03-26', sleepStatus: 'missed', interviewPrepScore: 52, projectedScore: 58 }),
    ])

    expect(chart).toHaveLength(2)
    expect(chart[0]).toMatchObject({ key: 'met', primaryValue: 80, secondaryValue: 82 })
  })

  it('requires both met and missed sleep buckets before treating the comparison as meaningful', () => {
    expect(
      hasMeaningfulSleepPerformanceComparison(
        buildSleepPerformanceCorrelation([
          createFact({ date: '2026-03-24', sleepStatus: 'met', interviewPrepScore: 82 }),
          createFact({ date: '2026-03-25', sleepStatus: 'unknown', interviewPrepScore: 61 }),
        ]),
      ),
    ).toBe(false)

    expect(
      hasMeaningfulSleepPerformanceComparison(
        buildSleepPerformanceCorrelation([
          createFact({ date: '2026-03-24', sleepStatus: 'met', interviewPrepScore: 82 }),
          createFact({ date: '2026-03-25', sleepStatus: 'missed', interviewPrepScore: 51 }),
        ]),
      ),
    ).toBe(true)
  })

  it('compares WFO and WFH days using score, deep work, and completion rate', () => {
    const chart = buildWfoWfhComparison([
      createFact({ date: '2026-03-24', dayType: 'wfhHighOutput', projectedScore: 84, completedDeepBlocks: 2 }),
      createFact({ date: '2026-03-25', dayType: 'wfoContinuity', projectedScore: 60, completedDeepBlocks: 0 }),
    ])

    expect(chart.map((entry) => entry.key)).toEqual(['wfh', 'wfo'])
    expect(chart[0]?.primaryValue).toBe(84)
  })

  it('builds best-performing time-window comparisons from band outcomes', () => {
    const chart = buildTimeWindowPerformance([
      createFact({
        date: '2026-03-24',
        timeBandOutcomes: [
          { band: 'morning', completedBlocks: 3, skippedBlocks: 0, movedBlocks: 0, totalBlocks: 3 },
          { band: 'evening', completedBlocks: 0, skippedBlocks: 2, movedBlocks: 0, totalBlocks: 2 },
        ],
      }),
    ])

    expect(chart[0]).toMatchObject({ key: 'morning', primaryValue: 100, secondaryValue: 0 })
    expect(chart.at(-1)).toMatchObject({ key: 'evening', primaryValue: 0, secondaryValue: 100 })
  })

  it('builds a completion heatmap and streak calendar from daily facts', () => {
    const facts = [
      createFact({ date: '2026-03-26', projectedScore: 74, completedBlocks: 4, totalBlocks: 5, missedPrimeBlock: false }),
      createFact({ date: '2026-03-27', projectedScore: 76, completedBlocks: 4, totalBlocks: 5, missedPrimeBlock: false }),
      createFact({ date: '2026-03-28', projectedScore: 42, completedBlocks: 1, totalBlocks: 5, missedPrimeBlock: true }),
    ]

    const heatmap = buildCompletionHeatmap(facts, '2026-03-28', 3)
    const streak = buildExecutionStreakCalendar(facts, '2026-03-28', 3)

    expect(heatmap).toHaveLength(3)
    expect(heatmap[0]?.status).toBe('strong')
    expect(streak.longestStreak).toBe(2)
    expect(streak.currentStreak).toBe(0)
    expect(streak.cells[0]?.status).toBe('strong')
    expect(streak.cells[2]?.status).toBe('weak')
  })

  it('compares workout-complete days against missed workout days', () => {
    const chart = buildWorkoutProductivityCorrelation([
      createFact({
        date: '2026-03-24',
        workoutExpected: true,
        workoutCompleted: true,
        interviewPrepScore: 80,
        projectedScore: 82,
      }),
      createFact({
        date: '2026-03-25',
        workoutExpected: true,
        workoutCompleted: false,
        interviewPrepScore: 52,
        projectedScore: 58,
      }),
    ])

    expect(chart.map((entry) => entry.key)).toEqual(['workout-complete', 'workout-missed'])
    expect(chart[0]?.primaryValue).toBe(80)
  })

  it('builds score and deep-block trend series from daily facts', () => {
    const facts = [
      createFact({ date: '2026-03-27', projectedScore: 64, earnedScore: 48, completedDeepBlocks: 1, prepMinutes: 90 }),
      createFact({ date: '2026-03-28', projectedScore: 78, earnedScore: 63, completedDeepBlocks: 2, prepMinutes: 120 }),
    ]

    const scoreTrend = buildScoreTrendChart(facts)
    const deepTrend = buildDeepBlockTrendChart(facts)

    expect(scoreTrend[1]).toMatchObject({ label: '03-28', value: 78, target: 63 })
    expect(deepTrend[1]).toMatchObject({ value: 2, target: 2 })
  })
})

function createTopicRecord({
  id,
  title,
  hoursSpent,
  domain,
}: {
  id: string
  title: string
  hoursSpent: number
  domain: PrepTopicRecord['domain']
}): PrepTopicRecord {
  return {
    id,
    domain,
    title,
    group: 'Test Group',
    defaultConfidence: 'low',
    defaultExposureState: 'notStarted',
    readinessLevel: 'building',
    confidence: 'medium',
    exposureState: 'inProgress',
    revisionCount: 1,
    solvedCount: 2,
    exposureCount: 1,
    hoursSpent,
  }
}

function createFact(
  overrides: Partial<AnalyticsDayFact> & {
    date: string
    totalBlocks?: number
  },
): AnalyticsDayFact {
  const { date, totalBlocks = 5, ...factOverrides } = overrides

  return {
    date,
    weekday: 'friday',
    dayType: 'wfhHighOutput',
    dayMode: 'normal',
    warState: 'onTrack',
    earnedScore: 55,
    projectedScore: 65,
    interviewPrepScore: 60,
    physicalScore: 58,
    disciplineScore: 62,
    consistencyScore: 59,
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
    timeBandOutcomes: [
      { band: 'morning', completedBlocks: 2, skippedBlocks: 1, movedBlocks: 0, totalBlocks },
    ],
    ...factOverrides,
  }
}
