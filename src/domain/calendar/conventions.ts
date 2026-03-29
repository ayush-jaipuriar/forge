import type { BlockInstance } from '@/domain/routine/types'
import type { CalendarMirrorRecord, MirroredRoutineBlock } from '@/domain/calendar/types'

export const FORGE_EVENT_PREFIX = '[FORGE]'
export const FORGE_CALENDAR_METADATA_VERSION = 1

export function formatForgeEventTitle(blockTitle: string) {
  return `${FORGE_EVENT_PREFIX} ${blockTitle}`
}

export function shouldMirrorRoutineBlock(block: BlockInstance) {
  return Boolean(block.startTime && block.endTime && !block.optional && (block.requiredOutput || block.kind === 'deepWork' || block.kind === 'workout'))
}

export function getForgeCalendarColorId(block: BlockInstance) {
  switch (block.kind) {
    case 'deepWork':
      return '11'
    case 'workout':
      return '2'
    case 'prep':
      return '5'
    default:
      return '8'
  }
}

export function buildForgeMirrorDescription(block: BlockInstance) {
  return [
    'Forge-managed mirror',
    `Block: ${block.title}`,
    `Forge blockId: ${block.id}`,
    `Day: ${block.date}`,
    `Kind: ${block.kind}`,
    `Required output: ${block.requiredOutput ? 'yes' : 'no'}`,
    `Metadata version: ${FORGE_CALENDAR_METADATA_VERSION}`,
  ].join('\n')
}

export function buildCalendarMirrorRecordId(dayDate: string, blockId: string) {
  return `calendar-mirror:${dayDate}:${blockId}`
}

export function buildMirrorRecordFromEvent(args: {
  block: BlockInstance
  calendarId: string
  providerEventId: string
  status: CalendarMirrorRecord['status']
  writeMode: CalendarMirrorRecord['writeMode']
  lastSyncedAt: string
  lastError?: string
}): CalendarMirrorRecord {
  return {
    id: buildCalendarMirrorRecordId(args.block.date, args.block.id),
    provider: 'google',
    calendarId: args.calendarId,
    providerEventId: args.providerEventId,
    blockId: args.block.id,
    dayDate: args.block.date,
    sourceBlockTitle: args.block.title,
    sourceBlockStatus: args.block.status,
    startsAt: args.block.startTime,
    endsAt: args.block.endTime,
    eventTitle: formatForgeEventTitle(args.block.title),
    colorId: getForgeCalendarColorId(args.block),
    writeMode: args.writeMode,
    status: args.status,
    lastSyncedAt: args.lastSyncedAt,
    lastError: args.lastError,
    metadataVersion: FORGE_CALENDAR_METADATA_VERSION,
  }
}

export function buildMirroredRoutineBlockPreview({
  blockId,
  dayDate,
  title,
  startsAt,
  endsAt,
}: {
  blockId: string
  dayDate: string
  title: string
  startsAt?: string
  endsAt?: string
}): MirroredRoutineBlock {
  return {
    blockId,
    dayDate,
    title,
    eventTitle: formatForgeEventTitle(title),
    startsAt,
    endsAt,
    writeMode: 'planned',
  }
}
