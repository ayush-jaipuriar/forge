export const FORGE_NOTIFICATION_DAILY_CAP = 3
export const FORGE_NOTIFICATION_RULE_VERSION = 1

export const notificationRuleKeys = [
  'missed-critical-block',
  'fallback-mode-suggestion',
  'weekly-summary',
] as const
export type NotificationRuleKey = (typeof notificationRuleKeys)[number]

export const notificationCategories = ['criticalBlock', 'fallback', 'weeklySummary'] as const
export type NotificationCategory = (typeof notificationCategories)[number]

export const notificationChannels = ['browser', 'pwa'] as const
export type NotificationChannel = (typeof notificationChannels)[number]

export const notificationPermissionStates = ['unsupported', 'default', 'granted', 'denied'] as const
export type NotificationPermissionState = (typeof notificationPermissionStates)[number]

export const notificationDeliveryStatuses = [
  'eligible',
  'suppressed',
  'scheduled',
  'delivered',
  'failed',
] as const
export type NotificationDeliveryStatus = (typeof notificationDeliveryStatuses)[number]

export const notificationRunStatuses = ['scheduled', 'skipped', 'duplicate', 'failed'] as const
export type NotificationRunStatus = (typeof notificationRunStatuses)[number]

export const notificationSuppressionReasons = [
  'notifications-disabled',
  'permission-not-granted',
  'daily-cap-reached',
  'rule-not-met',
  'duplicate',
  'stale-state',
  'outside-delivery-window',
  'unsupported-channel',
  'unknown',
] as const
export type NotificationSuppressionReason = (typeof notificationSuppressionReasons)[number]

export type NotificationDeliveryWindow = {
  startsAt: string
  endsAt: string
}

export type NotificationCounterSnapshot = {
  delivered: number
  suppressed: number
}

export type NotificationStateSnapshot = {
  id: 'default'
  notificationsEnabled: boolean
  permission: NotificationPermissionState
  supportedChannels: NotificationChannel[]
  dailyCap: number
  countersByDate: Record<string, NotificationCounterSnapshot>
  lastEvaluatedAt?: string
  lastDeliveredAt?: string
  lastWeeklySummaryWeekKey?: string
  updatedAt: string
}

export type NotificationLogRecord = {
  id: string
  ruleKey: NotificationRuleKey
  category: NotificationCategory
  status: NotificationDeliveryStatus
  channel: NotificationChannel
  title: string
  body: string
  evaluatedAt: string
  scheduledFor?: string
  deliveredAt?: string
  sourceDate?: string
  sourceWeekKey?: string
  suppressionReason?: NotificationSuppressionReason
  deliveryWindow?: NotificationDeliveryWindow
}

export type NotificationRunRecord = {
  id: string
  ruleVersion: number
  status: NotificationRunStatus
  evaluatedAt: string
  sourceWindow: 'daily' | 'weekly'
  candidateId?: string
  ruleKey?: NotificationRuleKey
  suppressionReason?: NotificationSuppressionReason
  sourceDate?: string
  sourceWeekKey?: string
  summary: string
}

export function createDefaultNotificationStateSnapshot(): NotificationStateSnapshot {
  return {
    id: 'default',
    notificationsEnabled: true,
    permission: 'default',
    supportedChannels: ['browser', 'pwa'],
    dailyCap: FORGE_NOTIFICATION_DAILY_CAP,
    countersByDate: {},
    updatedAt: new Date().toISOString(),
  }
}
