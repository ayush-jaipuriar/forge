import { describe, expect, it } from 'vitest'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { updateBlockExecutionNote, updateBlockStatus } from '@/domain/routine/mutations'
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
  workoutState: null,
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
    expect(preview.earnedScore).toBe(7)
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
    expect(preview.warState).toBe('critical')
    expect(preview.constraints.length).toBeGreaterThan(0)
  })

  it('requires meaningful output capture to unlock the full deep-work weight', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const primeDeepBlock = dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)

    expect(primeDeepBlock).toBeDefined()

    const completedWithoutOutput = updateBlockStatus(dayInstance, primeDeepBlock!.id, 'completed')
    const previewWithoutOutput = calculateDayScorePreview(completedWithoutOutput, baseContext)
    const updatedDay = updateBlockExecutionNote(completedWithoutOutput, primeDeepBlock!.id, 'Solved the target graph traversal set with clean reasoning.')
    const previewWithOutput = calculateDayScorePreview(updatedDay, baseContext)

    expect(previewWithoutOutput.earnedScore).toBeLessThan(previewWithOutput.earnedScore)
    expect(previewWithOutput.earnedScore).toBeGreaterThanOrEqual(35)
    expect(previewWithOutput.projectedScore).toBe(100)
    expect(previewWithOutput.warState).toBe('dominant')
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

  it('uses actual workout completion state instead of only the seeded schedule', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-23',
      routine: forgeRoutine,
    })

    const preview = calculateDayScorePreview(dayInstance, {
      ...baseContext,
      scheduledWorkout: {
        weekday: 'monday',
        dayTypes: ['wfhHighOutput'],
        workoutType: 'upperA',
        label: 'Upper A',
        status: 'scheduled',
      },
      workoutState: {
        date: '2026-03-23',
        workoutType: 'upperA',
        label: 'Upper A',
        status: 'done',
      },
    })

    const physicalExecutionItems = preview.breakdown.filter((item) => item.key === 'physicalExecution')
    expect(physicalExecutionItems[0]?.earned).toBe(10)
  })

  it('caps earned score when low-value completions try to mask a missed prime block', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const primeDeepBlock = dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)
    const activationBlock = dayInstance.blocks.find((block) => block.kind === 'activation')

    expect(primeDeepBlock).toBeDefined()
    expect(activationBlock).toBeDefined()

    const degradedDay = updateBlockStatus(updateBlockStatus(dayInstance, activationBlock!.id, 'completed'), primeDeepBlock!.id, 'skipped')
    const preview = calculateDayScorePreview(degradedDay, baseContext)

    expect(preview.earnedScore).toBeLessThanOrEqual(54)
    expect(preview.constraints.some((constraint) => /cannot mask/i.test(constraint))).toBe(true)
  })
})
