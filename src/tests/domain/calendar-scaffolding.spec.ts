import { describe, expect, it } from 'vitest'
import { buildMirroredRoutineBlockPreview, FORGE_EVENT_PREFIX, formatForgeEventTitle } from '@/domain/calendar/conventions'
import { deriveRecommendationCalendarContext } from '@/domain/calendar/deriveRecommendationCalendarContext'
import { createDefaultCalendarConnectionSnapshot } from '@/domain/calendar/types'

describe('calendar scaffolding helpers', () => {
  it('formats future managed event titles with the Forge prefix convention', () => {
    expect(FORGE_EVENT_PREFIX).toBe('[FORGE]')
    expect(formatForgeEventTitle('Prime Deep Block')).toBe('[FORGE] Prime Deep Block')
  })

  it('builds a future mirrored block preview without enabling live write sync', () => {
    const preview = buildMirroredRoutineBlockPreview({
      blockId: 'wfh-deep-block',
      dayDate: '2026-03-27',
      title: 'Prime Deep Block',
      startsAt: '2026-03-27T08:00:00+05:30',
      endsAt: '2026-03-27T09:20:00+05:30',
    })

    expect(preview.eventTitle).toBe('[FORGE] Prime Deep Block')
    expect(preview.writeMode).toBe('planned')
  })

  it('derives a constrained recommendation context when collision windows exist', () => {
    const context = deriveRecommendationCalendarContext({
      date: '2026-03-27',
      connection: {
        ...createDefaultCalendarConnectionSnapshot(),
        connectionStatus: 'scaffoldingReady',
      },
      summary: {
        date: '2026-03-27',
        severity: 'hard',
        overlappingEventCount: 2,
        mirroredBlockCount: 0,
        source: 'placeholder',
        constrainedWindows: [
          {
            startsAt: '2026-03-27T09:00:00+05:30',
            endsAt: '2026-03-27T10:00:00+05:30',
            reason: 'Team meeting placeholder',
            eventIds: ['evt_1'],
          },
        ],
      },
    })

    expect(context.conflictState).toBe('constrained')
    expect(context.connectionStatus).toBe('scaffoldingReady')
  })
})
