import { deriveAnalyticsGamification } from '@/domain/analytics/gamification'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type { AnalyticsInsight, ReadinessProjectionSnapshot } from '@/domain/analytics/types'

describe('analytics gamification engine', () => {
  it('derives streak continuity and break causes from tracked facts', () => {
    const result = deriveAnalyticsGamification({
      facts: [
        createFact({ date: '2026-03-24', projectedScore: 78, completedDeepBlocks: 1, prepMinutes: 90, sleepStatus: 'met' }),
        createFact({ date: '2026-03-25', projectedScore: 74, completedDeepBlocks: 1, prepMinutes: 80, sleepStatus: 'met' }),
        createFact({
          date: '2026-03-26',
          projectedScore: 49,
          completedDeepBlocks: 0,
          prepMinutes: 20,
          missedPrimeBlock: true,
          sleepStatus: 'missed',
          workoutExpected: true,
          workoutCompleted: false,
        }),
        createFact({ date: '2026-03-27', projectedScore: 76, completedDeepBlocks: 1, prepMinutes: 75, sleepStatus: 'met' }),
      ],
      insights: [],
      projection: projection({ status: 'slipping' }),
      prepDomainBalance: [
        { key: 'dsa', label: 'DSA', value: 5, percent: 70 },
        { key: 'systemDesign', label: 'System Design', value: 1, percent: 14 },
      ],
      anchorDate: '2026-03-28',
    })

    const execution = result.streakSnapshot.activeStreaks.find((entry) => entry.category === 'execution')
    const workout = result.streakSnapshot.activeStreaks.find((entry) => entry.category === 'workout')

    expect(execution).toMatchObject({
      current: 1,
      longest: 2,
      lastBreakDate: '2026-03-26',
    })
    expect(execution?.lastBreakReason).toMatch(/prime block/i)
    expect(workout?.lastBreakReason).toMatch(/scheduled workout/i)
  })

  it('derives deficit-driven weekly missions and a non-padding momentum score', () => {
    const result = deriveAnalyticsGamification({
      facts: [
        createFact({ date: '2026-03-24', projectedScore: 62, completedDeepBlocks: 0, prepMinutes: 35, sleepStatus: 'missed', focusedPrepDomains: ['dsa'] }),
        createFact({ date: '2026-03-25', projectedScore: 68, completedDeepBlocks: 1, prepMinutes: 70, sleepStatus: 'met', workoutExpected: true, workoutCompleted: false, focusedPrepDomains: ['dsa'] }),
        createFact({ date: '2026-03-26', projectedScore: 57, completedDeepBlocks: 0, prepMinutes: 30, sleepStatus: 'missed', focusedPrepDomains: ['dsa'] }),
        createFact({ date: '2026-03-27', projectedScore: 72, completedDeepBlocks: 1, prepMinutes: 80, sleepStatus: 'met', focusedPrepDomains: ['dsa'] }),
        createFact({ date: '2026-03-28', weekday: 'saturday', dayType: 'weekendDeepWork', projectedScore: 52, completedBlocks: 1, prepMinutes: 25, completedDeepBlocks: 0, sleepStatus: 'met', focusedPrepDomains: ['dsa'] }),
      ],
      insights: [
        insight('behind-target-warning', 'warning'),
        insight('sleep-vs-prep-quality', 'warning'),
        insight('topic-neglect', 'warning'),
      ],
      projection: projection({ status: 'critical', targetSlipDays: 18 }),
      prepDomainBalance: [{ key: 'dsa', label: 'DSA', value: 7, percent: 100 }],
      anchorDate: '2026-03-28',
    })

    expect(result.missions.map((mission) => mission.kind)).toEqual(
      expect.arrayContaining(['deep-work-consistency', 'sleep-recovery', 'topic-neglect-recovery']),
    )
    expect(result.streakSnapshot.momentum.level).not.toBe('insufficientData')
    expect(result.streakSnapshot.momentum.score).toBeLessThan(80)
    expect(result.posture.label).toMatch(/recovery|rebuild|pressure/i)
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
    earnedScore: 50,
    projectedScore: 70,
    interviewPrepScore: 64,
    physicalScore: 55,
    disciplineScore: 60,
    consistencyScore: 58,
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
      {
        band: 'morning',
        completedBlocks: 2,
        skippedBlocks: 1,
        movedBlocks: 0,
        totalBlocks: 3,
      },
    ],
    ...factOverrides,
  }
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
    confidence: 'medium',
    currentReadinessLevel: 'building',
    projectedReadinessLevel: 'building',
    currentReadinessPercent: 56,
    projectedReadinessPercent: 78,
    estimatedReadyDate: '2026-06-30',
    targetSlipDays: 0,
    weeklyReadinessVelocity: 4,
    requiredWeeklyVelocity: 4,
    summary: 'Projected readiness is holding close to the target.',
    risks: [],
    curve: [],
    ...overrides,
  }
}

function insight(ruleKey: AnalyticsInsight['ruleKey'], severity: AnalyticsInsight['severity']): AnalyticsInsight {
  return {
    id: ruleKey,
    ruleKey,
    severity,
    confidence: 'medium',
    title: 'Insight',
    summary: 'Insight summary',
    supportingEvidence: [],
    sourceWindow: '30d',
    generatedAt: '2026-03-28T00:00:00.000Z',
  }
}
