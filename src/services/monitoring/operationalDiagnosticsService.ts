import type { BackupOperationsSnapshot, RestoreJobRecord } from '@/domain/backup/types'
import type { CalendarConnectionSnapshot, CalendarSyncStateSnapshot } from '@/domain/calendar/types'
import type { NotificationLogRecord, NotificationStateSnapshot } from '@/domain/notifications/types'
import { createDefaultSyncDiagnosticsSnapshot, type SyncDiagnosticsSnapshot } from '@/domain/sync/types'

export const operationalDiagnosticSeverities = ['healthy', 'warning', 'critical'] as const
export type OperationalDiagnosticSeverity = (typeof operationalDiagnosticSeverities)[number]

export type OperationalDiagnosticItem = {
  key: 'sync' | 'backup' | 'notifications' | 'calendar' | 'restore'
  label: string
  severity: OperationalDiagnosticSeverity
  statusLabel: string
  summary: string
  owner: string
  lastObservedAt?: string
}

export type OperationalDiagnosticsWorkspace = {
  overallSeverity: OperationalDiagnosticSeverity
  headline: string
  summary: string
  criticalCount: number
  warningCount: number
  healthyCount: number
  items: OperationalDiagnosticItem[]
  blindSpots: string[]
}

function getSyncDiagnosticItem(syncDiagnostics?: SyncDiagnosticsSnapshot | null): OperationalDiagnosticItem {
  const diagnostics = syncDiagnostics ?? createDefaultSyncDiagnosticsSnapshot()

  if (diagnostics.healthState === 'conflicted' || diagnostics.healthState === 'degraded') {
    return {
      key: 'sync',
      label: 'Sync replay',
      severity: 'critical',
      statusLabel: diagnostics.healthState,
      summary:
        diagnostics.healthState === 'conflicted'
          ? `Forge has ${diagnostics.conflictedCount} open sync conflict(s) that need explicit repair before state can be trusted across devices.`
          : `Forge has ${diagnostics.failedCount} failed sync item(s); local-first changes are no longer replaying cleanly.`,
      owner: 'Browser queue + Firebase sync',
      lastObservedAt: diagnostics.lastFailedSyncAt ?? diagnostics.updatedAt,
    }
  }

  if (diagnostics.healthState === 'queued' || diagnostics.healthState === 'stale') {
    return {
      key: 'sync',
      label: 'Sync replay',
      severity: 'warning',
      statusLabel: diagnostics.healthState,
      summary:
        diagnostics.healthState === 'stale'
          ? `Forge has ${diagnostics.staleEntityCount} stale queued item(s) that have exceeded the ${diagnostics.staleThresholdMinutes}-minute freshness threshold.`
          : `Forge still has ${diagnostics.replayableCount} replayable item(s) waiting to sync.`,
      owner: 'Browser queue + Firebase sync',
      lastObservedAt: diagnostics.updatedAt,
    }
  }

  return {
    key: 'sync',
    label: 'Sync replay',
    severity: 'healthy',
    statusLabel: diagnostics.healthState,
    summary: 'Local-first state is currently replaying cleanly with no visible conflicts or stale queue items.',
    owner: 'Browser queue + Firebase sync',
    lastObservedAt: diagnostics.lastSuccessfulSyncAt ?? diagnostics.updatedAt,
  }
}

function getBackupDiagnosticItem(operations: BackupOperationsSnapshot): OperationalDiagnosticItem {
  if (operations.healthState === 'degraded' || operations.latestFailureMessage) {
    return {
      key: 'backup',
      label: 'Scheduled backup protection',
      severity: 'critical',
      statusLabel: operations.healthState,
      summary:
        operations.latestFailureMessage ??
        'Scheduled backup protection is degraded and needs operator review before launch confidence is restored.',
      owner: 'Firebase Functions + Storage',
      lastObservedAt: operations.latestFailureAt ?? operations.updatedAt,
    }
  }

  if (operations.healthState === 'stale' || operations.healthState === 'unknown') {
    return {
      key: 'backup',
      label: 'Scheduled backup protection',
      severity: 'warning',
      statusLabel: operations.healthState,
      summary:
        operations.healthState === 'stale'
          ? 'Scheduled backups have fallen behind their expected cadence, so recovery confidence is aging.'
          : 'Scheduled backup health has not been confirmed yet from live protection state.',
      owner: 'Firebase Functions + Storage',
      lastObservedAt: operations.latestSuccessfulBackupAt ?? operations.updatedAt,
    }
  }

  return {
    key: 'backup',
    label: 'Scheduled backup protection',
    severity: 'healthy',
    statusLabel: operations.healthState,
    summary: 'Scheduled backup protection is healthy and recent successful recovery data is available.',
    owner: 'Firebase Functions + Storage',
    lastObservedAt: operations.latestSuccessfulBackupAt ?? operations.updatedAt,
  }
}

