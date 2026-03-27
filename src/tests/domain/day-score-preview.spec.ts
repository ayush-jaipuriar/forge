import { describe, expect, it } from 'vitest'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { updateBlockStatus } from '@/domain/routine/mutations'
import { calculateDayScorePreview } from '@/domain/scoring/calculateDayScorePreview'
import type { ReadinessSnapshot } from '@/domain/readiness/types'

const readinessSnapshot: ReadinessSnapshot = {
  targetDate: '2026-05-31',
  daysRemaining: 60,
  pressureLabel: 'Readiness window is active.',
  pressureLevel: 'building',
  paceSnapshot: {
    touchedTopicCount: 0,
    totalTopicCount: 10,
    highConfidenceTopicCount: 0,
    coveragePercent: 0,
    requiredTopicsPerWeek: 2,
    paceLevel: 'building',
    paceLabel: 'Coverage pace is building.',
  },
  domainStates: [],
  focusedDomains: [],
}

const baseContext = {
  scheduledWorkout: null,
  sleepStatus: 'unknown' as const,
  readinessSnapshot,
}

describe('calculateDayScorePreview', () => {
  it('keeps a fresh high-output day in a strong projected war-state before critical work is missed', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    const preview = calculateDayScorePreview(dayInstance, baseContext)

    expect(preview.projectedScore).toBe(100)
    expect(preview.earnedScore).toBe(0)
    expect(preview.warState).toBe('dominant')
  })

  it('drops the war-state sharply when the prime deep block is skipped', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const primeDeepBlock = dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)

    expect(primeDeepBlock).toBeDefined()

    const degradedDay = updateBlockStatus(dayInstance, primeDeepBlock!.id, 'skipped')
    const preview = calculateDayScorePreview(degradedDay, baseContext)

    expect(preview.projectedScore).toBeLessThan(70)
    expect(preview.warState).toBe('slipping')
  })

  it('rewards completed deep work immediately while keeping the remaining ceiling visible', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const primeDeepBlock = dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)

    expect(primeDeepBlock).toBeDefined()

    const updatedDay = updateBlockStatus(dayInstance, primeDeepBlock!.id, 'completed')
    const preview = calculateDayScorePreview(updatedDay, baseContext)

    expect(preview.earnedScore).toBeGreaterThanOrEqual(35)
    expect(preview.projectedScore).toBe(100)
    expect(preview.warState).toBe('dominant')
  })

  it('keeps continuity days fair by treating the primary expected prep block as the anchor work', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-24',
      routine: forgeRoutine,
    })

    const preview = calculateDayScorePreview(dayInstance, baseContext)

    expect(dayInstance.dayType).toBe('wfoContinuity')
    expect(preview.projectedScore).toBe(100)
    expect(preview.warState).toBe('dominant')
  })

  it('reflects sleep uncertainty and readiness pressure in subscores', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    const preview = calculateDayScorePreview(dayInstance, baseContext)

    expect(preview.subscores.physical).toBeGreaterThan(0)
    expect(preview.subscores.consistency).toBeGreaterThan(15)
  })
})
