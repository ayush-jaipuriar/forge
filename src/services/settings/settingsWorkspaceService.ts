import { localRestoreJobRepository, localSettingsRepository } from '@/data/local'
import { isServerRestoreEligible } from '@/services/backup/backupPayloadStorage'
import { getBackupOperationsWorkspace } from '@/services/backup/backupOperationsService'
import { googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'
import { getNotificationStateWorkspace } from '@/services/notifications/notificationStateService'

export async function getSettingsWorkspace(userId?: string | null) {
  const [settings, notificationWorkspace, backupWorkspace, recentRestoreJobs] = await Promise.all([
    localSettingsRepository.getDefault(),
    getNotificationStateWorkspace(),
    getBackupOperationsWorkspace(userId),
    localRestoreJobRepository.listRecent(3),
  ])
  const calendarWorkspace = await googleCalendarIntegrationService.getSettingsWorkspace(settings?.calendarIntegration)
  const mirroredBlockPreview = googleCalendarIntegrationService.getMirroredBlockPreview({
    blockId: 'preview-prime-deep-block',
    date: '2026-03-27',
    title: 'Prime Deep Block',
    startsAt: '2026-03-27T08:00:00+05:30',
    endsAt: '2026-03-27T09:20:00+05:30',
  })

  return {
    settings,
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
      writeMirror: 'planned',
      collisionAwareRecommendations: true,
    },
  }
}
