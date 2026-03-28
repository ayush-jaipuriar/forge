import { queryClient } from '@/lib/query/queryClient'
import { deliverBrowserNotification } from '@/services/notifications/browserNotificationService'
import { evaluateCurrentNotificationCandidate } from '@/services/notifications/notificationEligibilityService'
import { logDeliveredNotification, logSuppressedNotification } from '@/services/notifications/notificationStateService'
import { reportMonitoringError, reportMonitoringEvent } from '@/services/monitoring/monitoringService'

export async function evaluateAndDeliverNotifications(anchorDate = new Date()) {
  const evaluation = await evaluateCurrentNotificationCandidate(anchorDate)

  if (!evaluation.candidate) {
    if (evaluation.suppressionReason) {
      await logSuppressedNotification({
        ruleKey: 'weekly-summary',
        category: 'weeklySummary',
        title: 'Notification suppressed',
        body: 'Forge evaluated notification eligibility but did not deliver.',
        suppressionReason: evaluation.suppressionReason,
      })
    }

    return evaluation
  }

  try {
    deliverBrowserNotification(evaluation.candidate)
    await logDeliveredNotification(evaluation.candidate)
    reportMonitoringEvent({
      level: 'info',
      domain: 'sync',
      action: 'notification-delivered',
      message: 'Forge delivered a browser notification.',
      metadata: {
        ruleKey: evaluation.candidate.ruleKey,
        candidateId: evaluation.candidate.id,
      },
    })
    await queryClient.invalidateQueries({ queryKey: ['settings-workspace'] })
    return evaluation
  } catch (error) {
    reportMonitoringError({
      domain: 'sync',
      action: 'notification-delivery-failed',
      message: 'Forge could not deliver the browser notification candidate.',
      error,
      metadata: {
        ruleKey: evaluation.candidate.ruleKey,
        candidateId: evaluation.candidate.id,
      },
    })
    throw error
  }
}
