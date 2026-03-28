import { describe, expect, it } from 'vitest'
import { buildReadinessProjectionSnapshot } from '@/domain/analytics/projections'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type { ReadinessSnapshot } from '@/domain/readiness/types'

const readinessSnapshot: ReadinessSnapshot = {
  targetDate: '2026-05-31',
  daysRemaining: 64,
  pressureLabel: 'Readiness window is active.',
  pressureLevel: 'building',
  paceSnapshot: {
    touchedTopicCount: 10,
    totalTopicCount: 20,
    highConfidenceTopicCount: 4,
    coveragePercent: 50,
    requiredTopicsPerWeek: 2,
    paceLevel: 'building',
    paceLabel: 'Coverage pace is building.',
  },
  domainStates: [],
  focusedDomains: [],
}

function createFact(partial: Partial<AnalyticsDayFact>): AnalyticsDayFact {
  return {
    date: '2026-03-28',
    weekday: 'friday',
    dayType: 'wfhHighOutput',
    dayMode: 'normal',
    warState: 'onTrack',
    earnedScore: 74,
    projectedScore: 84,
    interviewPrepScore: 18,
    physicalScore: 10,
    disciplineScore: 11,
    consistencyScore: 15,
    sleepStatus: 'met',
    workoutStatus: 'done',
    workoutExpected: true,
    workoutCompleted: true,
    completedBlocks: 4,
    skippedBlocks: 0,
    movedBlocks: 0,
    completedDeepBlocks: 1,
    missedPrimeBlock: false,
    requiredOutputsCaptured: 1,
    prepMinutes: 130,
    fallbackActivated: false,
    focusedPrepDomains: ['dsa'],
    timeBandOutcomes: [],
    ...partial,
  }
}

describe('buildReadinessProjectionSnapshot', () => {
  it('returns insufficient-data state for very small history windows', () => {
    const snapshot = buildReadinessProjectionSnapshot({
      facts: [createFact({})],
      readinessSnapshot,
      anchorDate: '2026-03-28',
    })

    expect(snapshot.status).toBe('insufficientData')
    expect(snapshot.estimatedReadyDate).toBeNull()
  })

  it('produces a projected pace and curve when there is enough behavior history', () => {
    const facts = Array.from({ length: 10 }, (_, index) =>
      createFact({
        date: `2026-03-${String(index + 10).padStart(2, '0')}`,
        prepMinutes: 120 + index * 5,
        completedDeepBlocks: index % 2 === 0 ? 1 : 0,
      }),
    )

    const snapshot = buildReadinessProjectionSnapshot({
      facts,
      readinessSnapshot,
      anchorDate: '2026-03-28',
    })

    expect(snapshot.status).not.toBe('insufficientData')
    expect(snapshot.weeklyReadinessVelocity).toBeGreaterThan(0)
    expect(snapshot.curve.length).toBeGreaterThan(0)
    expect(snapshot.summary.length).toBeGreaterThan(0)
  })
})
