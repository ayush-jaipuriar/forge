import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as firebaseClient from '@/lib/firebase/client'
import {
  localCalendarStateRepository,
  localCalendarSessionRepository,
  localExternalCalendarEventRepository,
  localSettingsRepository,
} from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { createDefaultCalendarConnectionSnapshot } from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { clearLocalCalendarSessionArtifacts, googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'
import {
  GOOGLE_CALENDAR_READ_SCOPE,
  normalizeGoogleCalendarEventForCache,
} from '@/services/calendar/googleCalendarClient'

describe('calendar integration service', () => {
  beforeEach(async () => {
    await resetForgeDb()
    vi.spyOn(firebaseClient, 'getFirebaseAuth').mockReturnValue({
      currentUser: {
        uid: 'user-1',
      },
    } as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

    expect(timed[0]?.allDay).toBe(false)
    expect(timed[0]?.date).toBe('2026-03-30')
    expect(allDay[0]?.allDay).toBe(true)
    expect(allDay[0]?.isForgeManaged).toBe(true)
    expect(allDay[0]?.startsAt).toBe('2026-03-31T00:00:00.000Z')
  })

  it('duplicates multi-day events across every constrained date in the cache model', () => {
    const multiDay = normalizeGoogleCalendarEventForCache(
      {
        id: 'evt_trip',
        summary: 'Travel',
        start: { date: '2026-03-31' },
        end: { date: '2026-04-02' },
      },
      '2026-03-30T04:00:00.000Z',
    )

    expect(multiDay.map((record) => record.date)).toEqual(['2026-03-31', '2026-04-01'])
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
      userId: 'user-1',
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

  it('clears stored session artifacts explicitly when requested', async () => {
    await localCalendarSessionRepository.upsert({
      id: 'default',
      userId: 'user-1',
      provider: 'google',
      accessScope: GOOGLE_CALENDAR_READ_SCOPE,
      accessToken: 'test-token',
      grantedAt: '2026-03-30T03:00:00.000Z',
    })
    await localCalendarStateRepository.upsert({
      ...createDefaultCalendarConnectionSnapshot(),
      id: 'default',
      connectionStatus: 'connected',
      featureGate: 'readEnabled',
      externalEventSyncStatus: 'idle',
      mirrorSyncStatus: 'idle',
      cachedEventCount: 1,
    })
    await localExternalCalendarEventRepository.upsertMany([
      {
        id: 'google:event-1:2026-03-30',
        provider: 'google',
        calendarId: 'primary',
        providerEventId: 'event-1',
        title: 'Interview',
        startsAt: '2026-03-30T08:30:00+05:30',
        endsAt: '2026-03-30T09:00:00+05:30',
        allDay: false,
        isForgeManaged: false,
        date: '2026-03-30',
        fetchedAt: '2026-03-30T03:10:00.000Z',
      },
    ])

    await clearLocalCalendarSessionArtifacts()

    expect(await localCalendarSessionRepository.getDefault()).toBeNull()
    expect(await localExternalCalendarEventRepository.listForDate('2026-03-30')).toHaveLength(0)
    expect((await localCalendarStateRepository.getDefault()).cachedEventCount).toBe(0)
  })
})
