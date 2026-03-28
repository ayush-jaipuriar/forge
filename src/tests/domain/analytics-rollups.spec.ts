import { describe, expect, it } from 'vitest'
import { forgeRoutine } from '@/data/seeds'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import { deriveAnalyticsDayFact } from '@/domain/analytics/facts'
import { buildAnalyticsSummaryMetrics, buildRollingAnalyticsSnapshot, filterFactsForRollingWindow } from '@/domain/analytics/rollups'
import type { PrepTopicRecord } from '@/domain/prep/types'
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
    touchedTopicCount: 4,
    totalTopicCount: 20,
    highConfidenceTopicCount: 1,
    coveragePercent: 20,
    requiredTopicsPerWeek: 2,
    paceLevel: 'building',
    paceLabel: 'Coverage pace is building.',
  },
  domainStates: [],
  focusedDomains: [],
}

const prepTopics: PrepTopicRecord[] = [
  {
    id: 'dsa-arrays',
    domain: 'dsa',
    title: 'Arrays',
    group: 'Core',
    defaultConfidence: 'low',
    defaultExposureState: 'notStarted',
    confidence: 'high',
    exposureState: 'retention',
    readinessLevel: 'onTrack',
    revisionCount: 2,
    solvedCount: 6,
    exposureCount: 2,
    hoursSpent: 4,
  },
  {
    id: 'lld-solid',
    domain: 'lld',
    title: 'SOLID',
    group: 'Core',
    defaultConfidence: 'low',
    defaultExposureState: 'notStarted',
    confidence: 'medium',
    exposureState: 'inProgress',
    readinessLevel: 'building',
    revisionCount: 1,
    solvedCount: 1,
    exposureCount: 1,
    hoursSpent: 2,
  },
]

describe('analytics rollups', () => {
  it('derives a truthful day fact from execution state', () => {
    const baseDay = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const primeBlock = baseDay.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)
    const prepBlock = baseDay.blocks.find((block) => block.kind === 'prep')

    const executedDay = updateBlockExecutionNote(
      updateBlockStatus(updateBlockStatus(baseDay, primeBlock!.id, 'completed'), prepBlock!.id, 'completed'),
      primeBlock!.id,
      'Solved the prime DSA set.',
    )
    const scorePreview = calculateDayScorePreview(executedDay, {
      scheduledWorkout: null,
      workoutState: null,
      sleepStatus: 'met',
      readinessSnapshot,
    })

    const fact = deriveAnalyticsDayFact({
      dayInstance: executedDay,
      scorePreview,
      sleepStatus: 'met',
      sleepDurationHours: 7.8,
      workoutState: {
        date: executedDay.date,
        workoutType: 'upperA',
        label: 'Upper A',
        status: 'done',
      },
      focusedPrepDomains: ['dsa'],
    })

    expect(fact.completedBlocks).toBeGreaterThanOrEqual(2)
    expect(fact.requiredOutputsCaptured).toBe(1)
    expect(fact.workoutCompleted).toBe(true)
    expect(fact.sleepStatus).toBe('met')
    expect(fact.timeBandOutcomes.some((entry) => entry.band === 'morning' && entry.completedBlocks > 0)).toBe(true)
  })

  it('builds rolling snapshots and summary metrics from multiple day facts', () => {
    const firstDay = generateDayInstance({
      date: '2026-03-24',
      routine: forgeRoutine,
    })
    const secondDayBase = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
      dayMode: 'lowEnergy',
    })
    const primeBlock = secondDayBase.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)
    const secondDay = updateBlockStatus(secondDayBase, primeBlock!.id, 'skipped')

    const firstFact = deriveAnalyticsDayFact({
      dayInstance: firstDay,
      scorePreview: calculateDayScorePreview(firstDay, {
        scheduledWorkout: null,
        workoutState: null,
        sleepStatus: 'met',
        readinessSnapshot,
      }),
      sleepStatus: 'met',
      workoutState: {
        date: firstDay.date,
        workoutType: 'rest',
        label: 'Recovery / Flex',
        status: 'optional',
      },
      focusedPrepDomains: ['lld'],
    })
    const secondFact = deriveAnalyticsDayFact({
      dayInstance: secondDay,
      scorePreview: calculateDayScorePreview(secondDay, {
        scheduledWorkout: null,
        workoutState: null,
        sleepStatus: 'missed',
        readinessSnapshot,
      }),
      sleepStatus: 'missed',
      workoutState: {
        date: secondDay.date,
        workoutType: 'upperA',
        label: 'Upper A',
        status: 'skipped',
      },
      focusedPrepDomains: ['dsa'],
    })

    const summary = buildAnalyticsSummaryMetrics([firstFact, secondFact])
    const snapshot = buildRollingAnalyticsSnapshot({
      windowKey: '7d',
      facts: [firstFact, secondFact],
      prepTopics,
      anchorDate: '2026-03-28',
    })

    expect(summary.trackedDays).toBe(2)
    expect(summary.missedPrimeBlocks).toBe(1)
    expect(summary.sleepTargetMetDays).toBe(1)
    expect(snapshot.summaryMetrics.trackedDays).toBe(2)
    expect(snapshot.breakdowns.byDayType.length).toBeGreaterThan(0)
    expect(snapshot.breakdowns.byPrepDomain.some((entry) => entry.key === 'dsa' && entry.value > 0)).toBe(true)
  })

  it('filters facts to the requested rolling window before building snapshots', () => {
    const facts = [
      {
        date: '2026-03-10',
      },
      {
        date: '2026-03-26',
      },
      {
        date: '2026-03-28',
      },
    ] as AnalyticsDayFact[]

    const filtered = filterFactsForRollingWindow({
      facts,
      windowKey: '7d',
      anchorDate: '2026-03-28',
    })

    expect(filtered.map((fact) => fact.date)).toEqual(['2026-03-26', '2026-03-28'])
  })
})
