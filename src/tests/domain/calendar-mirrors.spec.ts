import { describe, expect, it } from 'vitest'
import { deriveCalendarMirrorOperations } from '@/domain/calendar/mirrors'
import type { CalendarMirrorRecord } from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'

function createBlock(overrides: Partial<BlockInstance> = {}): BlockInstance {
  return {
    id: 'prime-block',
    templateId: 'prime-block',
    title: 'Prime Deep Block',
    kind: 'deepWork',
    status: 'planned',
    startTime: '08:00',
    endTime: '09:20',
    detail: 'Protect the prime work window.',
    focusAreas: ['systemDesign'],
    requiredOutput: true,
    optional: false,
    date: '2026-03-30',
    ...overrides,
  }
}

function createMirrorRecord(overrides: Partial<CalendarMirrorRecord> = {}): CalendarMirrorRecord {
  return {
    id: 'calendar-mirror:2026-03-30:prime-block',
    provider: 'google',
    calendarId: 'primary',
    providerEventId: 'event-1',
    blockId: 'prime-block',
    dayDate: '2026-03-30',
    sourceBlockTitle: 'Prime Deep Block',
    sourceBlockStatus: 'planned',
    startsAt: '2026-03-30T08:00:00',
    endsAt: '2026-03-30T09:20:00',
    eventTitle: '[FORGE] Prime Deep Block',
    colorId: '11',
    writeMode: 'majorBlocks',
    status: 'synced',
    lastSyncedAt: '2026-03-30T03:30:00.000Z',
    metadataVersion: 1,
    ...overrides,
  }
}

describe('calendar mirror reconciliation', () => {
  it('creates a mirror for an eligible major block with no existing record', () => {
    const operations = deriveCalendarMirrorOperations({
      blocks: [createBlock()],
      existingRecords: [],
      calendarId: 'primary',
    })

    expect(operations).toHaveLength(1)
    expect(operations[0]).toMatchObject({
      type: 'create',
      desired: {
        blockId: 'prime-block',
        eventTitle: '[FORGE] Prime Deep Block',
      },
    })
  })

  it('updates an existing mirror when the block timing changes', () => {
    const operations = deriveCalendarMirrorOperations({
      blocks: [
        createBlock({
          startTime: '08:30',
          endTime: '09:50',
        }),
      ],
      existingRecords: [createMirrorRecord()],
      calendarId: 'primary',
    })

    expect(operations[0]).toMatchObject({
      type: 'update',
      desired: {
        startsAt: '2026-03-30T08:30:00',
        endsAt: '2026-03-30T09:50:00',
      },
    })
  })

  it('deletes an existing mirror when the source block is no longer eligible', () => {
    const operations = deriveCalendarMirrorOperations({
      blocks: [createBlock({ status: 'moved' })],
      existingRecords: [createMirrorRecord()],
      calendarId: 'primary',
    })

    expect(operations[0]).toMatchObject({
      type: 'delete',
      reason: 'missingSourceBlock',
    })
  })

  it('returns a noop when an existing mirror already matches the desired block state', () => {
    const operations = deriveCalendarMirrorOperations({
      blocks: [createBlock()],
      existingRecords: [createMirrorRecord()],
      calendarId: 'primary',
    })

    expect(operations[0]).toMatchObject({
      type: 'noop',
    })
  })
})
