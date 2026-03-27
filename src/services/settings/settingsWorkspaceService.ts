import { localSettingsRepository } from '@/data/local'
import { googleCalendarScaffoldingService } from '@/services/calendar/calendarIntegrationService'

export async function getSettingsWorkspace() {
  const settings = await localSettingsRepository.getDefault()
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
    mirroredBlockPreview,
    featureFlags: {
      readMirror: 'planned',
      writeMirror: 'planned',
      collisionAwareRecommendations: true,
    },
  }
}
