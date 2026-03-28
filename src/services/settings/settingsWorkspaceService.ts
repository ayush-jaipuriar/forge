import { localRestoreJobRepository, localSettingsRepository } from '@/data/local'
import { getBackupOperationsWorkspace } from '@/services/backup/backupOperationsService'
import { googleCalendarScaffoldingService } from '@/services/calendar/calendarIntegrationService'
import { getNotificationStateWorkspace } from '@/services/notifications/notificationStateService'

export async function getSettingsWorkspace(userId?: string | null) {
  const [settings, notificationWorkspace, backupWorkspace, recentRestoreJobs] = await Promise.all([
    localSettingsRepository.getDefault(),
    getNotificationStateWorkspace(),
    getBackupOperationsWorkspace(userId),
    localRestoreJobRepository.listRecent(3),
  ])
  const calendarConnection = await googleCalendarScaffoldingService.getConnectionSnapshot(settings?.calendarIntegration)
  const mirroredBlockPreview = googleCalendarScaffoldingService.getMirroredBlockPreview({
    blockId: 'preview-prime-deep-block',
    date: '2026-03-27',
    title: 'Prime Deep Block',
    startsAt: '2026-03-27T08:00:00+05:30',
    endsAt: '2026-03-27T09:20:00+05:30',
  })

  return {
    settings,
    calendarConnection,
    notificationState: notificationWorkspace.state,
    recentNotificationLogs: notificationWorkspace.recentLogs,
    backupOperations: backupWorkspace.operations,
    backupSource: backupWorkspace.source,
    recentBackups: backupWorkspace.recentBackups,
    recentRestoreJobs,
    mirroredBlockPreview,
    featureFlags: {
      readMirror: 'planned',
      writeMirror: 'planned',
      collisionAwareRecommendations: true,
    },
  }
}
