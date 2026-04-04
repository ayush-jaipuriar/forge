import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrepPage } from '@/features/prep/pages/PrepPage'

const prepWorkspaceMock = vi.hoisted(() => ({
  value: {
    isLoading: false,
    data: {
      dayLabel: 'Deep Work Day',
      totalTopicCount: 4,
      focusedDomains: [
        { domain: 'dsa', label: 'DSA', readinessLevel: 'building' },
        { domain: 'backend', label: 'Backend', readinessLevel: 'stable' },
      ],
      domainSummaries: [
        {
          domain: 'dsa',
          label: 'DSA',
          touchedTopicCount: 3,
          topicCount: 4,
          highConfidenceCount: 1,
          readinessLevel: 'building',
          hoursSpent: 4,
          primaryGroups: ['Arrays', 'Graphs'],
        },
        {
          domain: 'backend',
          label: 'Backend',
          touchedTopicCount: 2,
          topicCount: 3,
          highConfidenceCount: 2,
          readinessLevel: 'stable',
          hoursSpent: 6,
          primaryGroups: ['Caching', 'Queues'],
        },
      ],
      topicsByDomain: {
        dsa: [
          {
            id: 'dsa-1',
            title: 'Arrays',
            group: 'Core Structures',
            readinessLevel: 'building',
            confidence: 'medium',
            exposureState: 'inProgress',
            revisionCount: 2,
            solvedCount: 3,
            exposureCount: 1,
            hoursSpent: 1.5,
            notes: 'Revisit sliding window.',
          },
          {
            id: 'dsa-2',
            title: 'Graphs',
            group: 'Traversal',
            readinessLevel: 'fragile',
            confidence: 'low',
            exposureState: 'introduced',
            revisionCount: 1,
            solvedCount: 1,
            exposureCount: 1,
            hoursSpent: 1,
            notes: '',
          },
        ],
        backend: [
          {
            id: 'backend-1',
            title: 'Caching',
            group: 'Systems',
            readinessLevel: 'stable',
            confidence: 'high',
            exposureState: 'retention',
            revisionCount: 3,
            solvedCount: 0,
            exposureCount: 2,
            hoursSpent: 2.5,
            notes: 'Good mental model.',
          },
        ],
      },
    },
  },
}))

const updateTopicProgressMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

vi.mock('@/features/prep/hooks/usePrepWorkspace', () => ({
  usePrepWorkspace: () => prepWorkspaceMock.value,
}))

vi.mock('@/features/prep/hooks/useUpdatePrepTopicProgress', () => ({
  useUpdatePrepTopicProgress: () => updateTopicProgressMock,
}))

describe('PrepPage', () => {
  beforeEach(() => {
    updateTopicProgressMock.mutate.mockReset()
  })

  it('renders the new prep intelligence layout and lets the operator switch domains', async () => {
    const user = userEvent.setup()

    render(<PrepPage />)

    expect(screen.getByRole('heading', { name: /prep health should read like progress, not admin/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /prep map/i })).toBeInTheDocument()
    expect(screen.getAllByText(/active domain/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/topic action/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /^arrays$/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /backend/i }))

    expect(screen.getByRole('heading', { name: /^caching$/i })).toBeInTheDocument()
  })
})
