import type { BlockStatus } from '@/domain/common/types'
import type { DayInstance } from '@/domain/routine/types'

export function updateBlockStatus(dayInstance: DayInstance, blockId: string, status: BlockStatus): DayInstance {
  let updated = false

  const blocks = dayInstance.blocks.map((block) => {
    if (block.id !== blockId) {
      return block
    }

    if (block.status === status) {
      return block
    }

    updated = true

    return {
      ...block,
      status,
    }
  })

  if (!updated) {
    return dayInstance
  }

  return {
    ...dayInstance,
    blocks,
  }
}
