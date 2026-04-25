import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SchedulePage } from '@/features/schedule/pages/SchedulePage'

type MockWeeklyWorkspaceResult = {
  isLoading: boolean
  data: unknown
}

const weeklyWorkspaceMock = vi.hoisted(() => ({
  value: null as MockWeeklyWorkspaceResult | null,
}))

const updateDayTypeOverrideMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

const updateDayModeMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

const updateBlockStatusMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

vi.mock('@/features/schedule/hooks/useWeeklyWorkspace', () => ({
  useWeeklyWorkspace: () => weeklyWorkspaceMock.value,
}))

vi.mock('@/features/schedule/hooks/useUpdateDayTypeOverride', () => ({
  useUpdateDayTypeOverride: () => updateDayTypeOverrideMock,
}))

vi.mock('@/features/today/hooks/useUpdateDayMode', () => ({
  useUpdateDayMode: () => updateDayModeMock,
}))

vi.mock('@/features/today/hooks/useUpdateBlockStatus', () => ({
  useUpdateBlockStatus: () => updateBlockStatusMock,
}))

describe('SchedulePage', () => {
  beforeEach(() => {
    updateDayTypeOverrideMock.mutate.mockReset()
    updateDayModeMock.mutate.mockReset()
    updateBlockStatusMock.mutate.mockReset()

    weeklyWorkspaceMock.value = {
      isLoading: false,
      data: {
        calendar: {
          connectionStatus: 'connected',
          syncState: {
            externalEventSyncStatus: 'stable',
            mirrorSyncStatus: 'idle',
            lastExternalSyncAt: '2026-04-04T05:00:00.000Z',
            lastMirrorSyncAt: '2026-04-04T05:30:00.000Z',
            lastMirrorSyncError: null,
          },
          constrainedDayCount: 2,
        },
        globalSignals: [
          {
            id: 'signal-1',
            title: 'Protect Tuesday deep work',
            detail: 'Tuesday carries the highest forecasted pressure and should absorb the least extra drift.',
            tone: 'warning',
            badge: 'priority',
          },
        ],
        days: [
          {
            id: 'day-1',
            date: '2026-04-06',
            dateLabel: 'Apr 6',
            weekdayLabel: 'Mon',
            label: 'Deep Work Day',
            focusLabel: 'Architecture and interview prep',
            baseDayType: 'deepWork',
            dayType: 'deepWork',
            dayMode: 'normal',
            isDayTypeOverridden: false,
            allowedDayTypes: [
              { value: 'deepWork', label: 'Deep Work' },
              { value: 'workFromOffice', label: 'Work From Office' },
            ],
            expectationSummary: ['Protect the morning block.'],
            operationalSignals: [],
            calendarSummary: {
              severity: 'warning',
              overlappingEventCount: 1,
            },
            blocks: [
              {
                id: 'block-1',
                title: 'Prime Deep Work',
                detail: 'Architecture review and mock systems prompts',
                startTime: '08:00',
                durationMinutes: 90,
                status: 'planned',
              },
            ],
          },
          {
            id: 'day-2',
            date: '2026-04-07',
            dateLabel: 'Apr 7',
            weekdayLabel: 'Tue',
            label: 'Execution Day',
            focusLabel: 'Shipping and review',
            baseDayType: 'workFromOffice',
            dayType: 'workFromOffice',
            dayMode: 'lowEnergy',
            isDayTypeOverridden: true,
            allowedDayTypes: [
              { value: 'workFromOffice', label: 'Work From Office' },
              { value: 'deepWork', label: 'Deep Work' },
            ],
            expectationSummary: ['Keep review windows short.'],
            operationalSignals: [
              {
                id: 'signal-2',
                title: 'Guard the afternoon block',
                detail: 'This day already has review drag. Avoid adding more reactive work.',
                tone: 'warning',
                badge: 'focus',
              },
            ],
            calendarSummary: {
              severity: 'none',
              overlappingEventCount: 0,
            },
            blocks: [
              {
                id: 'block-2',
                title: 'Review and merge window',
                detail: 'Close code review loops and ship the approved work.',
                startTime: '10:00',
                durationMinutes: 60,
                status: 'planned',
              },
            ],
          },
        ],
      },
    }
  })

  it('renders the weekly board and updates the selected-day inspector when a different day is chosen', async () => {
    const user = userEvent.setup()

    render(<SchedulePage />)

    expect(screen.getByRole('heading', { name: /shape the week before drift compounds/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /mon · deep work day/i })).toBeInTheDocument()
    expect(screen.getAllByText(/deep work day/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /execution day/i }))

    expect(screen.getAllByText(/execution day/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/guard the afternoon block/i)).toBeInTheDocument()
  })

  it('keeps override and block actions wired through the selected day controls', async () => {
    const user = userEvent.setup()

    render(<SchedulePage />)

    await user.click(screen.getByRole('button', { name: /execution day/i }))
    await user.click(screen.getByRole('button', { name: /return to normal/i }))
    await user.click(screen.getByRole('button', { name: /^done$/i }))

    expect(updateDayModeMock.mutate).toHaveBeenCalledWith({
      date: '2026-04-07',
      dayMode: 'normal',
    })
    expect(updateBlockStatusMock.mutate).toHaveBeenCalledWith({
      date: '2026-04-07',
      blockId: 'block-2',
      status: 'completed',
    })
  })
})
