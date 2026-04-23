import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

type MockSettingsWorkspaceResult = {
  isLoading: boolean
  data: unknown
}

const authSessionMock = vi.hoisted(() => ({
  value: {
    status: 'authenticated',
    user: {
      uid: 'user-1',
      email: 'operator@forge.test',
      displayName: 'Forge Operator',
      photoURL: null,
    },
  },
}))

const platformWorkspaceMock = vi.hoisted(() => ({
  value: {
    runtime: 'browser',
    shellLabel: 'Browser Tab',
    shellSupportLabel: 'Primary runtime',
    summary: 'Browser remains the most complete and best-understood Forge runtime today, including auth, Calendar, backup export, and restore import flows.',
    installSurfaceLabel: 'Browser install prompt available',
    needRefresh: false,
    offlineReady: true,
    supportNotes: ['Browser is the reference runtime for launch, support, and troubleshooting today.'],
    capabilities: [
      {
        key: 'auth',
        label: 'Firebase Auth',
        status: 'supported',
        summary: 'Browser auth is supported today through the Google popup flow, with redirect retained only as a future hosted fallback once callback setup is aligned.',
      },
      { key: 'notifications', label: 'Notifications', status: 'supported', summary: 'Browser notifications are supported once permission is granted.' },
      { key: 'backupExport', label: 'Backup Export', status: 'supported', summary: 'Backup export uses browser downloads.' },
      { key: 'restoreImport', label: 'Restore Import', status: 'supported', summary: 'Restore import uses the browser file picker.' },
      { key: 'calendar', label: 'Google Calendar', status: 'supported', summary: 'Calendar integration is currently strongest in the browser runtime.' },
      { key: 'health', label: 'Health Providers', status: 'planned', summary: 'Health providers are not yet connected in the browser runtime.' },
    ],
  } as const,
}))

const settingsWorkspaceMock = vi.hoisted(() => ({
  value: null as MockSettingsWorkspaceResult | null,
}))

const notificationPreferenceMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

const requestNotificationPermissionMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

const createManualBackupMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

const loadServerRestoreStageMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

const invokePlatformOperationMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  data: null,
  variables: null,
}))

const connectCalendarReadMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

const connectCalendarWriteMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

const disconnectCalendarMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

const refreshCalendarCacheMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

const refreshCloudWorkspaceMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

const syncCalendarMirrorsMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  data: null,
}))

const applyRestoreStageMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  data: null,
}))

vi.mock('@/features/auth/providers/useAuthSession', () => ({
  useAuthSession: () => authSessionMock.value,
}))

vi.mock('@/features/platform/hooks/usePlatformWorkspace', () => ({
  usePlatformWorkspace: () => platformWorkspaceMock.value,
}))

vi.mock('@/features/settings/hooks/useSettingsWorkspace', () => ({
  useSettingsWorkspace: () => settingsWorkspaceMock.value,
}))

vi.mock('@/features/settings/hooks/useUpdateNotificationPreference', () => ({
  useUpdateNotificationPreference: () => notificationPreferenceMock,
}))

vi.mock('@/features/settings/hooks/useRequestNotificationPermission', () => ({
  useRequestNotificationPermission: () => requestNotificationPermissionMock,
}))

vi.mock('@/features/settings/hooks/useCreateManualBackup', () => ({
  useCreateManualBackup: () => createManualBackupMock,
}))

vi.mock('@/features/settings/hooks/useLoadServerRestoreStage', () => ({
  useLoadServerRestoreStage: () => loadServerRestoreStageMock,
}))

vi.mock('@/features/settings/hooks/useInvokePlatformOperation', () => ({
  useInvokePlatformOperation: () => invokePlatformOperationMock,
}))

vi.mock('@/features/settings/hooks/useConnectCalendarRead', () => ({
  useConnectCalendarRead: () => connectCalendarReadMock,
}))

vi.mock('@/features/settings/hooks/useConnectCalendarWrite', () => ({
  useConnectCalendarWrite: () => connectCalendarWriteMock,
}))

