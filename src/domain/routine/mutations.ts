import type { BlockStatus } from '@/domain/common/types'
import type { BlockInstance, DayInstance } from '@/domain/routine/types'

export function updateBlockStatus(dayInstance: DayInstance, blockId: string, status: BlockStatus): DayInstance {
  return updateBlock(dayInstance, blockId, (block) => {
    if (block.status === status) {
      return block
    }

    return {
      ...block,
      status,
    }
  })
}

export function updateBlockExecutionNote(dayInstance: DayInstance, blockId: string, executionNote: string): DayInstance {
  const normalizedNote = normalizeExecutionNote(executionNote)

  return updateBlock(dayInstance, blockId, (block) => {
    if ((block.executionNote ?? undefined) === normalizedNote) {
      return block
    }

    return {
      ...block,
      executionNote: normalizedNote,
    }
  })
}

function updateBlock(dayInstance: DayInstance, blockId: string, updater: (block: BlockInstance) => BlockInstance): DayInstance {
  let updated = false

  const blocks = dayInstance.blocks.map((block) => {
    if (block.id !== blockId) {
      return block
    }

    const nextBlock = updater(block)

    if (nextBlock === block) {
      return block
    }

    updated = true

    return nextBlock
  })

  if (!updated) {
    return dayInstance
  }

  return {
    ...dayInstance,
    blocks,
  }
}

function normalizeExecutionNote(note: string) {
  const trimmed = note.trim()

  return trimmed.length > 0 ? trimmed : undefined
}
