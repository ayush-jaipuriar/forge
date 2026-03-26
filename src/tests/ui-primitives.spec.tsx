import { render, screen } from '@testing-library/react'
import { AppProviders } from '@/app/providers/AppProviders'
import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { SyncIndicator } from '@/components/status/SyncIndicator'

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
})
