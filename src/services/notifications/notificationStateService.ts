import { localNotificationLogRepository, localNotificationStateRepository } from '@/data/local'
import type { NotificationCandidate } from '@/domain/notifications/rules'
import { createDefaultNotificationStateSnapshot, type NotificationLogRecord } from '@/domain/notifications/types'
import { getDateKey } from '@/domain/routine/week'

export async function getNotificationStateWorkspace() {
  const [state, recentLogs] = await Promise.all([
    localNotificationStateRepository.getDefault(),
    localNotificationLogRepository.listRecent(10),
  ])

  return {
    state: state ?? createDefaultNotificationStateSnapshot(),
    recentLogs,
  }
}

export async function updateNotificationPermission(permission: ReturnType<typeof createDefaultNotificationStateSnapshot>['permission']) {
  const current = (await localNotificationStateRepository.getDefault()) ?? createDefaultNotificationStateSnapshot()
  const next = {
    ...current,
    permission,
    updatedAt: new Date().toISOString(),
  }

  await localNotificationStateRepository.upsert(next)
  return next
}

export async function logDeliveredNotification(candidate: NotificationCandidate) {
  const current = (await localNotificationStateRepository.getDefault()) ?? createDefaultNotificationStateSnapshot()
  const dateKey = candidate.sourceDate ?? getDateKey(new Date())
  const existingCounter = current.countersByDate[dateKey] ?? {
    delivered: 0,
    suppressed: 0,
  }

  const nextState = {
    ...current,
    countersByDate: {
      ...current.countersByDate,
      [dateKey]: {
        ...existingCounter,
        delivered: existingCounter.delivered + 1,
      },
    },
    lastDeliveredAt: new Date().toISOString(),
    lastWeeklySummaryWeekKey: candidate.sourceWeekKey ?? current.lastWeeklySummaryWeekKey,
    updatedAt: new Date().toISOString(),
  }

  const record: NotificationLogRecord = {
    id: candidate.id,
    ruleKey: candidate.ruleKey,
    category: candidate.category,
    status: 'delivered',
    channel: 'browser',
    title: candidate.title,
    body: candidate.body,
    evaluatedAt: new Date().toISOString(),
    deliveredAt: new Date().toISOString(),
    sourceDate: candidate.sourceDate,
    sourceWeekKey: candidate.sourceWeekKey,
    deliveryWindow: candidate.deliveryWindow,
  }

  await Promise.all([localNotificationStateRepository.upsert(nextState), localNotificationLogRepository.upsert(record)])
  return nextState
}

export async function logSuppressedNotification(params: {
  ruleKey: NotificationLogRecord['ruleKey']
  category: NotificationLogRecord['category']
  title: string
  body: string
  suppressionReason: NonNullable<NotificationLogRecord['suppressionReason']>
  sourceDate?: string
  sourceWeekKey?: string
}) {
  const current = (await localNotificationStateRepository.getDefault()) ?? createDefaultNotificationStateSnapshot()
  const dateKey = params.sourceDate ?? getDateKey(new Date())
  const existingCounter = current.countersByDate[dateKey] ?? {
    delivered: 0,
    suppressed: 0,
  }

  const nextState = {
    ...current,
    countersByDate: {
      ...current.countersByDate,
      [dateKey]: {
        ...existingCounter,
        suppressed: existingCounter.suppressed + 1,
      },
    },
    lastEvaluatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const record: NotificationLogRecord = {
    id: crypto.randomUUID(),
    ruleKey: params.ruleKey,
    category: params.category,
    status: 'suppressed',
    channel: 'browser',
    title: params.title,
    body: params.body,
    evaluatedAt: new Date().toISOString(),
    sourceDate: params.sourceDate,
    sourceWeekKey: params.sourceWeekKey,
    suppressionReason: params.suppressionReason,
  }

  await Promise.all([localNotificationStateRepository.upsert(nextState), localNotificationLogRepository.upsert(record)])
}
