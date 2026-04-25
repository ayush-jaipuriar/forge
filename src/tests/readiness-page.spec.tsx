import { render, screen } from '@testing-library/react'
import { ReadinessPage } from '@/features/readiness/pages/ReadinessPage'

const readinessWorkspaceMock = vi.hoisted(() => ({
  value: {
    isLoading: false,
    data: {
      dateKey: '2026-04-04',
      readinessSnapshot: {
        targetDate: '2026-08-31',
        daysRemaining: 149,
        pressureLevel: 'behind',
        pressureLabel: 'Behind target pace',
        paceSnapshot: {
          coveragePercent: 42,
          touchedTopicCount: 21,
          totalTopicCount: 50,
          requiredTopicsPerWeek: 4,
          paceLabel: 'Coverage needs to rise more consistently over the next few weeks.',
          paceLevel: 'behind',
        },
        domainStates: [
          {
            domain: 'dsa',
            label: 'DSA',
            readinessLevel: 'building',
            touchedTopicCount: 8,
            totalTopicCount: 18,
            highConfidenceCount: 2,
            hoursSpent: 5.5,
          },
          {
            domain: 'backend',
            label: 'Backend',
            readinessLevel: 'stable',
            touchedTopicCount: 6,
            totalTopicCount: 10,
            highConfidenceCount: 4,
            hoursSpent: 7,
          },
        ],
      },
      focusedDomains: [
        { domain: 'dsa', label: 'DSA', readinessLevel: 'building' },
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
        statusSummaryLabel: 'No health provider is connected yet.',
        providers: [
          {
            provider: 'fitbit',
            displayName: 'Fitbit',
            unavailableLabel: 'Planned',
            supportedSignalCount: 1,
          },
        ],
      },
    },
  },
}))

const platformWorkspaceMock = vi.hoisted(() => ({
  value: {
    runtime: 'browser',
  },
}))

vi.mock('@/features/readiness/hooks/useReadinessWorkspace', () => ({
  useReadinessWorkspace: () => readinessWorkspaceMock.value,
}))

vi.mock('@/features/platform/hooks/usePlatformWorkspace', () => ({
  usePlatformWorkspace: () => platformWorkspaceMock.value,
}))

describe('ReadinessPage', () => {
  it('renders the readiness intelligence layout with target posture and review section', () => {
    render(<ReadinessPage />)

    expect(screen.getByRole('heading', { name: /risk should become readable early/i })).toBeInTheDocument()
    expect(screen.getByText(/target posture/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /where readiness needs attention/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /coverage and confidence across the prep map/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /future provider contribution points/i })).toBeInTheDocument()
    expect(screen.getByText(/coverage pace is slipping/i)).toBeInTheDocument()
  })
})
