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

const countOutstandingMock = vi.hoisted(() => vi.fn<() => Promise<number>>())
const flushSyncQueueMock = vi.hoisted(() => vi.fn<(userId: string) => Promise<number>>())

vi.mock('@/features/auth/providers/useAuthSession', () => ({
  useAuthSession: () => authMock.value,
}))

vi.mock('@/data/local', () => ({
  localSyncQueueRepository: {
    countOutstanding: countOutstandingMock,
  },
}))

vi.mock('@/services/sync/syncOrchestrator', () => ({
  flushSyncQueue: flushSyncQueueMock,
}))

describe('SyncProvider', () => {
  beforeEach(() => {
    useUiStore.setState({ syncStatus: 'stable' })
    countOutstandingMock.mockReset()
    flushSyncQueueMock.mockReset()
    authMock.value = {
      status: 'authenticated',
      user: {
        uid: 'operator-1',
      },
    }
  })

  it('replays queued work after connectivity returns', async () => {
    setNavigatorOnline(false)
    countOutstandingMock.mockResolvedValueOnce(2).mockResolvedValueOnce(2)
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
})

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  })
}
