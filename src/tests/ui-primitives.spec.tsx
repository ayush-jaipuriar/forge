import { render, screen } from '@testing-library/react'
import { AppProviders } from '@/app/providers/AppProviders'
import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { ChartCard } from '@/features/command-center/components/ChartCard'
import { ProjectionPanel } from '@/features/command-center/components/ProjectionPanel'

describe('UI primitives', () => {
  it('renders the section header with the expected content', () => {
    render(
      <AppProviders>
        <SectionHeader eyebrow="Today" title="Run the day." description="A test description." />
      </AppProviders>,
    )

    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Run the day.')).toBeInTheDocument()
    expect(screen.getByText('A test description.')).toBeInTheDocument()
  })

  it('renders the empty state pattern', () => {
    render(
      <AppProviders>
        <EmptyState title="No data yet" description="The empty-state pattern should be consistent." />
      </AppProviders>,
    )

    expect(screen.getByText('No data yet')).toBeInTheDocument()
    expect(screen.getByText('The empty-state pattern should be consistent.')).toBeInTheDocument()
  })

  it('keeps SurfaceCard headers left-aligned when no action is provided', () => {
    render(
      <AppProviders>
        <SurfaceCard eyebrow="Signal" title="Aligned title" description="Left alignment should remain the default." />
      </AppProviders>,
    )

    const title = screen.getByText('Aligned title')
    const stack = title.parentElement?.parentElement

    expect(stack).toHaveStyle({ alignItems: 'flex-start' })
  })

  it('renders sync indicator copy that matches the current queue semantics', () => {
    render(
      <AppProviders>
        <SyncIndicator status="queued" />
      </AppProviders>,
    )

    expect(screen.getByText('Queued to Sync')).toBeInTheDocument()
  })

  it('renders a command-center chart card with an honest insufficient-data state', () => {
    render(
      <AppProviders>
        <ChartCard
          eyebrow="Trend"
          title="Daily score rhythm"
          description="A test command-center chart."
          state="insufficientData"
        >
          <div />
        </ChartCard>
      </AppProviders>,
    )

    expect(screen.getByText('Daily score rhythm')).toBeInTheDocument()
    expect(screen.getByText(/not enough historical signal yet/i)).toBeInTheDocument()
  })

  it('renders the projection panel with the insufficient-data messaging path', () => {
    render(
      <AppProviders>
        <ProjectionPanel
          projection={{
            id: 'default',
            snapshotVersion: 1,
            generatedAt: '2026-03-28T00:00:00.000Z',
            targetDate: '2026-06-30',
            lastEvaluatedDate: '2026-03-28',
            status: 'insufficientData',
            statusLabel: 'Projection needs more data.',
            confidence: 'low',
            currentReadinessLevel: 'building',
            projectedReadinessLevel: 'building',
            currentReadinessPercent: 0,
            projectedReadinessPercent: 0,
            estimatedReadyDate: null,
            targetSlipDays: 0,
            weeklyReadinessVelocity: 0,
            requiredWeeklyVelocity: 0,
            summary: 'Forge needs a larger observation window before pace projection becomes trustworthy.',
            risks: [],
            curve: [],
          }}
        />
      </AppProviders>,
    )

    expect(screen.getByText(/projection needs more tracked days/i)).toBeInTheDocument()
  })
})
