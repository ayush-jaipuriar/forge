import { render, screen } from '@testing-library/react'
import { PhysicalPage } from '@/features/physical/pages/PhysicalPage'

const physicalWorkspaceMock = vi.hoisted(() => ({
  value: {
    isLoading: false,
    data: {
      dateKey: '2026-04-04',
      dayInstance: {
        label: 'Weekend Deep Work Day',
        wakeWindow: '06:30',
        sleepWindow: '22:30',
      },
      scheduledWorkout: {
        status: 'planned',
      },
      workout: {
        date: '2026-04-04',
        workoutType: 'strength',
        label: 'Upper Body Lift',
        status: 'planned',
        note: '',
        missReason: undefined,
      },
      weeklyWorkoutSummary: {
        doneCount: 3,
        skippedCount: 1,
        rescheduledCount: 1,
        scheduledCount: 5,
        optionalCount: 2,
        labels: ['Mon · done', 'Wed · rescheduled', 'Fri · skipped'],
      },
      sleepDurationHours: 7.5,
      sleepStatus: 'met',
      sleepTargetHours: 7.5,
      healthIntegration: {
        phaseNotice: 'Health ingestion remains scaffold-only.',
        statusSummaryLabel: 'No provider is connected yet.',
        providers: [
          {
            provider: 'appleHealth',
            displayName: 'Apple Health',
            unavailableLabel: 'Not connected',
            supportedSignalCount: 2,
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

const updateWorkoutLogMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

const updateDailySignalsMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

vi.mock('@/features/physical/hooks/usePhysicalWorkspace', () => ({
  usePhysicalWorkspace: () => physicalWorkspaceMock.value,
}))

vi.mock('@/features/platform/hooks/usePlatformWorkspace', () => ({
  usePlatformWorkspace: () => platformWorkspaceMock.value,
}))

vi.mock('@/features/physical/hooks/useUpdateWorkoutLog', () => ({
  useUpdateWorkoutLog: () => updateWorkoutLogMock,
}))

vi.mock('@/features/today/hooks/useUpdateDailySignals', () => ({
  useUpdateDailySignals: () => updateDailySignalsMock,
}))

describe('PhysicalPage', () => {
  it('renders the physical execution-support layout with daily console and health scaffold', () => {
    render(<PhysicalPage />)

    expect(screen.getByRole('heading', { name: /physical support should stay tied to execution/i })).toBeInTheDocument()
    expect(screen.getAllByText(/daily training console/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/sleep support/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/weekly training shape/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /recovery and sleep provider path/i })).toBeInTheDocument()
  })
})
