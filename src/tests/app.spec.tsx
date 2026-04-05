import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import type { CommandCenterWorkspace } from '@/services/analytics/commandCenterWorkspaceService'
import type { AuthSessionValue } from '@/features/auth/types/auth'

const authMock = vi.hoisted(() => {
  const baseValue: AuthSessionValue = {
    status: 'authenticated',
    flowPhase: 'idle',
    user: {
      uid: 'user-1',
      email: 'operator@forge.test',
      displayName: 'Forge Operator',
      photoURL: null,
    },
    errorMessage: null,
    signInWithGoogle: vi.fn(async () => {}),
    signInAsGuest: vi.fn(async () => {}),
    signOutUser: vi.fn(async () => {}),
  }

  return {
    value: baseValue,
  }
})

const commandCenterMock = vi.hoisted(() => ({
  value: {
    isLoading: false,
    isError: false,
    isStale: false,
    error: null as Error | null,
    data: {
      anchorDate: '2026-03-28',
      windowKey: '30d',
      availableWindows: ['7d', '14d', '30d', '90d'],
      generatedAt: '2026-03-28T00:00:00.000Z',
      dataState: 'empty',
      trackedDays: 0,
      sourceLabel: '2026-02-27 -> 2026-03-28',
      coachSummary: {
        title: 'Pattern detection is warming up',
        summary: 'Forge is reading the 30D window, but the current mix of data is still too flat to surface a stronger coaching summary.',
        severity: 'info',
      },
      operatingTier: {
        label: 'Observation Window',
        detail: 'Forge needs more recent evidence before posture labels become useful.',
        level: 'insufficientData',
      },
      momentum: {
        score: 0,
        level: 'insufficientData',
        label: 'Observation window only',
        explanation: 'Momentum needs a wider recent sample before it becomes a trustworthy pressure signal.',
        trailingWindow: '7d',
      },
      streaks: [
        { category: 'execution', current: 0, longest: 0 },
        { category: 'deepWork', current: 0, longest: 0 },
        { category: 'prep', current: 0, longest: 0 },
        { category: 'workout', current: 0, longest: 0 },
        { category: 'sleep', current: 0, longest: 0 },
        { category: 'logging', current: 0, longest: 0 },
      ],
      missions: [],
      metrics: [
        {
          id: 'tracked-days',
          eyebrow: 'Tracked Days',
          value: '0',
          detail: 'Waiting for history.',
          tone: 'warning',
        },
      ],
      readinessCurve: [],
      prepTopicHours: [],
      sleepPerformanceCorrelation: [],
      wfoWfhComparison: [],
      timeWindowPerformance: [],
      completionHeatmap: [],
      streakCalendar: {
        cells: [],
        currentStreak: 0,
        longestStreak: 0,
        thresholdLabel: 'Strong day = projected score >= 70 and no prime miss.',
      },
      workoutProductivityCorrelation: [],
      scoreTrend: [],
      deepWorkTrend: [],
      timeBandPressure: [],
      prepDomainBalance: [],
      warnings: [
        {
          id: 'history-empty',
          title: 'History window is still empty',
          detail: 'Command Center can render the shell now, but it still needs persisted day instances.',
          severity: 'warning',
          confidence: 'low',
        },
      ],
      insights: [],
      projection: {
        id: 'default',
        snapshotVersion: 1,
        generatedAt: '2026-03-28T00:00:00.000Z',
        targetDate: '2026-06-30',
        lastEvaluatedDate: '2026-03-28',
        status: 'insufficientData',
        statusLabel: 'Need more tracked days before projection becomes trustworthy.',
        confidence: 'low',
        currentReadinessLevel: 'building',
        projectedReadinessLevel: 'building',
        currentReadinessPercent: 0,
        projectedReadinessPercent: 0,
        estimatedReadyDate: null,
        targetSlipDays: 0,
        weeklyReadinessVelocity: 0,
        requiredWeeklyVelocity: 0,
        summary: 'Forge needs a larger behavior window before projecting readiness pace honestly.',
        risks: ['Analytics history is still too shallow for a reliable readiness projection.'],
        curve: [],
      },
    } as CommandCenterWorkspace | undefined,
  } as {
    isLoading: boolean
    isError: boolean
    isStale: boolean
    error: Error | null
    data: CommandCenterWorkspace | undefined
  },
}))