function getNotificationDiagnosticItem(
  state: NotificationStateSnapshot,
  recentLogs: NotificationLogRecord[],
): OperationalDiagnosticItem {
  const failedLog = recentLogs.find((log) => log.status === 'failed')

  if (failedLog) {
    return {
      key: 'notifications',
      label: 'Notification delivery',
      severity: 'critical',
      statusLabel: 'failed',
      summary: `The latest visible notification record for ${failedLog.ruleKey} failed to deliver through the browser channel.`,
      owner: 'Browser permission + notification orchestration',
      lastObservedAt: failedLog.evaluatedAt,
    }
  }

  if (!state.notificationsEnabled) {
    return {
      key: 'notifications',
      label: 'Notification delivery',
      severity: 'healthy',
      statusLabel: 'disabled',
      summary: 'Notifications are intentionally disabled by user preference, so suppressed delivery is expected.',
      owner: 'Browser permission + notification orchestration',
      lastObservedAt: state.updatedAt,
    }
  }

  if (state.permission === 'denied' || state.permission === 'unsupported') {
    return {
      key: 'notifications',
      label: 'Notification delivery',
      severity: 'warning',
      statusLabel: state.permission,
      summary:
        state.permission === 'denied'
          ? 'Notifications are enabled in Forge, but the browser permission is denied so delivery is blocked.'
          : 'Notifications are enabled in Forge, but this browser cannot deliver the supported notification channel.',
      owner: 'Browser permission + notification orchestration',
      lastObservedAt: state.updatedAt,
    }
  }

  if (state.permission === 'default') {
    return {
      key: 'notifications',
      label: 'Notification delivery',
      severity: 'warning',
      statusLabel: 'permission pending',
      summary: 'Notifications are enabled in Forge, but browser permission has not been granted yet.',
      owner: 'Browser permission + notification orchestration',
      lastObservedAt: state.updatedAt,
    }
  }

  return {
    key: 'notifications',
    label: 'Notification delivery',
    severity: 'healthy',
    statusLabel: 'granted',
    summary: 'Browser notification permission is granted and Forge can attempt sparse operational delivery.',
    owner: 'Browser permission + notification orchestration',
    lastObservedAt: state.lastDeliveredAt ?? state.lastEvaluatedAt ?? state.updatedAt,
  }
}

function getCalendarDiagnosticItem(params: {
  connection: CalendarConnectionSnapshot
  syncState: CalendarSyncStateSnapshot
}): OperationalDiagnosticItem {
  const { connection, syncState } = params

  if (connection.connectionStatus !== 'connected') {
    return {
      key: 'calendar',
      label: 'Calendar integration',
      severity: 'healthy',
      statusLabel: 'disconnected',
      summary: 'Google Calendar is intentionally disconnected or not yet authorized, so Forge is running without external schedule pressure.',
      owner: 'Browser OAuth + Google Calendar API',
      lastObservedAt: connection.lastConnectionCheckAt,
    }
  }

  if (
    syncState.externalEventSyncStatus === 'error' ||
    syncState.mirrorSyncStatus === 'error' ||
    syncState.lastSyncError ||
    syncState.lastMirrorSyncError
  ) {
    return {
      key: 'calendar',
      label: 'Calendar integration',
      severity: 'critical',
      statusLabel: 'error',
      summary:
        syncState.lastMirrorSyncError ??
        syncState.lastSyncError ??
        'Calendar read or mirror synchronization is failing and needs operator review.',
      owner: 'Browser OAuth + Google Calendar API',
      lastObservedAt: syncState.lastMirrorSyncAt ?? syncState.lastExternalSyncAt ?? connection.lastConnectionCheckAt,
    }
  }

  if (syncState.externalEventSyncStatus === 'stale' || syncState.mirrorSyncStatus === 'stale') {
    return {
      key: 'calendar',
      label: 'Calendar integration',
      severity: 'warning',
      statusLabel: 'stale',
      summary: 'Calendar state is connected but one or more sync surfaces are stale, so collision or mirror accuracy may be drifting.',
      owner: 'Browser OAuth + Google Calendar API',
      lastObservedAt: syncState.lastMirrorSyncAt ?? syncState.lastExternalSyncAt ?? connection.lastConnectionCheckAt,
    }
  }

  return {
    key: 'calendar',
    label: 'Calendar integration',
    severity: 'healthy',
    statusLabel: 'healthy',
    summary: 'Calendar read pressure and optional major-block mirroring are connected without visible degradation.',
    owner: 'Browser OAuth + Google Calendar API',
    lastObservedAt: syncState.lastMirrorSyncAt ?? syncState.lastExternalSyncAt ?? connection.lastConnectionCheckAt,
  }
}

