import { beforeEach, describe, expect, it, vi } from 'vitest'

const firestoreSettingsGetDefaultMock = vi.hoisted(() => vi.fn())
const firestoreSettingsSubscribeDefaultMock = vi.hoisted(() => vi.fn())
const firestoreDayInstancesListAllMock = vi.hoisted(() => vi.fn())
const firestoreDayInstancesSubscribeAllMock = vi.hoisted(() => vi.fn())
const localSettingsUpsertMock = vi.hoisted(() => vi.fn())
const localDayInstancesUpsertManyMock = vi.hoisted(() => vi.fn())
const listOutstandingMock = vi.hoisted(() => vi.fn())
const removeQueueItemMock = vi.hoisted(() => vi.fn())
const invalidateQueriesMock = vi.hoisted(() => vi.fn(async () => {}))

vi.mock('@/data/firebase/firestoreSettingsRepository', () => ({
  FirestoreSettingsRepository: class {
    getDefault = firestoreSettingsGetDefaultMock
    subscribeDefault = firestoreSettingsSubscribeDefaultMock
  },
}))

vi.mock('@/data/firebase/firestoreDayInstanceRepository', () => ({
  FirestoreDayInstanceRepository: class {
    listAll = firestoreDayInstancesListAllMock
    subscribeAll = firestoreDayInstancesSubscribeAllMock
  },
}))

vi.mock('@/data/local', () => ({
  localSettingsRepository: {
    upsert: localSettingsUpsertMock,
  },
  localDayInstanceRepository: {
    upsertMany: localDayInstancesUpsertManyMock,
  },
  localSyncQueueRepository: {
    listOutstanding: listOutstandingMock,
    remove: removeQueueItemMock,
  },
}))

vi.mock('@/lib/query/queryClient', () => ({
  queryClient: {
    invalidateQueries: invalidateQueriesMock,
  },
}))

