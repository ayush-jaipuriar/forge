import {
  buildCalendarMirrorRecordId,
  buildForgeMirrorDescription,
  formatForgeEventTitle,
  getForgeCalendarColorId,
  shouldMirrorRoutineBlock,
  FORGE_CALENDAR_METADATA_VERSION,
} from '@/domain/calendar/conventions'
import type { CalendarManagedEventMode, CalendarMirrorRecord } from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'

export type DesiredCalendarMirror = {
  id: string
  calendarId: string
  dayDate: string
  blockId: string
  title: string
  sourceBlockStatus: BlockInstance['status']
  startsAt: string
  endsAt: string
  eventTitle: string
  description: string
  colorId: string
  writeMode: CalendarManagedEventMode
}

export type CalendarMirrorOperation =
  | {
      type: 'create'
      desired: DesiredCalendarMirror
    }
  | {
      type: 'update'
      desired: DesiredCalendarMirror
      existing: CalendarMirrorRecord
    }
  | {
      type: 'delete'
      existing: CalendarMirrorRecord
      reason: 'noLongerEligible' | 'missingSourceBlock'
    }
  | {
      type: 'noop'
      desired: DesiredCalendarMirror
      existing: CalendarMirrorRecord
    }

export function buildDesiredCalendarMirror(
  block: BlockInstance,
  calendarId: string,
  writeMode: CalendarManagedEventMode = 'majorBlocks',
): DesiredCalendarMirror | null {
  if (!shouldKeepMirrorForBlock(block)) {
    return null
  }

  if (!block.startTime || !block.endTime) {
    return null
  }

  return {
    id: buildCalendarMirrorRecordId(block.date, block.id),
    calendarId,
    dayDate: block.date,
    blockId: block.id,
    title: block.title,
    sourceBlockStatus: block.status,
    startsAt: `${block.date}T${block.startTime}:00`,
    endsAt: `${block.date}T${block.endTime}:00`,
    eventTitle: formatForgeEventTitle(block.title),
    description: buildForgeMirrorDescription(block),
    colorId: getForgeCalendarColorId(block),
    writeMode,
  }
}

export function deriveCalendarMirrorOperations(args: {
  blocks: BlockInstance[]
  existingRecords: CalendarMirrorRecord[]
  calendarId: string
  writeMode?: CalendarManagedEventMode
}) {
  const desiredById = new Map<string, DesiredCalendarMirror>()
  const writeMode = args.writeMode ?? 'majorBlocks'

  for (const block of args.blocks) {
    const desired = buildDesiredCalendarMirror(block, args.calendarId, writeMode)

    if (desired) {
      desiredById.set(desired.id, desired)
    }
  }

  const existingById = new Map(args.existingRecords.map((record) => [record.id, record]))
  const operations: CalendarMirrorOperation[] = []

  for (const desired of desiredById.values()) {
    const existing = existingById.get(desired.id)

    if (!existing || !existing.providerEventId) {
      operations.push({
        type: 'create',
        desired,
      })
      continue
    }

    operations.push(
      shouldUpdateMirrorRecord({
        desired,
        existing,
      })
        ? {
            type: 'update',
            desired,
            existing,
          }
        : {
            type: 'noop',
            desired,
            existing,
          },
    )
  }

  for (const existing of args.existingRecords) {
    if (desiredById.has(existing.id)) {
      continue
    }

    operations.push({
      type: 'delete',
      existing,
      reason: 'missingSourceBlock',
    })
  }

  return operations
}

export function shouldKeepMirrorForBlock(block: BlockInstance) {
  return shouldMirrorRoutineBlock(block) && block.status !== 'skipped' && block.status !== 'moved'
}

function shouldUpdateMirrorRecord(args: {
  desired: DesiredCalendarMirror
  existing: CalendarMirrorRecord
}) {
  return (
    args.existing.sourceBlockTitle !== args.desired.title ||
    args.existing.sourceBlockStatus !== args.desired.sourceBlockStatus ||
    args.existing.startsAt !== args.desired.startsAt ||
    args.existing.endsAt !== args.desired.endsAt ||
    args.existing.eventTitle !== args.desired.eventTitle ||
    args.existing.colorId !== args.desired.colorId ||
    args.existing.writeMode !== args.desired.writeMode ||
    args.existing.metadataVersion !== FORGE_CALENDAR_METADATA_VERSION ||
    args.existing.status !== 'synced'
  )
}
