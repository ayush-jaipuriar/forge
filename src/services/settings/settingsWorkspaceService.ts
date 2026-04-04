import { localRestoreJobRepository, localSettingsRepository, localSyncDiagnosticsRepository } from '@/data/local'
import { isServerRestoreEligible } from '@/services/backup/backupPayloadStorage'
import { getBackupOperationsWorkspace } from '@/services/backup/backupOperationsService'
import { googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'
import { healthIntegrationService } from '@/services/health/healthIntegrationService'
import { buildOperationalDiagnosticsWorkspace } from '@/services/monitoring/operationalDiagnosticsService'
import { getNotificationStateWorkspace } from '@/services/notifications/notificationStateService'
import { getPlatformServiceWorkspace } from '@/services/platform/platformOwnershipService'

export async function getSettingsWorkspace(userId?: string | null) {
  const [settings, notificationWorkspace, backupWorkspace, recentRestoreJobs, syncDiagnostics] = await Promise.all([
    localSettingsRepository.getDefault(),
    getNotificationStateWorkspace(),
    getBackupOperationsWorkspace(userId),
    localRestoreJobRepository.listRecent(3),
    localSyncDiagnosticsRepository.getDefault(),
  ])
  const calendarWorkspace = await googleCalendarIntegrationService.getSettingsWorkspace(settings?.calendarIntegration)
  const mirroredBlockPreview = googleCalendarIntegrationService.getMirroredBlockPreview({
    blockId: 'preview-prime-deep-block',
    date: '2026-03-27',
    title: 'Prime Deep Block',
    startsAt: '2026-03-27T08:00:00+05:30',
    endsAt: '2026-03-27T09:20:00+05:30',
  })
  // Phase 3: health integration is scaffolded but not connected. The service returns
  // an honest workspace from the persisted local snapshot with a default fallback,
  // not live provider data.
  const healthWorkspace = await healthIntegrationService.getSettingsWorkspace()
  const platformServices = getPlatformServiceWorkspace()
  const operationalDiagnostics = buildOperationalDiagnosticsWorkspace({
    syncDiagnostics,
    backupOperations: backupWorkspace.operations,
    notificationState: notificationWorkspace.state,
    recentNotificationLogs: notificationWorkspace.recentLogs,
    calendarConnection: calendarWorkspace.connection,
    calendarSyncState: calendarWorkspace.syncState,
    recentRestoreJobs,
  })

  return {
    settings,
    syncDiagnostics,
    calendarConnection: calendarWorkspace.connection,
    calendarSyncState: calendarWorkspace.syncState,
    notificationState: notificationWorkspace.state,
    recentNotificationLogs: notificationWorkspace.recentLogs,
    backupOperations: backupWorkspace.operations,
    backupSource: backupWorkspace.source,
    recentBackups: backupWorkspace.recentBackups,
    serverRestoreReadyCount: userId
      ? backupWorkspace.recentBackups.filter((backup) =>
          isServerRestoreEligible({
            backup,
            userId,
          }),
        ).length
      : 0,
    latestServerRestoreReadyBackup:
      userId
        ? backupWorkspace.recentBackups.find((backup) =>
            isServerRestoreEligible({
              backup,
              userId,
            }),
          ) ?? null
        : null,
    recentRestoreJobs,
    mirroredBlockPreview,
    featureFlags: {
      readMirror: calendarWorkspace.connection.featureGate === 'readEnabled' ? 'enabled' : 'planned',
      writeMirror: calendarWorkspace.connection.featureGate === 'writeEnabled' ? 'enabled' : 'planned',
      collisionAwareRecommendations: true,
    },
    platformServices,
    calendarMirroredBlockCount: calendarWorkspace.mirroredBlockCount,
    calendarMirrorErrorCount: calendarWorkspace.mirrorErrorCount,
    healthIntegration: healthWorkspace,
    operationalDiagnostics,
  }
}