vi.mock('@/features/auth/providers/AuthSessionProvider', () => ({
  AuthSessionProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('@/features/auth/providers/useAuthSession', () => ({
  useAuthSession: () => authMock.value,
}))

vi.mock('@/features/command-center/hooks/useCommandCenterWorkspace', () => ({
  useCommandCenterWorkspace: () => commandCenterMock.value,
}))

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    authMock.value = {
      status: 'authenticated',
      flowPhase: 'idle',
      user: {
        uid: 'user-1',
        email: 'operator@forge.test',
        displayName: 'Forge Operator',
        photoURL: null,
      },
      errorMessage: null,
      signInWithGoogle: vi.fn(async () => {}),
      signInAsGuest: vi.fn(async () => {}),
      signOutUser: vi.fn(async () => {}),
    }
    commandCenterMock.value = {
      ...commandCenterMock.value,
      isLoading: false,
      isError: false,
      isStale: false,
      error: null,
      data: {
        anchorDate: '2026-03-28',
        windowKey: '30d',
        availableWindows: ['7d', '14d', '30d', '90d'],
        generatedAt: '2026-03-28T00:00:00.000Z',
        dataState: 'empty',
        trackedDays: 0,
        sourceLabel: '2026-02-27 -> 2026-03-28',
        coachSummary: {
          title: 'Pattern detection is warming up',
          summary: 'Forge is reading the 30D window, but the current mix of data is still too flat to surface a stronger coaching summary.',
          severity: 'info',
        },
        operatingTier: {
          label: 'Observation Window',
          detail: 'Forge needs more recent evidence before posture labels become useful.',
          level: 'insufficientData',
        },
        momentum: {
          score: 0,
          level: 'insufficientData',
          label: 'Observation window only',
          explanation: 'Momentum needs a wider recent sample before it becomes a trustworthy pressure signal.',
          trailingWindow: '7d',
        },
        streaks: [
          { category: 'execution', current: 0, longest: 0 },
          { category: 'deepWork', current: 0, longest: 0 },
          { category: 'prep', current: 0, longest: 0 },
          { category: 'workout', current: 0, longest: 0 },
          { category: 'sleep', current: 0, longest: 0 },
          { category: 'logging', current: 0, longest: 0 },
        ],
        missions: [],
        metrics: [
          {
            id: 'tracked-days',
            eyebrow: 'Tracked Days',
            value: '0',
            detail: 'Waiting for history.',
            tone: 'warning',
          },
        ],
        readinessCurve: [],
        prepTopicHours: [],
        sleepPerformanceCorrelation: [],
        wfoWfhComparison: [],
        timeWindowPerformance: [],
        completionHeatmap: [],
        streakCalendar: {
          cells: [],
          currentStreak: 0,
          longestStreak: 0,
          thresholdLabel: 'Strong day = projected score >= 70 and no prime miss.',
        },
        workoutProductivityCorrelation: [],
        scoreTrend: [],
        deepWorkTrend: [],
        timeBandPressure: [],
        prepDomainBalance: [],
        warnings: [
          {
            id: 'history-empty',
            title: 'History window is still empty',
            detail: 'Command Center can render the shell now, but it still needs persisted day instances.',
            severity: 'warning',
            confidence: 'low',
          },
        ],
        insights: [],
        projection: {
          id: 'default',
          snapshotVersion: 1,
          generatedAt: '2026-03-28T00:00:00.000Z',
          targetDate: '2026-06-30',
          lastEvaluatedDate: '2026-03-28',
          status: 'insufficientData',
          statusLabel: 'Need more tracked days before projection becomes trustworthy.',
          confidence: 'low',
          currentReadinessLevel: 'building',
          projectedReadinessLevel: 'building',
          currentReadinessPercent: 0,
          projectedReadinessPercent: 0,
          estimatedReadyDate: null,
          targetSlipDays: 0,
          weeklyReadinessVelocity: 0,
          requiredWeeklyVelocity: 0,
          summary: 'Forge needs a larger behavior window before projecting readiness pace honestly.',
          risks: ['Analytics history is still too shallow for a reliable readiness projection.'],
          curve: [],
        },
      },
    }
  })

  it('renders the Forge shell and primary navigation', () => {
    render(<App />)

    expect(screen.getByText('Forge')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /^today$/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /command center/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /schedule/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThan(0)
  })

  it('routes unauthenticated users to the auth entry screen', () => {
    authMock.value = {
      ...authMock.value,
      status: 'unauthenticated',
      flowPhase: 'idle',
      user: null,
    }

    render(<App />)

    expect(screen.getByRole('heading', { name: /sign in to forge/i })).toBeInTheDocument()
    expect(screen.queryByText('Run the day with clarity.')).not.toBeInTheDocument()
  })

  it('does not keep the Today nav link marked as current after navigating away from root', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getAllByRole('link', { name: /schedule/i })[0])

    expect(window.location.pathname).toBe('/schedule')

    screen.getAllByRole('link', { name: /^today$/i }).forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current', 'page')
    })
  })

  it('renders the Command Center route and its core empty-state warning surface', async () => {
    window.history.pushState({}, '', '/command-center')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /command center/i })).toBeInTheDocument()
    expect(screen.getByText(/history window is still empty/i)).toBeInTheDocument()
    expect(screen.getAllByText(/waiting for history/i).length).toBeGreaterThan(0)
  }, 30_000)

  it('shows an explicit error state when the command-center workspace query fails', async () => {
    window.history.pushState({}, '', '/command-center')
    commandCenterMock.value = {
      ...commandCenterMock.value,
      isError: true,
      error: new Error('IndexedDB could not be opened'),
      data: undefined,
    }

    render(<App />)

    expect(await screen.findByRole('heading', { name: /command center could not load/i })).toBeInTheDocument()
    expect(screen.getByText(/indexeddb could not be opened/i)).toBeInTheDocument()
  })

  it('renders the About route inside the protected shell', async () => {
    window.history.pushState({}, '', '/about')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /forge exists to make disciplined execution easier to sustain/i })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /^ayush jaipuriar$/i }).length).toBeGreaterThan(0)
  })

  it('keeps the About route accessible during a guest session', async () => {
    window.history.pushState({}, '', '/about')
    authMock.value = {
      ...authMock.value,
      status: 'guest',
      user: {
        uid: 'guest-user',
        email: null,
        displayName: 'Guest Workspace',
        photoURL: null,
        isGuest: true,
      },
    }

    render(<App />)

    expect(await screen.findByRole('heading', { name: /forge exists to make disciplined execution easier to sustain/i })).toBeInTheDocument()
    expect(screen.getByText(/guest workspace/i)).toBeInTheDocument()
  })

  it('shows the redirect-return status copy while the protected shell is restoring a Google sign-in', () => {
    authMock.value = {
      ...authMock.value,
      status: 'checking',
      flowPhase: 'returning',
      user: null,
    }

    render(<App />)

    expect(screen.getByRole('heading', { name: /completing google sign-in/i })).toBeInTheDocument()
    expect(screen.getByText(/restoring your workspace/i)).toBeInTheDocument()
  })

})
