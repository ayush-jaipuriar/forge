import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import type { CommandCenterWorkspace } from '@/services/analytics/commandCenterWorkspaceService'
import type { getReadinessWorkspace } from '@/services/readiness/readinessPersistenceService'
import type { AuthSessionValue } from '@/features/auth/types/auth'

type ReadinessWorkspace = Awaited<ReturnType<typeof getReadinessWorkspace>>

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
          detail: 'Insights can open now, but Forge needs persisted day history before it can show trustworthy patterns.',
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

const readinessMock = vi.hoisted(() => {
  const data = {
    dateKey: '2026-03-28',
    readinessSnapshot: {
      targetDate: '2026-06-30',
      daysRemaining: 94,
      pressureLevel: 'behind',
      pressureLabel: 'Behind target pace',
      paceSnapshot: {
        coveragePercent: 28,
        touchedTopicCount: 14,
        totalTopicCount: 50,
        highConfidenceTopicCount: 5,
        requiredTopicsPerWeek: 4,
        paceLabel: 'Coverage needs steadier weekly progress.',
        paceLevel: 'behind',
      },
      domainStates: [
        {
          domain: 'dsa',
          label: 'DSA',
          readinessLevel: 'building',
          touchedTopicCount: 6,
          totalTopicCount: 18,
          highConfidenceCount: 2,
          hoursSpent: 5.5,
        },
        {
          domain: 'javaBackend',
          label: 'Java / Backend',
          readinessLevel: 'onTrack',
          touchedTopicCount: 5,
          totalTopicCount: 10,
          highConfidenceCount: 3,
          hoursSpent: 7,
        },
      ],
      focusedDomains: [
        {
          domain: 'dsa',
          label: 'DSA',
          readinessLevel: 'building',
        },
      ],
    },
    domainSummaries: [],
    focusedDomains: [
      {
        domain: 'dsa',
        label: 'DSA',
        topicCount: 18,
        groupCount: 4,
        primaryGroups: ['Arrays', 'Graphs'],
        touchedTopicCount: 6,
        highConfidenceCount: 2,
        hoursSpent: 5.5,
        readinessLevel: 'building',
      },
    ],
    operationalSignals: [
      {
        id: 'pace-warning',
        title: 'Coverage pace is slipping',
        detail: 'Required weekly topic coverage is above the current pace.',
        tone: 'warning',
        badge: 'Pace',
      },
    ],
    healthIntegration: {
      connectionSummary: 'planned',
      statusSummaryLabel: 'No health provider is connected yet.',
      availableSignalCount: 0,
      totalSignalCount: 5,
      anyProviderConnected: false,
      phaseNotice: 'Health provider integrations are planned but not connected.',
      providers: [
        {
          provider: 'fitbit',
          displayName: 'Fitbit',
          status: 'planned',
          unavailableReason: 'phaseNotStarted',
          unavailableLabel: 'Planned',
          platformAvailable: false,
          supportedSignalCount: 1,
        },
      ],
    },
  } as ReadinessWorkspace

  return {
    data,
    value: {
      isLoading: false,
      isError: false,
      isStale: false,
      error: null as Error | null,
      data,
    } as {
      isLoading: boolean
      isError: boolean
      isStale: boolean
      error: Error | null
      data: ReadinessWorkspace | undefined
    },
  }
})

vi.mock('@/features/auth/providers/AuthSessionProvider', () => ({
  AuthSessionProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('@/features/auth/providers/useAuthSession', () => ({
  useAuthSession: () => authMock.value,
}))

vi.mock('@/features/command-center/hooks/useCommandCenterWorkspace', () => ({
  useCommandCenterWorkspace: () => commandCenterMock.value,
}))

vi.mock('@/features/readiness/hooks/useReadinessWorkspace', () => ({
  useReadinessWorkspace: () => readinessMock.value,
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
            detail: 'Insights can open now, but Forge needs persisted day history before it can show trustworthy patterns.',
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
    readinessMock.value = {
      isLoading: false,
      isError: false,
      isStale: false,
      error: null,
      data: readinessMock.data,
    }
  })

  it('renders the Forge shell and primary navigation', () => {
    render(<App />)

    expect(screen.getByText('Forge')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /^today$/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /^plan$/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /insights/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /settings/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThan(0)
  })

  it('renders Today as an action-first surface without old support-dashboard clutter', async () => {
    render(<App />)

    expect(await screen.findByRole('button', { name: /what should i do now/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^agenda$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^signals$/i })).toBeInTheDocument()

    expect(screen.queryByText(/shell readiness/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/install forge/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/quick signals/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/mode override/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/pressure stack/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/support layer/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/recommendation history/i)).not.toBeInTheDocument()
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

    await user.click(screen.getAllByRole('link', { name: /^plan$/i })[0])

    expect(window.location.pathname).toBe('/plan')

    screen.getAllByRole('link', { name: /^today$/i }).forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current', 'page')
    })
  })

  it('renders the unified Insights route without the old internal tabs', async () => {
    window.history.pushState({}, '', '/insights')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /pattern detection is warming up/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /weekly/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /readiness/i })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /pace, score, and output/i })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /behind target pace/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/history window is still empty/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/coverage pace is slipping/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Command Center/i)).not.toBeInTheDocument()
  }, 30_000)

  it('shows an explicit error state when the insights workspace query fails', async () => {
    window.history.pushState({}, '', '/insights')
    commandCenterMock.value = {
      ...commandCenterMock.value,
      isError: true,
      error: new Error('IndexedDB could not be opened'),
      data: undefined,
    }

    render(<App />)

    expect(await screen.findByRole('heading', { name: /insights could not load/i })).toBeInTheDocument()
    expect(screen.getByText(/indexeddb could not be opened/i)).toBeInTheDocument()
  })

  it('renders the Plan route with week and prep sections under one destination', async () => {
    window.history.pushState({}, '', '/plan')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /shape the week/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /choose a day/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /prep focus/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /^week$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /^prep$/i })).not.toBeInTheDocument()
  })

  it('redirects the legacy schedule route into the Plan destination', async () => {
    window.history.pushState({}, '', '/schedule')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /shape the week/i })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/plan')
    expect(window.location.search).toBe('?view=week')
  })

  it('redirects the legacy prep route into the Plan destination', async () => {
    window.history.pushState({}, '', '/prep')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /shape the week/i })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/plan')
    expect(window.location.search).toBe('?view=prep')
  })

  it('redirects the legacy command-center route into the Insights destination', async () => {
    window.history.pushState({}, '', '/command-center')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /pattern detection is warming up/i })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/insights')
    expect(window.location.search).toBe('?view=weekly')
  })

  it('redirects the legacy readiness route into the Insights destination', async () => {
    window.history.pushState({}, '', '/readiness')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /pattern detection is warming up/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /readiness/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /behind target pace/i }).length).toBeGreaterThan(0)
    expect(window.location.pathname).toBe('/insights')
    expect(window.location.search).toBe('?view=readiness')
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
    expect(screen.getByText(/guest mode/i)).toBeInTheDocument()
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
