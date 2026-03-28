import { getDateKey, getWeekdayFromDateKey } from '@/domain/routine/week'
import type { NotificationCategory, NotificationDeliveryWindow, NotificationLogRecord, NotificationRuleKey, NotificationStateSnapshot, NotificationSuppressionReason } from '@/domain/notifications/types'
import type { RecommendationUrgency } from '@/domain/recommendation/types'
import type { OperationalAnalyticsSummary } from '@/services/analytics/operationalAnalyticsService'
import type { ReturnTypeGetOrCreateTodayWorkspace } from '@/services/notifications/types'

export type NotificationCandidate = {
  id: string
  ruleKey: NotificationRuleKey
  category: NotificationCategory
  title: string
  body: string
  urgency: RecommendationUrgency
  deliveryWindow: NotificationDeliveryWindow
  sourceDate?: string
  sourceWeekKey?: string
}

export type NotificationEvaluation = {
  candidate: NotificationCandidate | null
  suppressionReason?: NotificationSuppressionReason
}

type NotificationRuleContext = {
  today: ReturnTypeGetOrCreateTodayWorkspace
  summary: OperationalAnalyticsSummary
  notificationState: NotificationStateSnapshot
  notificationsEnabled: boolean
  recentLogs: NotificationLogRecord[]
  now?: Date
}

export function evaluateNotificationRules(context: NotificationRuleContext): NotificationEvaluation {
  const now = context.now ?? new Date()
  const todayKey = context.today.dayInstance.date
  const deliveredToday = context.notificationState.countersByDate[todayKey]?.delivered ?? 0

  if (!context.notificationsEnabled) {
    return { candidate: null, suppressionReason: 'notifications-disabled' }
  }

  if (context.notificationState.permission !== 'granted') {
    return {
      candidate: null,
      suppressionReason:
        context.notificationState.permission === 'unsupported' ? 'unsupported-channel' : 'permission-not-granted',
    }
  }

  if (deliveredToday >= context.notificationState.dailyCap) {
    return { candidate: null, suppressionReason: 'daily-cap-reached' }
  }

  const evaluations = [evaluateMissedCriticalBlock(context, now), evaluateFallbackSuggestion(context, now), evaluateWeeklySummary(context, now)]

  for (const evaluation of evaluations) {
    if (!evaluation.candidate || evaluation.suppressionReason) {
      continue
    }

    if (hasDuplicateLog(context.recentLogs, evaluation.candidate)) {
      return { candidate: null, suppressionReason: 'duplicate' }
    }

    return evaluation
  }

  return evaluations.find((evaluation) => evaluation.suppressionReason)?.candidate
    ? { candidate: null, suppressionReason: 'duplicate' }
    : { candidate: null, suppressionReason: evaluations.find((evaluation) => evaluation.suppressionReason)?.suppressionReason ?? 'rule-not-met' }
}

function evaluateMissedCriticalBlock(context: NotificationRuleContext, now: Date): NotificationEvaluation {
  const primaryBlock = context.today.dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput) ??
    context.today.dayInstance.blocks.find((block) => block.kind === 'deepWork') ??
    null

  if (!primaryBlock || primaryBlock.status !== 'skipped') {
    return { candidate: null }
  }

  if (!['critical', 'slipping'].includes(context.today.scorePreview.warState)) {
    return { candidate: null }
  }

  return {
    candidate: {
      id: `${context.today.dayInstance.date}:missed-critical-block`,
      ruleKey: 'missed-critical-block',
      category: 'criticalBlock',
      title: 'Prime block missed',
      body: 'Forge is reading a real recovery risk now. Salvage the highest-value remaining block instead of padding the day.',
      urgency: context.today.scorePreview.warState === 'critical' ? 'critical' : 'high',
      deliveryWindow: buildImmediateWindow(now),
      sourceDate: context.today.dayInstance.date,
    },
  }
}

function evaluateFallbackSuggestion(context: NotificationRuleContext, now: Date): NotificationEvaluation {
  const suggestion = context.today.fallbackSuggestion

  if (!suggestion) {
    return { candidate: null }
  }

  return {
    candidate: {
      id: `${context.today.dayInstance.date}:${suggestion.suggestedDayMode}:fallback-mode-suggestion`,
      ruleKey: 'fallback-mode-suggestion',
      category: 'fallback',
      title: suggestion.title,
      body: suggestion.explanation,
      urgency: suggestion.urgency,
      deliveryWindow: buildImmediateWindow(now),
      sourceDate: context.today.dayInstance.date,
    },
  }
}

function evaluateWeeklySummary(context: NotificationRuleContext, now: Date): NotificationEvaluation {
  const dateKey = getDateKey(now)
  const weekday = getWeekdayFromDateKey(dateKey)
  const currentHour = now.getHours()
  const weekKey = getWeekStart(dateKey)

  if (weekday !== 'sunday' || currentHour < 18) {
    return { candidate: null }
  }

  if (context.notificationState.lastWeeklySummaryWeekKey === weekKey) {
    return { candidate: null, suppressionReason: 'duplicate' }
  }

  return {
    candidate: {
      id: `${weekKey}:weekly-summary`,
      ruleKey: 'weekly-summary',
      category: 'weeklySummary',
      title: 'Weekly Forge summary is ready',
      body: `${context.summary.coachSummary.title}. ${context.summary.projection.statusLabel}`,
      urgency: context.summary.projection.status === 'critical' ? 'high' : 'medium',
      deliveryWindow: {
        startsAt: `${dateKey}T18:00:00`,
        endsAt: `${dateKey}T22:00:00`,
      },
      sourceWeekKey: weekKey,
    },
  }
}

function buildImmediateWindow(now: Date): NotificationDeliveryWindow {
  const startsAt = now.toISOString()
  const endsAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString()

  return { startsAt, endsAt }
}

function hasDuplicateLog(logs: NotificationLogRecord[], candidate: NotificationCandidate) {
  return logs.some((log) => {
    if (log.ruleKey !== candidate.ruleKey || log.status !== 'delivered') {
      return false
    }

    if (candidate.sourceDate) {
      return log.sourceDate === candidate.sourceDate
    }

    if (candidate.sourceWeekKey) {
      return log.sourceWeekKey === candidate.sourceWeekKey
    }

    return false
  })
}

function getWeekStart(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day

  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + diff)

  return getDateKey(nextDate)
}
