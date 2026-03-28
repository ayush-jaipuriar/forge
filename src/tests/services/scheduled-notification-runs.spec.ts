import { describe, expect, it } from 'vitest'
import { buildNotificationRunRecord, buildScheduledNotificationLogRecord } from '@/services/notifications/scheduledNotificationRunService'

describe('scheduled notification run helpers', () => {
  it('creates a scheduled run and scheduled log for a fresh candidate', () => {
    const evaluation = {
      candidate: {
        id: '2026-03-29:weekly-summary',
        ruleKey: 'weekly-summary' as const,
        category: 'weeklySummary' as const,
        title: 'Weekly Forge summary is ready',
        body: 'The week needs review.',
        urgency: 'medium' as const,
        deliveryWindow: {
          startsAt: '2026-03-29T18:00:00.000Z',
          endsAt: '2026-03-29T22:00:00.000Z',
        },
        sourceWeekKey: '2026-03-23',
      },
    }

    const run = buildNotificationRunRecord({
      evaluation,
      evaluatedAt: '2026-03-29T18:05:00.000Z',
    })
    const log = buildScheduledNotificationLogRecord({
      evaluation,
      evaluatedAt: '2026-03-29T18:05:00.000Z',
    })

    expect(run.status).toBe('scheduled')
    expect(run.ruleVersion).toBe(1)
    expect(log?.status).toBe('scheduled')
    expect(log?.scheduledFor).toBe('2026-03-29T18:00:00.000Z')
  })

  it('marks duplicate scheduled candidates explicitly instead of creating another run', () => {
    const evaluation = {
      candidate: {
        id: 'candidate-1',
        ruleKey: 'fallback-mode-suggestion' as const,
        category: 'fallback' as const,
        title: 'Shift into Low Energy mode',
        body: 'Fallback is justified.',
        urgency: 'high' as const,
        deliveryWindow: {
          startsAt: '2026-03-28T08:00:00.000Z',
          endsAt: '2026-03-28T08:30:00.000Z',
        },
        sourceDate: '2026-03-28',
      },
    }

    const run = buildNotificationRunRecord({
      evaluation,
      existingLog: {
        id: 'candidate-1',
        ruleKey: 'fallback-mode-suggestion',
        category: 'fallback',
        status: 'scheduled',
        channel: 'browser',
        title: 'Shift into Low Energy mode',
        body: 'Fallback is justified.',
        evaluatedAt: '2026-03-28T08:00:00.000Z',
        sourceDate: '2026-03-28',
      },
      evaluatedAt: '2026-03-28T08:05:00.000Z',
    })

    expect(run.status).toBe('duplicate')
    expect(run.candidateId).toBe('candidate-1')
  })

  it('records skipped runs with suppression metadata when no candidate is eligible', () => {
    const run = buildNotificationRunRecord({
      evaluation: {
        candidate: null,
        suppressionReason: 'rule-not-met',
      },
      evaluatedAt: '2026-03-28T08:05:00.000Z',
    })

    expect(run.status).toBe('skipped')
    expect(run.suppressionReason).toBe('rule-not-met')
  })
})
