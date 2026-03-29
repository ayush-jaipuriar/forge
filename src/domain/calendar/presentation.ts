import type { CalendarConnectionStatus, CalendarCollisionSeverity, CalendarSyncStateSnapshot } from '@/domain/calendar/types'

export function formatCalendarTimestamp(timestamp?: string, emptyLabel = 'Not yet synced') {
  if (!timestamp) {
    return emptyLabel
  }

  const parsed = new Date(timestamp)

  if (Number.isNaN(parsed.getTime())) {
    return emptyLabel
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

export function getCalendarStatusTone(args: {
  connectionStatus: CalendarConnectionStatus
  externalSyncStatus: CalendarSyncStateSnapshot['externalEventSyncStatus']
  mirrorSyncStatus: CalendarSyncStateSnapshot['mirrorSyncStatus']
  collisionSeverity?: CalendarCollisionSeverity
}) {
  if (args.connectionStatus !== 'connected') {
    return 'default' as const
  }

  if (args.externalSyncStatus === 'error' || args.mirrorSyncStatus === 'error') {
    return 'error' as const
  }

  if (args.externalSyncStatus === 'stale' || args.mirrorSyncStatus === 'stale') {
    return 'warning' as const
  }

  if (args.externalSyncStatus === 'syncing' || args.mirrorSyncStatus === 'syncing') {
    return 'info' as const
  }

  if (args.collisionSeverity === 'hard') {
    return 'warning' as const
  }

  if (args.collisionSeverity === 'soft') {
    return 'info' as const
  }

  return 'success' as const
}
