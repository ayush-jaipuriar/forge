import { describe, expect, it } from 'vitest'
import { createDefaultNotificationStateSnapshot } from '@/domain/notifications/types'
import { evaluateNotificationRules } from '@/domain/notifications/rules'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'
import { getOperationalAnalyticsSummary } from '@/services/analytics/operationalAnalyticsService'

describe('notification rules', () => {
  it('suppresses notifications when browser permission is not granted', async () => {
    const [today, summary] = await Promise.all([getOrCreateTodayWorkspace(new Date('2026-03-28T08:00:00')), getOperationalAnalyticsSummary(new Date('2026-03-28T08:00:00'))])
    const state = createDefaultNotificationStateSnapshot()

    const evaluation = evaluateNotificationRules({
      today,
      summary,
      notificationState: state,
      notificationsEnabled: true,
      recentLogs: [],
      now: new Date('2026-03-28T08:00:00'),
    })

    expect(evaluation.candidate).toBeNull()
    expect(evaluation.suppressionReason).toBe('permission-not-granted')
  })

  it('creates a fallback notification candidate when Forge is already suggesting a mode downgrade', async () => {
    const [today, summary] = await Promise.all([getOrCreateTodayWorkspace(new Date('2026-03-28T08:00:00')), getOperationalAnalyticsSummary(new Date('2026-03-28T08:00:00'))])
    const state = {
      ...createDefaultNotificationStateSnapshot(),
      permission: 'granted' as const,
    }

    const degradedToday = {
      ...today,
      fallbackSuggestion: {
        suggestedDayMode: 'lowEnergy' as const,
        title: 'Shift into Low Energy mode',
        rationale: 'Support inputs are compromised.',
        explanation: 'Missed sleep or low energy means the fuller plan is no longer honest.',
        urgency: 'high' as const,
      },
    }

    const evaluation = evaluateNotificationRules({
      today: degradedToday,
      summary,
      notificationState: state,
      notificationsEnabled: true,
      recentLogs: [],
      now: new Date('2026-03-28T08:00:00'),
    })

    expect(evaluation.candidate?.ruleKey).toBe('fallback-mode-suggestion')
    expect(evaluation.candidate?.category).toBe('fallback')
  })

  it('creates the weekly summary candidate only inside the intended Sunday evening window', async () => {
    const [today, summary] = await Promise.all([getOrCreateTodayWorkspace(new Date('2026-03-29T19:00:00')), getOperationalAnalyticsSummary(new Date('2026-03-29T19:00:00'))])
    const state = {
      ...createDefaultNotificationStateSnapshot(),
      permission: 'granted' as const,
    }

    const evaluation = evaluateNotificationRules({
      today,
      summary,
      notificationState: state,
      notificationsEnabled: true,
      recentLogs: [],
      now: new Date('2026-03-29T19:00:00'),
    })

    expect(evaluation.candidate?.ruleKey).toBe('weekly-summary')
    expect(evaluation.candidate?.sourceWeekKey).toBe('2026-03-23')
  })
})
