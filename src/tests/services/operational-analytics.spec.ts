import {
  buildReadinessOperationalSignals,
  buildScheduleOperationalSignals,
  buildTodayOperationalSignals,
} from '@/services/analytics/operationalAnalyticsService'
import type { AnalyticsInsight, ReadinessProjectionSnapshot, StreakEntry, WeeklyMission } from '@/domain/analytics/types'
import type { DayInstance } from '@/domain/routine/types'
import type { DayScorePreview } from '@/domain/scoring/types'
import type { ReadinessSnapshot } from '@/domain/readiness/types'

describe('operational analytics service', () => {
  it('builds Today signals from pace risk, prime-window pressure, and weekly mission focus', () => {
    const signals = buildTodayOperationalSignals({
      summary: summary({
        projection: projection({ status: 'critical', statusLabel: 'Projection shows a meaningful target slip.' }),
        missions: [mission('deep-work-consistency', 'Protect four deep-work landings')],
        streaks: [
          streak('execution', 3),
          streak('deepWork', 2),
        ],
      }),
      dayInstance: dayInstance('wfhHighOutput'),
      currentBlock: dayInstance('wfhHighOutput').blocks[0] ?? null,
      scorePreview: scorePreview('critical'),
    })

    expect(signals.map((signal) => signal.id)).toEqual(
      expect.arrayContaining(['today-behind-target', 'today-protect-window', expect.stringMatching(/^today-mission-/)]),
    )
  })

  it('builds Readiness and Schedule signals from the same shared summary', () => {
    const shared = summary({
      projection: projection({ status: 'slipping', statusLabel: 'Projection suggests the current pace is slipping.' }),
      topWarnings: [
        insight('topic-neglect', 'warning', 'Topic neglect is increasing readiness imbalance.'),
      ],
      missions: [
        mission('weekend-utilization', 'Make both weekend days count'),
        mission('wfo-continuity', 'Hold continuity on WFO days'),
      ],
    })

    const readinessSignals = buildReadinessOperationalSignals({
      summary: shared,
      readinessSnapshot: readinessSnapshot(),
      domainSummaries: [
        {
          domain: 'dsa',
          label: 'DSA',
          readinessLevel: 'building',
          topicCount: 4,
          groupCount: 2,
          primaryGroups: ['arrays'],
          touchedTopicCount: 3,
          highConfidenceCount: 1,
          hoursSpent: 6.5,
        },
        {
          domain: 'systemDesign',
          label: 'System Design',
          readinessLevel: 'behind',
          topicCount: 4,
          groupCount: 2,
          primaryGroups: ['scalability'],
          touchedTopicCount: 1,
          highConfidenceCount: 0,
          hoursSpent: 1.2,
        },
      ],
    })

    const scheduleSignals = buildScheduleOperationalSignals({
      summary: shared,
      weekDays: [
        { date: '2026-03-30', dayType: 'wfoContinuity', weekday: 'monday', dayMode: 'normal' },
        { date: '2026-04-04', dayType: 'weekendDeepWork', weekday: 'saturday', dayMode: 'normal' },
      ],
    })

    expect(readinessSignals.map((signal) => signal.id)).toEqual(
      expect.arrayContaining(['readiness-pace-risk', 'readiness-domain-neglect']),
    )
    expect(scheduleSignals.globalSignals.map((signal) => signal.id)).toContain('schedule-weekend-pressure')
    expect(scheduleSignals.daySignalsByDate['2026-03-30']?.some((signal) => signal.id.includes('wfo'))).toBe(true)
    expect(scheduleSignals.daySignalsByDate['2026-04-04']?.some((signal) => signal.id.includes('weekend'))).toBe(true)
  })
})

function summary(overrides?: Partial<{
  projection: ReadinessProjectionSnapshot
  topWarnings: AnalyticsInsight[]
  infoInsights: AnalyticsInsight[]
  streaks: StreakEntry[]
  missions: WeeklyMission[]
}>) {
  return {
    generatedAt: '2026-03-28T00:00:00.000Z',
    coachSummary: {
      title: 'Coach summary',
      summary: 'Coach summary body',
      severity: 'warning' as const,
    },
    projection: overrides?.projection ?? projection(),
    topWarnings: overrides?.topWarnings ?? [],
    infoInsights: overrides?.infoInsights ?? [],
    momentum: {
      score: 58,
      level: 'building' as const,
      label: 'Rebuild pressure',
      explanation: 'The floor is rebuilding, but it still needs more repeatable deep work and recovery wins.',
      trailingWindow: '14d' as const,
    },
    posture: {
      label: 'Rebuild Pressure',
      detail: 'The floor is stabilizing, but deficits still outrank confidence.',
      level: 'building' as const,
    },
    streaks: overrides?.streaks ?? [streak('execution', 0)],
    missions: overrides?.missions ?? [],
  }
}

