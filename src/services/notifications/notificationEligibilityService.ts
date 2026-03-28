import { localSettingsRepository } from '@/data/local'
import { evaluateNotificationRules } from '@/domain/notifications/rules'
import { getBrowserNotificationPermissionState } from '@/services/notifications/browserNotificationService'
import { getNotificationStateWorkspace, updateNotificationPermission } from '@/services/notifications/notificationStateService'
import { buildNotificationEvaluationWorkspace } from '@/services/notifications/notificationWorkspaceService'
import { localDayInstanceRepository } from '@/data/local'

export async function evaluateCurrentNotificationCandidate(anchorDate = new Date()) {
  const [settings, dayInstances, notificationWorkspace] = await Promise.all([
    localSettingsRepository.getDefault(),
    localDayInstanceRepository.listAll(),
    getNotificationStateWorkspace(),
  ])
  const workspace = buildNotificationEvaluationWorkspace({
    settings,
    dayInstances,
    anchorDate,
  })

  const permission = getBrowserNotificationPermissionState()
  if (permission !== notificationWorkspace.state.permission) {
    await updateNotificationPermission(permission)
    notificationWorkspace.state.permission = permission
  }

  return evaluateNotificationRules({
    today: workspace.today,
    summary: workspace.summary,
    notificationState: notificationWorkspace.state,
    notificationsEnabled: settings?.notificationsEnabled ?? true,
    recentLogs: notificationWorkspace.recentLogs,
    now: anchorDate,
  })
}
