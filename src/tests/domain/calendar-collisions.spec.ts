import { describe, expect, it } from 'vitest'
import { buildCalendarCollisionSummary } from '@/domain/calendar/collisions'
import type { ExternalCalendarEventCacheRecord } from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'

describe('calendar collision summaries', () => {
  it('marks a deep-work overlap as a hard collision', () => {
    const blocks: BlockInstance[] = [
      {
        id: 'prime-block',
        templateId: 'prime-block',
        title: 'Prime Deep Block',
        kind: 'deepWork',
        status: 'planned',
        startTime: '08:00',
        endTime: '09:20',
        detail: 'Protect the highest-value work window.',
        focusAreas: ['dsa'],
        requiredOutput: true,
        optional: false,
        date: '2026-03-30',
      },
    ]

    const events: ExternalCalendarEventCacheRecord[] = [
      {
        id: 'google:event-1',
        provider: 'google',
        calendarId: 'primary',
        providerEventId: 'event-1',
        title: 'Standup',
        startsAt: '2026-03-30T08:30:00+05:30',
        endsAt: '2026-03-30T09:00:00+05:30',
        allDay: false,
        isForgeManaged: false,
        date: '2026-03-30',
        fetchedAt: '2026-03-30T07:00:00.000Z',
      },
    ]

    const summary = buildCalendarCollisionSummary({
      date: '2026-03-30',
      blocks,
      events,
      source: 'liveMirror',
    })

    expect(summary.severity).toBe('hard')
    expect(summary.overlappingEventCount).toBe(1)
    expect(summary.constrainedWindows[0]?.reason).toContain('Prime Deep Block overlaps Standup')
  })
})
