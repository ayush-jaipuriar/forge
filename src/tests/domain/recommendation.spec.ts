import { describe, expect, it } from 'vitest'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { calculateDayScorePreview } from '@/domain/scoring/calculateDayScorePreview'
import { getNextActionRecommendation } from '@/domain/recommendation/getNextActionRecommendation'
import type { ReadinessSnapshot } from '@/domain/readiness/types'
import { updateBlockStatus } from '@/domain/routine/mutations'

const readinessSnapshot: ReadinessSnapshot = {
  targetDate: '2026-05-31',
  daysRemaining: 50,
  pressureLabel: 'Target pressure is rising.',
  pressureLevel: 'behind',
  paceSnapshot: {
    touchedTopicCount: 0,
    totalTopicCount: 10,
    highConfidenceTopicCount: 0,
    coveragePercent: 0,
    requiredTopicsPerWeek: 2,
    paceLevel: 'behind',
    paceLabel: 'Coverage pace is behind.',
  },
  domainStates: [],
  focusedDomains: [],
}

describe('getNextActionRecommendation', () => {
  it('prioritizes the primary execution block in the morning', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const topPriorities = dayInstance.blocks.filter((block) => block.status === 'planned').slice(0, 3)
    const scorePreview = calculateDayScorePreview(dayInstance, {
      scheduledWorkout: null,
      sleepStatus: 'unknown',
      readinessSnapshot,
    })

    const recommendation = getNextActionRecommendation({
      dayInstance,
      currentBlock: dayInstance.blocks.find((block) => block.kind === 'activation') ?? null,
      topPriorities,
      scorePreview,
      readinessSnapshot,
      scheduledWorkout: null,
      sleepStatus: 'unknown',
      energyStatus: 'normal',
      currentTime: '08:15',
    })

    expect(recommendation.ruleKey).toBe('morning-primary-execution')
    expect(recommendation.actionLabel).toMatch(/prime deep block/i)
    expect(recommendation.urgency).toBe('high')
    expect(recommendation.explanation).toMatch(/before noon/i)
  })

  it('switches to stabilization guidance when the projected war-state is critical', () => {
    const baseDay = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
      dayMode: 'survival',
    })
    const salvageBlock = baseDay.blocks.find((block) => block.kind === 'prep')
    const dayInstance = updateBlockStatus(baseDay, salvageBlock!.id, 'skipped')
    const criticalReadiness = {
      ...readinessSnapshot,
      pressureLevel: 'critical' as const,
      pressureLabel: 'Target pressure is critical.',
    }
    const scorePreview = {
      earnedScore: 18,
      projectedScore: 42,
      warState: 'critical' as const,
      label: 'Critical',
      constraints: ['Prime execution was missed and the day is in a hard stabilization posture.'],
      subscores: {
        interviewPrep: 18,
        physical: 0,
        discipline: 10,
        consistency: 14,
        master: 42,
      },
      breakdown: [],
    }

    const recommendation = getNextActionRecommendation({
      dayInstance,
      currentBlock: null,
      topPriorities: [],
      scorePreview,
      readinessSnapshot: criticalReadiness,
      scheduledWorkout: null,
      workoutState: null,
      sleepStatus: 'missed',
      energyStatus: 'low',
      currentTime: '21:00',
    })

    expect(recommendation.ruleKey).toBe('critical-stabilization')
    expect(recommendation.urgency).toBe('critical')
    expect(recommendation.actionLabel).toMatch(/stabilize/i)
  })

  it('pushes toward fallback when energy is low under a full-load day mode', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
      dayMode: 'normal',
    })
    const scorePreview = calculateDayScorePreview(dayInstance, {
      scheduledWorkout: null,
      sleepStatus: 'unknown',
      readinessSnapshot,
    })

    const recommendation = getNextActionRecommendation({
      dayInstance,
      currentBlock: null,
      topPriorities: dayInstance.blocks.filter((block) => block.status === 'planned').slice(0, 3),
      scorePreview,
      readinessSnapshot,
      scheduledWorkout: null,
      workoutState: null,
      sleepStatus: 'unknown',
      energyStatus: 'low',
      currentTime: '09:30',
    })

    expect(recommendation.ruleKey).toBe('downgrade-low-energy')
    expect(recommendation.actionLabel).toMatch(/low energy mode/i)
    expect(recommendation.urgency).toBe('high')
  })

  it('moves to salvage guidance when the prime block is already missed', () => {
    const baseDay = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const primeDeepBlock = baseDay.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)
    const dayInstance = updateBlockStatus(baseDay, primeDeepBlock!.id, 'skipped')
    const scorePreview = calculateDayScorePreview(dayInstance, {
      scheduledWorkout: null,
      workoutState: null,
      sleepStatus: 'unknown',
      readinessSnapshot,
    })

    const recommendation = getNextActionRecommendation({
      dayInstance,
      currentBlock: null,
      topPriorities: dayInstance.blocks.filter((block) => block.status === 'planned'),
      scorePreview,
      readinessSnapshot,
      scheduledWorkout: null,
      workoutState: null,
      sleepStatus: 'unknown',
      energyStatus: 'normal',
      currentTime: '11:30',
    })

    expect(recommendation.ruleKey).toBe('missed-prime-salvage')
    expect(recommendation.actionLabel).toMatch(/missed prime work/i)
  })

  it('can elevate the workout when the closing window is real', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-27',
      routine: forgeRoutine,
    })
    const scorePreview = calculateDayScorePreview(dayInstance, {
      scheduledWorkout: {
        weekday: 'friday',
        dayTypes: ['wfhHighOutput'],
        workoutType: 'upperB',
        label: 'Upper B',
        status: 'scheduled',
      },
      workoutState: {
        date: '2026-03-27',
        workoutType: 'upperB',
        label: 'Upper B',
        status: 'scheduled',
      },
      sleepStatus: 'met',
      readinessSnapshot,
    })

    const recommendation = getNextActionRecommendation({
      dayInstance,
      currentBlock: null,
      topPriorities: dayInstance.blocks.filter((block) => block.status === 'planned'),
      scorePreview,
      readinessSnapshot,
      scheduledWorkout: {
        weekday: 'friday',
        dayTypes: ['wfhHighOutput'],
        workoutType: 'upperB',
        label: 'Upper B',
        status: 'scheduled',
      },
      workoutState: {
        date: '2026-03-27',
        workoutType: 'upperB',
        label: 'Upper B',
        status: 'scheduled',
      },
      sleepStatus: 'met',
      energyStatus: 'normal',
      currentTime: '18:15',
    })

    expect(recommendation.ruleKey).toBe('closing-workout-window')
    expect(recommendation.actionLabel).toMatch(/train/i)
  })
})
