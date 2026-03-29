import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  localCalendarSessionRepository,
  localSettingsRepository,
} from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { createDefaultCalendarConnectionSnapshot } from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'
import {
  GOOGLE_CALENDAR_READ_SCOPE,
  normalizeGoogleCalendarEventForCache,
} from '@/services/calendar/googleCalendarClient'

describe('calendar integration service', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normalizes timed and all-day Google events into Forge cache records', () => {
    const timed = normalizeGoogleCalendarEventForCache(
      {
        id: 'evt_timed',
        summary: 'Hiring sync',
        start: { dateTime: '2026-03-30T10:00:00+05:30' },
        end: { dateTime: '2026-03-30T10:30:00+05:30' },
      },
      '2026-03-30T04:00:00.000Z',
    )
    const allDay = normalizeGoogleCalendarEventForCache(
      {
        id: 'evt_day',
        summary: '[FORGE] Deep Work',
        start: { date: '2026-03-31' },
        end: { date: '2026-04-01' },
      },
      '2026-03-30T04:00:00.000Z',
    )

    expect(timed?.allDay).toBe(false)
    expect(timed?.date).toBe('2026-03-30')
    expect(allDay?.allDay).toBe(true)
    expect(allDay?.isForgeManaged).toBe(true)
    expect(allDay?.startsAt).toBe('2026-03-31T00:00:00.000Z')
  })

  it('refreshes cached events and derives calendar pressure for overlapping blocks', async () => {
    const settings = createDefaultUserSettings()
    settings.calendarIntegration = {
      ...createDefaultCalendarConnectionSnapshot(),
      connectionStatus: 'connected',
      featureGate: 'readEnabled',
      selectedCalendarIds: ['primary'],
    }
    await localSettingsRepository.upsert(settings)
    await localCalendarSessionRepository.upsert({
      id: 'default',
      provider: 'google',
      accessScope: GOOGLE_CALENDAR_READ_SCOPE,
      accessToken: 'test-token',
      grantedAt: '2026-03-30T03:00:00.000Z',
    })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'event-1',
              summary: 'Interview debrief',
              start: { dateTime: '2026-03-30T08:30:00+05:30' },
              end: { dateTime: '2026-03-30T09:00:00+05:30' },
            },
          ],
        }),
      }),
    )

    const blocks: BlockInstance[] = [
      {
        id: 'prime-block',
        templateId: 'prime-block',
        title: 'Prime Deep Block',
        kind: 'deepWork',
        status: 'planned',
        startTime: '08:00',
        endTime: '09:20',
        detail: 'Protect the top execution window.',
        focusAreas: ['systemDesign'],
        requiredOutput: true,
        optional: false,
        date: '2026-03-30',
      },
    ]

    const workspace = await googleCalendarIntegrationService.getDayWorkspace({
      date: '2026-03-30',
      blocks,
      connection: settings.calendarIntegration,
    })

    expect(workspace.syncState.externalEventSyncStatus).toBe('idle')
    expect(workspace.events).toHaveLength(1)
    expect(workspace.summary.severity).toBe('hard')
    expect(workspace.summary.overlappingEventCount).toBe(1)
  })
})