function getRestoreDiagnosticItem(recentRestoreJobs: RestoreJobRecord[]): OperationalDiagnosticItem {
  const latestJob = recentRestoreJobs[0]

  if (!latestJob) {
    return {
      key: 'restore',
      label: 'Restore operations',
      severity: 'healthy',
      statusLabel: 'none',
      summary: 'No recent local restore jobs have been recorded yet.',
      owner: 'Local operator action',
    }
  }

  if (latestJob.status === 'failed') {
    return {
      key: 'restore',
      label: 'Restore operations',
      severity: 'critical',
      statusLabel: latestJob.status,
      summary: latestJob.summary,
      owner: 'Local operator action',
      lastObservedAt: latestJob.completedAt ?? latestJob.createdAt,
    }
  }

  if (latestJob.status === 'partial') {
    return {
      key: 'restore',
      label: 'Restore operations',
      severity: 'warning',
      statusLabel: latestJob.status,
      summary: latestJob.summary,
      owner: 'Local operator action',
      lastObservedAt: latestJob.completedAt ?? latestJob.createdAt,
    }
  }

  return {
    key: 'restore',
    label: 'Restore operations',
    severity: 'healthy',
    statusLabel: latestJob.status,
    summary: latestJob.summary,
    owner: 'Local operator action',
    lastObservedAt: latestJob.completedAt ?? latestJob.createdAt,
  }
}

function getOverallSeverity(items: OperationalDiagnosticItem[]): OperationalDiagnosticSeverity {
  if (items.some((item) => item.severity === 'critical')) {
    return 'critical'
  }

  if (items.some((item) => item.severity === 'warning')) {
    return 'warning'
  }

  return 'healthy'
}

export function buildOperationalDiagnosticsWorkspace(input: {
  syncDiagnostics?: SyncDiagnosticsSnapshot | null
  backupOperations: BackupOperationsSnapshot
  notificationState: NotificationStateSnapshot
  recentNotificationLogs: NotificationLogRecord[]
  calendarConnection: CalendarConnectionSnapshot
  calendarSyncState: CalendarSyncStateSnapshot
  recentRestoreJobs: RestoreJobRecord[]
}): OperationalDiagnosticsWorkspace {
  const items = [
    getSyncDiagnosticItem(input.syncDiagnostics),
    getBackupDiagnosticItem(input.backupOperations),
    getNotificationDiagnosticItem(input.notificationState, input.recentNotificationLogs),
    getCalendarDiagnosticItem({
      connection: input.calendarConnection,
      syncState: input.calendarSyncState,
    }),
    getRestoreDiagnosticItem(input.recentRestoreJobs),
  ]
  const overallSeverity = getOverallSeverity(items)
  const criticalCount = items.filter((item) => item.severity === 'critical').length
  const warningCount = items.filter((item) => item.severity === 'warning').length
  const healthyCount = items.filter((item) => item.severity === 'healthy').length

  return {
    overallSeverity,
    headline:
      overallSeverity === 'critical'
        ? 'Critical launch issues need operator review'
        : overallSeverity === 'warning'
          ? 'Launch posture is usable but needs attention'
          : 'Core launch surfaces look healthy',
    summary:
      overallSeverity === 'critical'
        ? `${criticalCount} critical subsystem issue(s) are currently visible in Forge.`
        : overallSeverity === 'warning'
          ? `${warningCount} subsystem warning(s) are currently visible in Forge.`
          : 'No critical or warning-level operational diagnostics are currently visible in Forge.',
    criticalCount,
    warningCount,
    healthyCount,
    items,
    blindSpots: [
      'Firebase Functions runtime logs still require Firebase Console or CLI inspection; Forge only surfaces downstream symptoms in-app.',
      'Browser notification delivery cannot confirm whether the operating system actually displayed a notification after the browser accepted it.',
    ],
  }
}