describe('cloudSyncService', () => {
  beforeEach(() => {
    vi.resetModules()
    firestoreSettingsGetDefaultMock.mockReset()
    firestoreSettingsSubscribeDefaultMock.mockReset()
    firestoreDayInstancesListAllMock.mockReset()
    firestoreDayInstancesSubscribeAllMock.mockReset()
    localSettingsUpsertMock.mockReset()
    localDayInstancesUpsertManyMock.mockReset()
    listOutstandingMock.mockReset()
    removeQueueItemMock.mockReset()
    invalidateQueriesMock.mockClear()
    listOutstandingMock.mockResolvedValue([])
    firestoreSettingsSubscribeDefaultMock.mockReturnValue(() => {})
    firestoreDayInstancesSubscribeAllMock.mockReturnValue(() => {})
  })

  it('hydrates remote settings and day instances into the local repositories', async () => {
    const remoteSettings = {
      id: 'default',
      notificationsEnabled: true,
      calendarIntegration: {
        provider: 'google',
        connectionStatus: 'connected',
        featureGate: 'writeEnabled',
        managedEventMode: 'majorBlocksOnly',
        selectedCalendarIds: ['primary'],
      },
      dayModeOverrides: {
        '2026-04-18': 'normal',
      },
      dayTypeOverrides: {},
      dailySignals: {},
      prepTopicProgress: {},
      workoutLogs: {},
      updatedAt: '2026-04-18T10:00:00.000Z',
    }
    const remoteDayInstances = [
      {
        id: '2026-04-18',
        date: '2026-04-18',
        weekday: 'saturday',
        dayType: 'weekendDeepWork',
        dayMode: 'normal',
        label: 'Weekend Deep Work Day',
        focusLabel: 'Deep focus',
        expectationSummary: [],
        blocks: [],
      },
    ]

    firestoreSettingsGetDefaultMock.mockResolvedValue(remoteSettings)
    firestoreDayInstancesListAllMock.mockResolvedValue(remoteDayInstances)

    const { hydrateCloudSharedState } = await import('@/services/sync/cloudSyncService')

    const result = await hydrateCloudSharedState('user-1')

    expect(localSettingsUpsertMock).toHaveBeenCalledWith(remoteSettings)
    expect(localDayInstancesUpsertManyMock).toHaveBeenCalledWith(remoteDayInstances)
    expect(result).toEqual({
      hydratedSettings: true,
      hydratedDayInstances: 1,
    })
    expect(invalidateQueriesMock).toHaveBeenCalled()
  })

  it('drops superseded queued shared-state items when remote truth is applied', async () => {
    const remoteSettings = {
      id: 'default',
      notificationsEnabled: false,
      calendarIntegration: {
        provider: 'google',
        connectionStatus: 'notConnected',
        featureGate: 'scaffoldingOnly',
        managedEventMode: 'disabled',
        selectedCalendarIds: [],
      },
      dayModeOverrides: {},
      dayTypeOverrides: {},
      dailySignals: {},
      prepTopicProgress: {},
      workoutLogs: {},
      updatedAt: '2026-04-18T10:00:00.000Z',
    }

    firestoreSettingsGetDefaultMock.mockResolvedValue(remoteSettings)
    firestoreDayInstancesListAllMock.mockResolvedValue([])
    listOutstandingMock.mockResolvedValue([
      {
        id: 'queue-settings',
        actionType: 'patchSettings',
        entityId: 'default:notificationsEnabled',
        payload: {
          type: 'setNotificationsEnabled',
          settingsId: 'default',
          value: true,
          updatedAt: '2026-04-18T09:00:00.000Z',
        },
      },
      {
        id: 'queue-day',
        actionType: 'upsertDayInstance',
        entityId: '2026-04-18',
      },
    ])

    const { hydrateCloudSharedState } = await import('@/services/sync/cloudSyncService')

    await hydrateCloudSharedState('user-1')

    expect(removeQueueItemMock).toHaveBeenCalledWith('queue-settings')
    expect(removeQueueItemMock).not.toHaveBeenCalledWith('queue-day')
  })

  it('subscribes to remote shared state and applies updates locally', async () => {
    const unsubscribeSettings = vi.fn()
    const unsubscribeDays = vi.fn()
    let settingsListener: ((settings: unknown) => void) | undefined
    let dayInstancesListener: ((instances: unknown[]) => void) | undefined

    firestoreSettingsSubscribeDefaultMock.mockImplementation((_userId, listener) => {
      settingsListener = listener
      return unsubscribeSettings
    })
    firestoreDayInstancesSubscribeAllMock.mockImplementation((_userId, listener) => {
      dayInstancesListener = listener
      return unsubscribeDays
    })

    const { subscribeToCloudSharedState } = await import('@/services/sync/cloudSyncService')

    const unsubscribe = subscribeToCloudSharedState('user-1')

    await settingsListener?.({
      id: 'default',
      notificationsEnabled: true,
      calendarIntegration: {
        provider: 'google',
        connectionStatus: 'connected',
        featureGate: 'readEnabled',
        managedEventMode: 'disabled',
        selectedCalendarIds: ['primary'],
      },
      dayModeOverrides: {},
      dayTypeOverrides: {},
      dailySignals: {},
      prepTopicProgress: {},
      workoutLogs: {},
      updatedAt: '2026-04-18T10:00:00.000Z',
    })
    await dayInstancesListener?.([
      {
        id: '2026-04-18',
        date: '2026-04-18',
        weekday: 'saturday',
        dayType: 'weekendDeepWork',
        dayMode: 'normal',
        label: 'Weekend Deep Work Day',
        focusLabel: 'Deep focus',
        expectationSummary: [],
        blocks: [],
      },
    ])

    expect(localSettingsUpsertMock).toHaveBeenCalled()
    expect(localDayInstancesUpsertManyMock).toHaveBeenCalled()

    unsubscribe()

    expect(unsubscribeSettings).toHaveBeenCalled()
    expect(unsubscribeDays).toHaveBeenCalled()
  })
})
