import { beforeEach, describe, expect, it, vi } from 'vitest'

const firestoreDayGetByDateMock = vi.hoisted(() => vi.fn())
const firestoreDayGetByDatesMock = vi.hoisted(() => vi.fn())
const firestoreDayUpsertMock = vi.hoisted(() => vi.fn())
const firestoreSettingsGetDefaultMock = vi.hoisted(() => vi.fn())
const firestoreSettingsUpsertMock = vi.hoisted(() => vi.fn())

vi.mock('@/data/firebase/firestoreDayInstanceRepository', () => ({
  FirestoreDayInstanceRepository: class {
    getByDate = firestoreDayGetByDateMock
    getByDates = firestoreDayGetByDatesMock
    upsert = firestoreDayUpsertMock
  },
}))

vi.mock('@/data/firebase/firestoreSettingsRepository', () => ({
  FirestoreSettingsRepository: class {
    getDefault = firestoreSettingsGetDefaultMock
    upsert = firestoreSettingsUpsertMock
  },
}))

import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { getPrepWorkspaceForUser } from '@/services/prep/prepPersistenceService'
import { getOrCreateTodayWorkspaceForUser, getOrCreateWeeklyWorkspaceForUser } from '@/services/routine/routinePersistenceService'
import { getSettingsWorkspace } from '@/services/settings/settingsWorkspaceService'

describe('authenticated direct Firestore reads', () => {
  beforeEach(async () => {
    await resetForgeDb()
    firestoreDayGetByDateMock.mockReset()
    firestoreDayGetByDatesMock.mockReset()
    firestoreDayUpsertMock.mockReset()
    firestoreSettingsGetDefaultMock.mockReset()
    firestoreSettingsUpsertMock.mockReset()
  })

  it('builds the authenticated Today workspace from Firestore instead of stale local day data', async () => {
    const date = new Date('2026-03-26T08:00:00+05:30')
    const staleLocalDay = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const remoteDay = {
      ...staleLocalDay,
      focusLabel: 'Remote focus',
      blocks: staleLocalDay.blocks.map((block, index) =>
        index === 1
          ? {
              ...block,
              title: 'Remote Firestore Block',
              detail: 'Loaded from Firestore, not local IndexedDB.',
            }
          : block,
      ),
    }

    await localDayInstanceRepository.upsert({
      ...staleLocalDay,
      focusLabel: 'Stale local focus',
      blocks: staleLocalDay.blocks.map((block, index) =>
        index === 1
          ? {
              ...block,
              title: 'Stale Local Block',
            }
          : block,
      ),
    })
    firestoreSettingsGetDefaultMock.mockResolvedValue(createDefaultUserSettings())
    firestoreDayGetByDateMock.mockResolvedValue(remoteDay)

    const workspace = await getOrCreateTodayWorkspaceForUser('user-1', date)

    expect(workspace.dayInstance.focusLabel).toBe('Remote focus')
    expect(workspace.currentBlock?.title).toBe('Remote Firestore Block')
    expect(firestoreDayGetByDateMock).toHaveBeenCalledWith('user-1', '2026-03-26')
    expect(firestoreDayUpsertMock).not.toHaveBeenCalled()
  })

  it('generates and persists a missing authenticated Today baseline to Firestore without using stale local data', async () => {
    const date = new Date('2026-03-26T08:00:00+05:30')
    const staleLocalDay = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert({
      ...staleLocalDay,
      focusLabel: 'Stale local focus',
    })
    firestoreSettingsGetDefaultMock.mockResolvedValue(createDefaultUserSettings())
    firestoreDayGetByDateMock.mockResolvedValue(null)

    const workspace = await getOrCreateTodayWorkspaceForUser('user-1', date)

    expect(workspace.dayInstance.focusLabel).not.toBe('Stale local focus')
    expect(firestoreDayUpsertMock).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        date: '2026-03-26',
      }),
    )
  })

  it('builds the authenticated weekly workspace from Firestore week documents', async () => {
    const anchorDate = new Date('2026-03-26T08:00:00+05:30')
    const remoteDay = {
      ...generateDayInstance({
        date: '2026-03-26',
        routine: forgeRoutine,
      }),
      focusLabel: 'Remote Thursday',
    }

    firestoreSettingsGetDefaultMock.mockResolvedValue(createDefaultUserSettings())
    firestoreDayGetByDatesMock.mockResolvedValue([remoteDay])

    const workspace = await getOrCreateWeeklyWorkspaceForUser('user-1', anchorDate)
    const thursday = workspace.days.find((day) => day.date === '2026-03-26')

    expect(thursday?.focusLabel).toBe('Remote Thursday')
    expect(firestoreDayGetByDatesMock).toHaveBeenCalledWith(
      'user-1',
      expect.arrayContaining(['2026-03-26']),
    )
    expect(firestoreDayUpsertMock).toHaveBeenCalled()
  })

  it('builds authenticated Settings from Firestore settings instead of local settings', async () => {
    await localSettingsRepository.upsert({
      ...createDefaultUserSettings(),
      notificationsEnabled: true,
    })
    firestoreSettingsGetDefaultMock.mockResolvedValue({
      ...createDefaultUserSettings(),
      notificationsEnabled: false,
    })

    const workspace = await getSettingsWorkspace('user-1')

    expect(workspace.settings.notificationsEnabled).toBe(false)
    expect(firestoreSettingsGetDefaultMock).toHaveBeenCalledWith('user-1')
  })

  it('builds authenticated prep progress from Firestore settings instead of local settings', async () => {
    await localSettingsRepository.upsert({
      ...createDefaultUserSettings(),
      prepTopicProgress: {
        'dsa-arrays': {
          confidence: 'low',
          exposureState: 'notStarted',
          revisionCount: 0,
          solvedCount: 0,
          exposureCount: 0,
          hoursSpent: 0,
        },
      },
    })
    firestoreSettingsGetDefaultMock.mockResolvedValue({
      ...createDefaultUserSettings(),
      prepTopicProgress: {
        'dsa-arrays': {
          confidence: 'high',
          exposureState: 'confident',
          revisionCount: 4,
          solvedCount: 6,
          exposureCount: 5,
          hoursSpent: 3,
        },
      },
    })
    firestoreDayGetByDateMock.mockResolvedValue(
      generateDayInstance({
        date: '2026-03-26',
        routine: forgeRoutine,
      }),
    )

    const workspace = await getPrepWorkspaceForUser('user-1', new Date('2026-03-26T08:00:00+05:30'))
    const arraysTopic = workspace.topicsByDomain.dsa.find((topic) => topic.id === 'dsa-arrays')

    expect(arraysTopic).toMatchObject({
      confidence: 'high',
      exposureState: 'confident',
      revisionCount: 4,
      solvedCount: 6,
      exposureCount: 5,
      hoursSpent: 3,
    })
  })
})
