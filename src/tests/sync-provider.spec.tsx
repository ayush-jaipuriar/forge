import { render, waitFor } from '@testing-library/react'
import { useUiStore } from '@/app/store/uiStore'
import { SyncProvider } from '@/services/sync/SyncProvider'

const authMock = vi.hoisted(() => ({
  value: {
    status: 'authenticated' as const,
    user: {
      uid: 'operator-1',
    },
  },
}))

const listOutstandingMock = vi.hoisted(() => vi.fn<() => Promise<unknown[]>>())
const diagnosticsGetDefaultMock = vi.hoisted(() => vi.fn<() => Promise<unknown>>())
const diagnosticsUpsertMock = vi.hoisted(() => vi.fn<(value: unknown) => Promise<void>>())
const listOpenConflictsMock = vi.hoisted(() => vi.fn<() => Promise<unknown[]>>())
const flushSyncQueueMock = vi.hoisted(() => vi.fn<(userId: string) => Promise<number>>())
const hydrateCloudSharedStateMock = vi.hoisted(() => vi.fn<(userId: string) => Promise<unknown>>())
const subscribeToCloudSharedStateMock = vi.hoisted(() => vi.fn<(userId: string) => () => void>())

vi.mock('@/features/auth/providers/useAuthSession', () => ({
  useAuthSession: () => authMock.value,
}))

vi.mock('@/data/local', () => ({
  localSyncConflictRepository: {
    listOpen: listOpenConflictsMock,
  },
  localSyncDiagnosticsRepository: {
    getDefault: diagnosticsGetDefaultMock,
    upsert: diagnosticsUpsertMock,
  },
  localSyncQueueRepository: {
    listOutstanding: listOutstandingMock,
  },
}))

vi.mock('@/services/sync/syncOrchestrator', () => ({
  flushSyncQueue: flushSyncQueueMock,
}))

vi.mock('@/services/sync/cloudSyncService', () => ({
  hydrateCloudSharedState: hydrateCloudSharedStateMock,
  subscribeToCloudSharedState: subscribeToCloudSharedStateMock,
}))

describe('SyncProvider', () => {
  beforeEach(() => {
    useUiStore.setState({ syncStatus: 'stable' })
    listOutstandingMock.mockReset()
    diagnosticsGetDefaultMock.mockReset()
    diagnosticsUpsertMock.mockReset()
    listOpenConflictsMock.mockReset()
    flushSyncQueueMock.mockReset()
    hydrateCloudSharedStateMock.mockReset()
    subscribeToCloudSharedStateMock.mockReset()
    authMock.value = {
      status: 'authenticated',
      user: {
        uid: 'operator-1',
      },
    }
    diagnosticsGetDefaultMock.mockResolvedValue(null)
    diagnosticsUpsertMock.mockResolvedValue()
    listOpenConflictsMock.mockResolvedValue([])
    hydrateCloudSharedStateMock.mockResolvedValue({
      hydratedSettings: true,
      hydratedDayInstances: 0,
    })
    subscribeToCloudSharedStateMock.mockReturnValue(() => {})
  })

  it('hydrates shared cloud state and starts live subscriptions for authenticated users', async () => {
    setNavigatorOnline(true)
    listOutstandingMock.mockResolvedValue([])

    render(
      <SyncProvider>
        <div>sync test</div>
      </SyncProvider>,
    )

    await waitFor(() => {
      expect(hydrateCloudSharedStateMock).toHaveBeenCalledWith('operator-1')
      expect(subscribeToCloudSharedStateMock).toHaveBeenCalledWith('operator-1')
    })
  })

  it('replays queued work after connectivity returns', async () => {
    setNavigatorOnline(false)
    const recentTimestamp = new Date().toISOString()
    listOutstandingMock
      .mockResolvedValueOnce([
        {
          id: 'q1',
          status: 'pending',
          queuedAt: recentTimestamp,
          updatedAt: recentTimestamp,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'q1',
          status: 'pending',
          queuedAt: recentTimestamp,
          updatedAt: recentTimestamp,
        },
      ])
      .mockResolvedValueOnce([])
    flushSyncQueueMock.mockResolvedValueOnce(0)

    render(
      <SyncProvider>
        <div>sync test</div>
      </SyncProvider>,
    )

    await waitFor(() => {
      expect(useUiStore.getState().syncStatus).toBe('queued')
    })

    setNavigatorOnline(true)
    window.dispatchEvent(new Event('online'))

    await waitFor(() => {
      expect(flushSyncQueueMock).toHaveBeenCalledWith('operator-1')
      expect(useUiStore.getState().syncStatus).toBe('stable')
    })
  })

  it('surfaces degraded state when failed replay items remain outstanding', async () => {
    setNavigatorOnline(true)
    listOutstandingMock.mockResolvedValue([
      {
        id: 'q1',
        status: 'failed',
        queuedAt: '2026-03-28T10:00:00.000Z',
        updatedAt: '2026-03-28T10:00:00.000Z',
      },
    ])

    render(
      <SyncProvider>
        <div>sync test</div>
      </SyncProvider>,
    )

    await waitFor(() => {
      expect(useUiStore.getState().syncStatus).toBe('degraded')
    })

    expect(flushSyncQueueMock).not.toHaveBeenCalled()
  })
})

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  })
}
