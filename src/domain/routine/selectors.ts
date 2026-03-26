import type { BlockInstance, DayInstance } from '@/domain/routine/types'

export function getCurrentBlock(dayInstance: DayInstance, currentTime = getTimeKey(new Date())) {
  const timedBlock = dayInstance.blocks.find((block) =>
    block.startTime && block.endTime ? isTimeWithinRange(currentTime, block.startTime, block.endTime) : false,
  )

  if (timedBlock) {
    return timedBlock
  }

  return getTopPriorityBlocks(dayInstance, 1)[0] ?? dayInstance.blocks[0] ?? null
}

export function getTopPriorityBlocks(dayInstance: DayInstance, limit = 3): BlockInstance[] {
  return [...dayInstance.blocks]
    .sort((left, right) => scoreBlock(right) - scoreBlock(left))
    .slice(0, limit)
}

function scoreBlock(block: BlockInstance) {
  let score = 0

  if (block.requiredOutput) {
    score += 50
  }

  if (block.kind === 'deepWork') {
    score += 40
  }

  if (block.kind === 'prep') {
    score += 20
  }

  if (block.kind === 'workout') {
    score += 15
  }

  if (!block.optional) {
    score += 10
  }

  if (block.startTime) {
    score += 5
  }

  return score
}

function isTimeWithinRange(time: string, start: string, end: string) {
  return time >= start && time <= end
}

function getTimeKey(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${hours}:${minutes}`
}
