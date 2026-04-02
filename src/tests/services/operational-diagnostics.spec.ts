import { describe, expect, it } from 'vitest'
import { createDefaultBackupOperationsSnapshot, type RestoreJobRecord } from '@/domain/backup/types'
import {
  createDefaultCalendarConnectionSnapshot,
  createDefaultCalendarSyncStateSnapshot,
} from '@/domain/calendar/types'
import { createDefaultNotificationStateSnapshot, type NotificationLogRecord } from '@/domain/notifications/types'
import { createDefaultSyncDiagnosticsSnapshot } from '@/domain/sync/types'
import { buildOperationalDiagnosticsWorkspace } from '@/services/monitoring/operationalDiagnosticsService'

function createRestoreJob(overrides: Partial<RestoreJobRecord> = {}): RestoreJobRecord {
  return {
    id: 'restore-1',
    schemaVersion: 1,
    status: 'applied',
    createdAt: '2026-04-02T08:00:00.000Z',
    summary: 'Restore applied successfully.',
    warnings: [],
    appliedCounts: {
      user: 0,
      settings: 1,
      dayInstances: 2,
      analyticsSnapshots: 0,
      projections: 0,
      streaks: 0,
      missions: 0,
      notificationState: 1,
      calendarState: 1,
      healthState: 0,
    },
    ...overrides,
  }
}

function buildWorkspace() {
  return buildOperationalDiagnosticsWorkspace({
    syncDiagnostics: createDefaultSyncDiagnosticsSnapshot(),
    backupOperations: createDefaultBackupOperationsSnapshot(),
    notificationState: createDefaultNotificationStateSnapshot(),
    recentNotificationLogs: [],
    calendarConnection: createDefaultCalendarConnectionSnapshot(),
    calendarSyncState: createDefaultCalendarSyncStateSnapshot(),
    recentRestoreJobs: [],
  })
}

describe('operational diagnostics workspace', () => {
  it('reports a healthy overall posture when all surfaces are calm or intentionally disconnected', () => {
    const workspace = buildWorkspace()

    expect(workspace.overallSeverity).toBe('warning')
    expect(workspace.items.find((item) => item.key === 'calendar')?.severity).toBe('healthy')
    expect(workspace.items.find((item) => item.key === 'backup')?.severity).toBe('warning')
    expect(workspace.items.find((item) => item.key === 'notifications')?.severity).toBe('warning')
  })

  it('elevates the summary to critical when sync conflicts or backup failures are visible', () => {
    const syncDiagnostics = {
      ...createDefaultSyncDiagnosticsSnapshot(),
      healthState: 'conflicted' as const,
      conflictedCount: 2,
      updatedAt: '2026-04-02T09:00:00.000Z',
    }
    const backupOperations = {
      ...createDefaultBackupOperationsSnapshot(),
      healthState: 'degraded' as const,
      latestFailureAt: '2026-04-02T09:10:00.000Z',
      latestFailureMessage: 'Retention cleanup failed for 2 payloads.',
    }

    const workspace = buildOperationalDiagnosticsWorkspace({
      syncDiagnostics,
      backupOperations,
      notificationState: {
        ...createDefaultNotificationStateSnapshot(),
        permission: 'granted',
      },
      recentNotificationLogs: [],
      calendarConnection: createDefaultCalendarConnectionSnapshot(),
      calendarSyncState: createDefaultCalendarSyncStateSnapshot(),
      recentRestoreJobs: [],
    })

    expect(workspace.overallSeverity).toBe('critical')
    expect(workspace.criticalCount).toBeGreaterThanOrEqual(2)
    expect(workspace.items.find((item) => item.key === 'sync')?.severity).toBe('critical')
    expect(workspace.items.find((item) => item.key === 'backup')?.severity).toBe('critical')
  })

  it('treats denied notification permission as a warning only when notifications remain enabled', () => {
    const notificationsEnabled = {
      ...createDefaultNotificationStateSnapshot(),
      permission: 'denied' as const,
    }
    const notificationsDisabled = {
      ...notificationsEnabled,
      notificationsEnabled: false,
    }

    const warningWorkspace = buildOperationalDiagnosticsWorkspace({
      syncDiagnostics: createDefaultSyncDiagnosticsSnapshot(),
      backupOperations: {
        ...createDefaultBackupOperationsSnapshot(),
        healthState: 'healthy',
      },
      notificationState: notificationsEnabled,
      recentNotificationLogs: [],
      calendarConnection: createDefaultCalendarConnectionSnapshot(),
      calendarSyncState: createDefaultCalendarSyncStateSnapshot(),
      recentRestoreJobs: [],
    })
    const healthyWorkspace = buildOperationalDiagnosticsWorkspace({
      syncDiagnostics: createDefaultSyncDiagnosticsSnapshot(),
      backupOperations: {
        ...createDefaultBackupOperationsSnapshot(),
        healthState: 'healthy',
      },
      notificationState: notificationsDisabled,
      recentNotificationLogs: [],
      calendarConnection: createDefaultCalendarConnectionSnapshot(),
      calendarSyncState: createDefaultCalendarSyncStateSnapshot(),
      recentRestoreJobs: [],
    })

    expect(warningWorkspace.items.find((item) => item.key === 'notifications')?.severity).toBe('warning')
    expect(healthyWorkspace.items.find((item) => item.key === 'notifications')?.severity).toBe('healthy')
  })

  it('marks connected but stale calendar state as a warning', () => {
    const calendarConnection = {
      ...createDefaultCalendarConnectionSnapshot(),
      connectionStatus: 'connected' as const,
      featureGate: 'readEnabled' as const,
      selectedCalendarIds: ['primary'],
    }
    const calendarSyncState = {
      ...createDefaultCalendarSyncStateSnapshot(),
      ...calendarConnection,
      externalEventSyncStatus: 'stale' as const,
      mirrorSyncStatus: 'idle' as const,
      lastExternalSyncAt: '2026-04-02T10:00:00.000Z',
    }

    const workspace = buildOperationalDiagnosticsWorkspace({
      syncDiagnostics: createDefaultSyncDiagnosticsSnapshot(),
      backupOperations: {
        ...createDefaultBackupOperationsSnapshot(),
        healthState: 'healthy',
      },
      notificationState: {
        ...createDefaultNotificationStateSnapshot(),
        permission: 'granted',
      },
      recentNotificationLogs: [],
      calendarConnection,
      calendarSyncState,
      recentRestoreJobs: [],
    })

    expect(workspace.items.find((item) => item.key === 'calendar')?.severity).toBe('warning')
  })

  it('surfaces partial restore jobs as warnings', () => {
    const workspace = buildOperationalDiagnosticsWorkspace({
      syncDiagnostics: createDefaultSyncDiagnosticsSnapshot(),
      backupOperations: {
        ...createDefaultBackupOperationsSnapshot(),
        healthState: 'healthy',
      },
      notificationState: {
        ...createDefaultNotificationStateSnapshot(),
        permission: 'granted',
      },
      recentNotificationLogs: [] as NotificationLogRecord[],
      calendarConnection: createDefaultCalendarConnectionSnapshot(),
      calendarSyncState: createDefaultCalendarSyncStateSnapshot(),
      recentRestoreJobs: [
        createRestoreJob({
          status: 'partial',
          summary: 'Restore applied with partial compatibility warnings.',
          warnings: ['Derived state will regenerate.'],
        }),
      ],
    })

    expect(workspace.items.find((item) => item.key === 'restore')?.severity).toBe('warning')
  })
})
