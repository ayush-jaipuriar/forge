import type { NotificationCandidate } from '@/domain/notifications/rules'
import type { NotificationPermissionState } from '@/domain/notifications/types'

export function getBrowserNotificationPermissionState(): NotificationPermissionState {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported'
  }

  return Notification.permission
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported'
  }

  const permission = await Notification.requestPermission()
  return permission
}

export function deliverBrowserNotification(candidate: NotificationCandidate) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return null
  }

  return new Notification(candidate.title, {
    body: candidate.body,
    tag: candidate.id,
    badge: '/icon-192.png',
    icon: '/icon-192.png',
  })
}