function streak(category: StreakEntry['category'], current: number): StreakEntry {
  return {
    category,
    current,
    longest: current,
    lastBreakDate: '2026-03-22',
    lastBreakReason: 'Test break reason.',
  }
}

function mission(kind: WeeklyMission['kind'], title: string): WeeklyMission {
  return {
    id: `2026-03-24-${kind}`,
    weekKey: '2026-03-24',
    kind,
    title,
    description: `${title} description.`,
    rationale: `${title} rationale.`,
    unit: 'days',
    target: 4,
    progress: 1,
    priority: 'high',
    status: 'active',
    dueDate: '2026-03-30',
  }
}

function insight(
  ruleKey: AnalyticsInsight['ruleKey'],
  severity: AnalyticsInsight['severity'],
  summaryText: string,
): AnalyticsInsight {
  return {
    id: ruleKey,
    ruleKey,
    severity,
    confidence: 'medium',
    title: 'Insight title',
    summary: summaryText,
    supportingEvidence: [],
    sourceWindow: '30d',
    generatedAt: '2026-03-28T00:00:00.000Z',
  }
}

function dayInstance(dayType: DayInstance['dayType']): DayInstance {
  return {
    id: `day-${dayType}`,
    date: '2026-03-28',
    weekday: 'friday',
    dayType,
    dayMode: 'normal',
    label: 'Test Day',
    focusLabel: 'Prime execution',
    expectationSummary: ['Protect the prime execution window.'],
    blocks: [
      {
        id: 'block-1',
        templateId: 'template-1',
        title: 'Deep block',
        kind: 'deepWork',
        status: 'planned',
        startTime: '08:00',
        endTime: '09:15',
        durationMinutes: 75,
        detail: 'Meaningful output block.',
        focusAreas: ['DSA'],
        requiredOutput: true,
        optional: false,
        date: '2026-03-28',
      },
    ],
  }
}

function projection(overrides?: Partial<ReadinessProjectionSnapshot>): ReadinessProjectionSnapshot {
  return {
    id: 'default',
    snapshotVersion: 1,
    generatedAt: '2026-03-28T00:00:00.000Z',
    targetDate: '2026-05-31',
    lastEvaluatedDate: '2026-03-28',
    status: 'onTrack',
    statusLabel: 'Projection supports the current target.',
    confidence: 'medium',
    currentReadinessLevel: 'building',
    projectedReadinessLevel: 'onTrack',
    currentReadinessPercent: 58,
    projectedReadinessPercent: 82,
    estimatedReadyDate: '2026-05-29',
    targetSlipDays: 0,
    weeklyReadinessVelocity: 4.5,
    requiredWeeklyVelocity: 4,
    summary: 'Projected readiness is holding close to the target.',
    risks: [],
    curve: [],
    ...overrides,
  }
}

function scorePreview(warState: DayScorePreview['warState']): DayScorePreview {
  return {
    earnedScore: 48,
    projectedScore: 66,
    warState,
    label: 'Critical pressure',
    subscores: {
      master: 66,
      interviewPrep: 52,
      physical: 50,
      discipline: 49,
      consistency: 47,
    },
    breakdown: [],
    constraints: [],
  }
}

function readinessSnapshot(): ReadinessSnapshot {
  return {
    targetDate: '2026-05-31',
    daysRemaining: 64,
    pressureLabel: 'Target pressure is rising.',
    pressureLevel: 'behind',
    paceSnapshot: {
      touchedTopicCount: 10,
      totalTopicCount: 20,
      highConfidenceTopicCount: 4,
      coveragePercent: 50,
      requiredTopicsPerWeek: 4,
      paceLevel: 'behind',
      paceLabel: 'Coverage pace is behind.',
    },
    domainStates: [],
    focusedDomains: [],
  }
}
