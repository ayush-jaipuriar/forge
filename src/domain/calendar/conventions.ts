import type { MirroredRoutineBlock } from '@/domain/calendar/types'

export const FORGE_EVENT_PREFIX = '[FORGE]'

export function formatForgeEventTitle(blockTitle: string) {
  return `${FORGE_EVENT_PREFIX} ${blockTitle}`
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
