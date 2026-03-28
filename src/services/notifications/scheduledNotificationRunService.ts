import {
  FORGE_NOTIFICATION_RULE_VERSION,
  type NotificationLogRecord,
  type NotificationRunRecord,
} from '@/domain/notifications/types'
import type { NotificationEvaluation } from '@/domain/notifications/rules'

export function buildNotificationRunRecord({
  evaluation,
  existingLog,
  evaluatedAt = new Date().toISOString(),
}: {
  evaluation: NotificationEvaluation
  existingLog?: NotificationLogRecord | null
  evaluatedAt?: string
}): NotificationRunRecord {
  if (evaluation.candidate && existingLog) {
    return {
      id: `${evaluation.candidate.id}:run:${evaluatedAt}`,
      ruleVersion: FORGE_NOTIFICATION_RULE_VERSION,
      status: 'duplicate',
      evaluatedAt,
      sourceWindow: evaluation.candidate.sourceWeekKey ? 'weekly' : 'daily',
      candidateId: evaluation.candidate.id,
      ruleKey: evaluation.candidate.ruleKey,
      sourceDate: evaluation.candidate.sourceDate,
      sourceWeekKey: evaluation.candidate.sourceWeekKey,
      summary: 'Scheduled notification evaluation found an existing candidate record and skipped duplicate scheduling.',
    }
  }

  if (evaluation.candidate) {
    return {
      id: `${evaluation.candidate.id}:run:${evaluatedAt}`,
      ruleVersion: FORGE_NOTIFICATION_RULE_VERSION,
      status: 'scheduled',
      evaluatedAt,
      sourceWindow: evaluation.candidate.sourceWeekKey ? 'weekly' : 'daily',
      candidateId: evaluation.candidate.id,
      ruleKey: evaluation.candidate.ruleKey,
      sourceDate: evaluation.candidate.sourceDate,
      sourceWeekKey: evaluation.candidate.sourceWeekKey,
      summary: 'Scheduled notification candidate was generated and persisted for later browser-facing delivery or inspection.',
    }
  }

  return {
    id: `suppressed:${evaluatedAt}`,
    ruleVersion: FORGE_NOTIFICATION_RULE_VERSION,
    status: 'skipped',
    evaluatedAt,
    sourceWindow: 'daily',
    suppressionReason: evaluation.suppressionReason ?? 'rule-not-met',
    summary: 'Scheduled notification evaluation did not generate a candidate.',
  }
}

export function buildScheduledNotificationLogRecord({
  evaluation,
  evaluatedAt = new Date().toISOString(),
}: {
  evaluation: NotificationEvaluation
  evaluatedAt?: string
}): NotificationLogRecord | null {
  if (!evaluation.candidate) {
    return null
  }

  return {
    id: evaluation.candidate.id,
    ruleKey: evaluation.candidate.ruleKey,
    category: evaluation.candidate.category,
    status: 'scheduled',
    channel: 'browser',
    title: evaluation.candidate.title,
    body: evaluation.candidate.body,
    evaluatedAt,
    scheduledFor: evaluation.candidate.deliveryWindow.startsAt,
    sourceDate: evaluation.candidate.sourceDate,
    sourceWeekKey: evaluation.candidate.sourceWeekKey,
    deliveryWindow: evaluation.candidate.deliveryWindow,
  }
}
