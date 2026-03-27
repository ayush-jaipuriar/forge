import { describe, expect, it } from 'vitest'
import { forgeRoutine } from '@/data/seeds'
import { updateBlockStatus } from '@/domain/routine/mutations'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { getCurrentBlock, getTopPriorityBlocks } from '@/domain/routine/selectors'

describe('day execution mutations and selectors', () => {
  it('updates a block status immutably', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    const updatedDay = updateBlockStatus(dayInstance, dayInstance.blocks[0].id, 'completed')

    expect(updatedDay).not.toBe(dayInstance)
    expect(updatedDay.blocks[0].status).toBe('completed')
    expect(dayInstance.blocks[0].status).toBe('planned')
  })

  it('excludes completed blocks from the live current-block and priority selectors', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    const originalCurrentBlock = getCurrentBlock(dayInstance, '07:15')

    expect(originalCurrentBlock).not.toBeNull()

    const updatedDay = updateBlockStatus(dayInstance, originalCurrentBlock!.id, 'completed')
    const nextCurrentBlock = getCurrentBlock(updatedDay, '07:15')
    const livePriorities = getTopPriorityBlocks(updatedDay, 10)

    expect(nextCurrentBlock?.id).not.toBe(originalCurrentBlock?.id)
    expect(livePriorities.some((block) => block.id === originalCurrentBlock?.id)).toBe(false)
  })
})
