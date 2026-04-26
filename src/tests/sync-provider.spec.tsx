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
const discardLegacyAuthenticatedSyncQueueMock = vi.hoisted(() => vi.fn<() => Promise<void>>())

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
  discardLegacyAuthenticatedSyncQueue: discardLegacyAuthenticatedSyncQueueMock,
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
    discardLegacyAuthenticatedSyncQueueMock.mockReset()
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
    discardLegacyAuthenticatedSyncQueueMock.mockResolvedValue()
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

  it('marks authenticated online-only state stale while offline and refreshes when connectivity returns', async () => {
    setNavigatorOnline(false)

    render(
      <SyncProvider>
        <div>sync test</div>
      </SyncProvider>,
    )

    await waitFor(() => {
      expect(useUiStore.getState().syncStatus).toBe('stale')
      expect(discardLegacyAuthenticatedSyncQueueMock).toHaveBeenCalled()
    })

    setNavigatorOnline(true)
    window.dispatchEvent(new Event('online'))

    await waitFor(() => {
      expect(hydrateCloudSharedStateMock).toHaveBeenCalledWith('operator-1')
      expect(useUiStore.getState().syncStatus).toBe('stable')
    })

    expect(flushSyncQueueMock).not.toHaveBeenCalled()
  })

  it('ignores legacy failed queue items for authenticated online-only status', async () => {
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
      expect(useUiStore.getState().syncStatus).toBe('stable')
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
