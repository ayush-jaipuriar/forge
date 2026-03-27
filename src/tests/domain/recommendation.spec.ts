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
      sleepStatus: 'missed',
      energyStatus: 'low',
      currentTime: '21:00',
    })

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
      sleepStatus: 'unknown',
      energyStatus: 'low',
      currentTime: '09:30',
    })

    expect(recommendation.actionLabel).toMatch(/low energy mode/i)
    expect(recommendation.urgency).toBe('high')
  })
})
