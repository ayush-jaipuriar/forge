import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanPage } from '@/features/plan/pages/PlanPage'

type MockQueryResult = {
  isLoading: boolean
  data: unknown
}

const weeklyWorkspaceMock = vi.hoisted(() => ({
  value: null as MockQueryResult | null,
}))

const prepWorkspaceMock = vi.hoisted(() => ({
  value: null as MockQueryResult | null,
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

const updateTopicProgressMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}))

vi.mock('@/features/schedule/hooks/useWeeklyWorkspace', () => ({
  useWeeklyWorkspace: () => weeklyWorkspaceMock.value,
}))

vi.mock('@/features/prep/hooks/usePrepWorkspace', () => ({
  usePrepWorkspace: () => prepWorkspaceMock.value,
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

vi.mock('@/features/prep/hooks/useUpdatePrepTopicProgress', () => ({
  useUpdatePrepTopicProgress: () => updateTopicProgressMock,
}))

describe('PlanPage', () => {
  beforeEach(() => {
    updateDayTypeOverrideMock.mutate.mockReset()
    updateDayModeMock.mutate.mockReset()
    updateBlockStatusMock.mutate.mockReset()
    updateTopicProgressMock.mutate.mockReset()

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
            detail: 'Tuesday carries the highest forecasted pressure.',
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
            baseDayType: 'weekendDeepWork',
            dayType: 'weekendDeepWork',
            dayMode: 'normal',
            isDayTypeOverridden: false,
            allowedDayTypes: [
              { value: 'weekendDeepWork', label: 'Weekend Deep Work' },
              { value: 'weekendConsolidation', label: 'Weekend Consolidation' },
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
                templateId: 'template-1',
                title: 'Prime Deep Work',
                detail: 'Architecture review and mock systems prompts.',
                kind: 'deepWork',
                focusAreas: ['System Design'],
                requiredOutput: true,
                optional: false,
                date: '2026-04-06',
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
            baseDayType: 'wfoContinuity',
            dayType: 'wfoContinuity',
            dayMode: 'lowEnergy',
            isDayTypeOverridden: true,
            allowedDayTypes: [
              { value: 'wfoContinuity', label: 'WFO Continuity' },
              { value: 'wfhHighOutput', label: 'WFH High Output' },
            ],
            expectationSummary: ['Keep review windows short.'],
            operationalSignals: [
              {
                id: 'signal-2',
                title: 'Guard the afternoon block',
                detail: 'Avoid adding reactive work.',
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
                templateId: 'template-2',
                title: 'Review and merge window',
                detail: 'Close code review loops.',
                kind: 'review',
                focusAreas: ['Execution'],
                requiredOutput: true,
                optional: false,
                date: '2026-04-07',
                startTime: '10:00',
                durationMinutes: 60,
                status: 'planned',
              },
            ],
          },
        ],
      },
    }

    prepWorkspaceMock.value = {
      isLoading: false,
      data: {
        dayLabel: 'Deep Work Day',
        totalTopicCount: 4,
        focusedDomains: [{ domain: 'dsa', label: 'DSA', readinessLevel: 'building' }],
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
            domain: 'javaBackend',
            label: 'Java / Backend',
            touchedTopicCount: 2,
            topicCount: 3,
            highConfidenceCount: 2,
            readinessLevel: 'onTrack',
            hoursSpent: 6,
            primaryGroups: ['Caching', 'Queues'],
          },
        ],
        topicsByDomain: {
          dsa: [
            {
              id: 'dsa-1',
              domain: 'dsa',
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
          ],
          javaBackend: [
            {
              id: 'backend-1',
              domain: 'javaBackend',
              title: 'Caching',
              group: 'Systems',
              readinessLevel: 'onTrack',
              confidence: 'high',
              exposureState: 'retention',
              revisionCount: 3,
              solvedCount: 0,
              exposureCount: 2,
              hoursSpent: 2.5,
              notes: 'Good mental model.',
            },
          ],
          systemDesign: [],
          lld: [],
          secondary: [],
        },
      },
    }
  })

  it('renders week, selected day, prep pressure, and calendar as one Plan surface', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/plan']}>
        <PlanPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /shape the week/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /^week$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /^prep$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /choose the day to tune/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /mon · deep work day/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /prep pressure/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /outside commitments/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /execution day/i }))

    expect(screen.getByRole('heading', { name: /tue · execution day/i })).toBeInTheDocument()
  })

  it('keeps selected-day and prep actions wired through the unified Plan surface', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/plan?view=prep']}>
        <PlanPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /execution day/i }))
    await user.click(screen.getByRole('button', { name: /^normal$/i }))
    await user.click(screen.getByRole('button', { name: /^done$/i }))
    await user.click(screen.getByRole('button', { name: /java \/ backend/i }))
    await user.click(screen.getByRole('button', { name: /^\+ revision$/i }))

    expect(updateDayModeMock.mutate).toHaveBeenCalledWith({
      date: '2026-04-07',
      dayMode: 'normal',
    })
    expect(updateBlockStatusMock.mutate).toHaveBeenCalledWith({
      date: '2026-04-07',
      blockId: 'block-2',
      status: 'completed',
    })
    expect(updateTopicProgressMock.mutate).toHaveBeenCalledWith({
      topicId: 'backend-1',
      patch: { revisionCount: 4 },
    })
  })
})
