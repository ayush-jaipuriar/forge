import { createEmptyCalendarCollisionSummary } from '@/domain/calendar/types'
import type { CalendarCollisionSummary, ExternalCalendarEventCacheRecord } from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'

type BuildCalendarCollisionSummaryInput = {
  date: string
  blocks: BlockInstance[]
  events: ExternalCalendarEventCacheRecord[]
  source: CalendarCollisionSummary['source']
}

export function buildCalendarCollisionSummary({
  date,
  blocks,
  events,
  source,
}: BuildCalendarCollisionSummaryInput): CalendarCollisionSummary {
  const externalEvents = events.filter((event) => !event.isForgeManaged)
  const mirroredBlockCount = events.filter((event) => event.isForgeManaged).length
  const constrainedWindows = blocks.flatMap((block) => {
    if (!block.startTime || !block.endTime) {
      return []
    }

    const blockStart = getBlockDateTime(date, block.startTime)
    const blockEnd = getBlockDateTime(date, block.endTime)
    const overlappingEvents = externalEvents.filter((event) => rangesOverlap(blockStart, blockEnd, event.startsAt, event.endsAt))

    if (overlappingEvents.length === 0) {
      return []
    }

    return [
      {
        startsAt: blockStart,
        endsAt: blockEnd,
        reason: `${block.title} overlaps ${overlappingEvents.map((event) => event.title).join(', ')}`,
        eventIds: overlappingEvents.map((event) => event.id),
      },
    ]
  })

  const overlappingEventCount = new Set(constrainedWindows.flatMap((window) => window.eventIds)).size
  const severity = getCollisionSeverity({
    blocks,
    constrainedEventIds: new Set(constrainedWindows.flatMap((window) => window.eventIds)),
    events,
  })

  return {
    date,
    severity,
    overlappingEventCount,
    constrainedWindows,
    mirroredBlockCount,
    source,
  }
}

function getCollisionSeverity(args: {
  blocks: BlockInstance[]
  constrainedEventIds: Set<string>
  events: ExternalCalendarEventCacheRecord[]
}): CalendarCollisionSummary['severity'] {
  if (args.constrainedEventIds.size === 0) {
    return 'none'
  }

  const hardOverlap = args.blocks.some((block) => {
    if (!block.startTime || !block.endTime) {
      return false
    }

    if (!(block.requiredOutput || block.kind === 'deepWork' || block.kind === 'prep' || block.kind === 'workout')) {
      return false
    }

    const blockStart = getBlockDateTime(block.date, block.startTime)
    const blockEnd = getBlockDateTime(block.date, block.endTime)

    return args.events
      .filter((event) => !event.isForgeManaged)
      .some(
      (event) =>
        args.constrainedEventIds.has(event.id) &&
        rangesOverlap(blockStart, blockEnd, event.startsAt, event.endsAt),
      )
  })

  return hardOverlap ? 'hard' : 'soft'
}

function getBlockDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return new Date(startA).getTime() < new Date(endB).getTime() && new Date(startB).getTime() < new Date(endA).getTime()
}

export function buildEmptyOrCollisionSummary(args: BuildCalendarCollisionSummaryInput): CalendarCollisionSummary {
  if (args.events.length === 0) {
    return createEmptyCalendarCollisionSummary(args.date)
  }

  return buildCalendarCollisionSummary(args)
}
