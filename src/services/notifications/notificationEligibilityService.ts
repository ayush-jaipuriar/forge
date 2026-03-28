import { localSettingsRepository } from '@/data/local'
import { evaluateNotificationRules } from '@/domain/notifications/rules'
import { getOperationalAnalyticsSummary } from '@/services/analytics/operationalAnalyticsService'
import { getBrowserNotificationPermissionState } from '@/services/notifications/browserNotificationService'
import { getNotificationStateWorkspace, updateNotificationPermission } from '@/services/notifications/notificationStateService'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'

export async function evaluateCurrentNotificationCandidate(anchorDate = new Date()) {
  const [settings, summary, today, notificationWorkspace] = await Promise.all([
    localSettingsRepository.getDefault(),
    getOperationalAnalyticsSummary(anchorDate),
    getOrCreateTodayWorkspace(anchorDate),
    getNotificationStateWorkspace(),
  ])

  const permission = getBrowserNotificationPermissionState()
  if (permission !== notificationWorkspace.state.permission) {
    await updateNotificationPermission(permission)
    notificationWorkspace.state.permission = permission
  }

  return evaluateNotificationRules({
    today,
    summary,
    notificationState: notificationWorkspace.state,
    notificationsEnabled: settings?.notificationsEnabled ?? true,
    recentLogs: notificationWorkspace.recentLogs,
    now: anchorDate,
  })
}