vi.mock('@/features/settings/hooks/useDisconnectCalendar', () => ({
  useDisconnectCalendar: () => disconnectCalendarMock,
}))

vi.mock('@/features/settings/hooks/useRefreshCalendarCache', () => ({
  useRefreshCalendarCache: () => refreshCalendarCacheMock,
}))

vi.mock('@/features/settings/hooks/useRefreshCloudWorkspace', () => ({
  useRefreshCloudWorkspace: () => refreshCloudWorkspaceMock,
}))

vi.mock('@/features/settings/hooks/useSyncCalendarMirrors', () => ({
  useSyncCalendarMirrors: () => syncCalendarMirrorsMock,
}))

vi.mock('@/features/settings/hooks/useApplyRestoreStage', () => ({
  useApplyRestoreStage: () => applyRestoreStageMock,
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    notificationPreferenceMock.mutate.mockReset()
    requestNotificationPermissionMock.mutate.mockReset()
    createManualBackupMock.mutate.mockReset()
    loadServerRestoreStageMock.mutate.mockReset()
    invokePlatformOperationMock.mutate.mockReset()
    connectCalendarReadMock.mutate.mockReset()
    connectCalendarWriteMock.mutate.mockReset()
    disconnectCalendarMock.mutate.mockReset()
    refreshCalendarCacheMock.mutate.mockReset()
    refreshCloudWorkspaceMock.mutate.mockReset()
    syncCalendarMirrorsMock.mutate.mockReset()
    applyRestoreStageMock.mutate.mockReset()

    loadServerRestoreStageMock.mutate.mockImplementation((backup: { id: string; createdAt: string }, options?: { onSuccess?: (stage: unknown) => void }) => {
      options?.onSuccess?.({
        summary: 'Remote restore staged successfully.',
        warnings: [],
        source: {
          label: `Loaded from scheduled backup ${backup.id}`,
        },
      })
    })

    applyRestoreStageMock.mutate.mockImplementation((_stage: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })

    settingsWorkspaceMock.value = {
      isLoading: false,
      data: {
        settings: {
          notificationsEnabled: true,
        },
        backupOperations: {
          healthState: 'healthy',
          latestSuccessfulBackupAt: '2026-04-04T04:00:00.000Z',
          latestFailureMessage: null,
          retentionPolicy: {
            keepDaily: 7,
            keepWeekly: 4,
            keepManual: 12,
          },
        },
        backupSource: {
          operations: 'local',
          recentBackups: 'remote',
        },
        recentBackups: [
          {
            id: 'backup-1',
            status: 'ready',
            createdAt: '2026-04-04T04:00:00.000Z',
            sourceRecordCount: 42,
            payloadPointer: {
              provider: 'cloudStorage',
            },
            restoreEligibility: {
              status: 'eligible',
              checkedAt: '2026-04-04T04:05:00.000Z',
            },
          },
        ],
        serverRestoreReadyCount: 1,
        latestServerRestoreReadyBackup: {
          createdAt: '2026-04-04T04:00:00.000Z',
        },
        recentRestoreJobs: [],
        calendarConnection: {
          provider: 'googleCalendar',
          connectionStatus: 'connected',
          featureGate: 'writeEnabled',
          managedEventMode: 'majorBlocksOnly',
          selectedCalendarIds: ['primary'],
        },
        calendarSyncState: {
          externalEventSyncStatus: 'stable',
          mirrorSyncStatus: 'idle',
          lastExternalSyncAt: '2026-04-04T05:00:00.000Z',
          lastMirrorSyncAt: '2026-04-04T05:30:00.000Z',
          lastSyncError: null,
          lastMirrorSyncError: null,
          cachedEventCount: 6,
        },
        calendarMirroredBlockCount: 3,
        calendarMirrorErrorCount: 0,
        mirroredBlockPreview: {
          eventTitle: 'Forge · Prime Deep Block',
        },
        featureFlags: {
          collisionAwareRecommendations: true,
          readMirror: 'enabled',
          writeMirror: 'enabled',
        },
        healthIntegration: {
          phaseNotice: 'Health provider bridges remain scaffold-only.',
          connectionSummary: 'Planned providers',
          statusSummaryLabel: 'No health providers are connected yet.',
          availableSignalCount: 0,
          totalSignalCount: 4,
          providers: [
            {
              provider: 'healthConnect',
              displayName: 'Health Connect',
              unavailableLabel: 'Planned',
            },
          ],
        },
        notificationState: {
          permission: 'default',
          dailyCap: 3,
          supportedChannels: ['browser', 'installedPwa'],
          countersByDate: {},
        },
        recentNotificationLogs: [],
        operationalDiagnostics: {
          headline: 'Healthy with blind spots',
          overallSeverity: 'warning',
          summary: 'Core systems are healthy, but a few launch blind spots remain.',
          items: [
            {
              key: 'backup',
              label: 'Backup protection',
              summary: 'Scheduled backups are healthy and recent.',
              owner: 'browser',
              lastObservedAt: '2026-04-04T05:40:00.000Z',
              statusLabel: 'healthy',
              severity: 'healthy',
            },
          ],
          blindSpots: ['Visual snapshot coverage is still manual.'],
        },
        platformServices: {
          functionsOwned: ['scheduledBackups'],
          boundaries: [
            {
              key: 'scheduledBackups',
              label: 'Scheduled backups',
              description: 'Scheduled backup generation runs through Firebase Functions.',
              rationale: 'Time-based protection belongs on the server side.',
              owner: 'firebaseFunctions',
              status: 'active',
              callableName: 'generateUserBackup',
              manualTriggerLabel: 'Run backup now',
            },
          ],
        },
      },
    }
  })

  it('renders simplified default settings surfaces with the primary utility actions visible', () => {
    render(<SettingsPage />)

    expect(screen.getByRole('heading', { name: /keep forge recoverable/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /backup & restore/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /calendar access/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /account & cloud/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /notification controls/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /provider status/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /export backup json/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export notes markdown/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /load restore file/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh from cloud/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request browser permission/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apply staged restore/i })).toBeDisabled()
  })

  it('keeps low-level implementation details collapsed until the user asks for them', async () => {
    const user = userEvent.setup()

    render(<SettingsPage />)

    expect(screen.queryByText(/scheduled backups are healthy and recent/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/visual snapshot coverage is still manual/i)).not.toBeInTheDocument()

    const diagnosticsDisclosure = screen.getByRole('button', { name: /diagnostics/i })
    expect(diagnosticsDisclosure).toHaveAttribute('aria-expanded', 'false')

    await user.click(diagnosticsDisclosure)

    expect(diagnosticsDisclosure).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/scheduled backups are healthy and recent/i)).toBeInTheDocument()
    expect(screen.getByText(/visual snapshot coverage is still manual/i)).toBeInTheDocument()
  })

  it('keeps staged restore and notification actions wired through the simplified control surface', async () => {
    const user = userEvent.setup()

    render(<SettingsPage />)

    await user.click(screen.getByRole('button', { name: /backup details/i }))
    await user.click(screen.getByRole('button', { name: /stage restore/i }))
    expect(loadServerRestoreStageMock.mutate).toHaveBeenCalled()
    expect(screen.getByText(/staged remote restore/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /apply staged restore/i }))
    expect(applyRestoreStageMock.mutate).toHaveBeenCalled()
    expect(screen.getByText(/restore applied\. forge refreshed local workspaces from the restored state\./i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /request browser permission/i }))
    expect(requestNotificationPermissionMock.mutate).toHaveBeenCalled()
  })

  it('offers a manual refresh from cloud action for shared state recovery', async () => {
    const user = userEvent.setup()

    render(<SettingsPage />)

    await user.click(screen.getByRole('button', { name: /refresh from cloud/i }))

    expect(refreshCloudWorkspaceMock.mutate).toHaveBeenCalled()
  })
})
