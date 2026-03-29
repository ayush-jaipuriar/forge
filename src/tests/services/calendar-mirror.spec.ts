import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as firebaseClient from '@/lib/firebase/client'
import * as googleCalendarClient from '@/services/calendar/googleCalendarClient'
import {
  localCalendarMirrorRepository,
  localCalendarSessionRepository,
  localCalendarStateRepository,
  localDayInstanceRepository,
  localSettingsRepository,
} from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { createDefaultCalendarConnectionSnapshot } from '@/domain/calendar/types'
import type { DayInstance } from '@/domain/routine/types'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'

function createDayInstance(overrides: Partial<DayInstance> = {}): DayInstance {
  return {
    id: 'day:2026-03-30',
    date: '2026-03-30',
    weekday: 'monday',
    dayType: 'wfhHighOutput',
    dayMode: 'normal',
    label: 'WFH High Output',
    focusLabel: 'Prime execution',
    expectationSummary: ['Protect the prime block.'],
    blocks: [
      {
        id: 'prime-block',
        templateId: 'prime-block',
        title: 'Prime Deep Block',
        kind: 'deepWork',
        status: 'planned',
        startTime: '08:00',
        endTime: '09:20',
        detail: 'Protect the prime work window.',
        focusAreas: ['systemDesign'],
        requiredOutput: true,
        optional: false,
        date: '2026-03-30',
      },
    ],
    ...overrides,
  }
}

describe('calendar mirror integration service', () => {
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

  it('upgrades the connection into write-enabled mirror mode', async () => {
    const settings = createDefaultUserSettings()
    await localSettingsRepository.upsert(settings)
    vi.spyOn(googleCalendarClient, 'requestGoogleCalendarSession').mockResolvedValue({
      id: 'default',
      userId: 'user-1',
      provider: 'google',
      accessScope: googleCalendarClient.GOOGLE_CALENDAR_WRITE_SCOPE,
      accessToken: 'write-token',
      grantedAt: '2026-03-30T03:00:00.000Z',
    })

    const result = await googleCalendarIntegrationService.connectWriteAccess('user-1')

    expect(result.connection.featureGate).toBe('writeEnabled')
    expect(result.connection.managedEventMode).toBe('majorBlocks')
    expect((await localCalendarStateRepository.getDefault()).mirrorSyncStatus).toBe('stale')
  })

  it('creates and later deletes mirrored major blocks through reconciliation', async () => {
    const settings = createDefaultUserSettings()
    settings.calendarIntegration = {
      ...createDefaultCalendarConnectionSnapshot(),
      connectionStatus: 'connected',
      featureGate: 'writeEnabled',
      managedEventMode: 'majorBlocks',
      selectedCalendarIds: ['primary'],
    }
    await localSettingsRepository.upsert(settings)
    await localCalendarSessionRepository.upsert({
      id: 'default',
      userId: 'user-1',
      provider: 'google',
      accessScope: googleCalendarClient.GOOGLE_CALENDAR_WRITE_SCOPE,
      accessToken: 'write-token',
      grantedAt: '2026-03-30T03:00:00.000Z',
    })
    await localDayInstanceRepository.upsert(createDayInstance())

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'gcal-event-1',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
        }),
    )

    const initial = await googleCalendarIntegrationService.syncMirrors('user-1')
    const syncedMirrors = await localCalendarMirrorRepository.listAll()

    expect(initial).toMatchObject({
      createdCount: 1,
      updatedCount: 0,
      deletedCount: 0,
      errorCount: 0,
    })
    expect(syncedMirrors[0]?.providerEventId).toBe('gcal-event-1')

    await localDayInstanceRepository.upsert(
      createDayInstance({
        blocks: [
          {
            ...createDayInstance().blocks[0],
            status: 'moved',
          },
        ],
      }),
    )

    const reconciled = await googleCalendarIntegrationService.syncMirrors('user-1')

    expect(reconciled).toMatchObject({
      createdCount: 0,
      updatedCount: 0,
      deletedCount: 1,
      errorCount: 0,
    })
    expect(await localCalendarMirrorRepository.listAll()).toHaveLength(0)
    expect((await localCalendarStateRepository.getDefault()).mirrorSyncStatus).toBe('idle')
  })
})
