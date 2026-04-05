import { beforeEach, describe, expect, it } from 'vitest'
import { localDayInstanceRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { updateDayBlockNote, updateDayBlockStatus } from '@/services/routine/dayExecutionService'

describe('updateDayBlockStatus', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists a block-status change locally and queues a day-instance sync item', async () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(dayInstance)

    const result = await updateDayBlockStatus({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      status: 'completed',
    })

    const updatedDay = await localDayInstanceRepository.getByDate(dayInstance.date)
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(updatedDay?.blocks[0].status).toBe('completed')
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertDayInstance')

    if (queueItems[0].actionType !== 'upsertDayInstance') {
      throw new Error('Expected a day-instance sync queue item.')
    }

    expect(queueItems[0].payload.blocks[0].status).toBe('completed')
  })

  it('replaces superseded day-instance queue items with the latest local snapshot', async () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(dayInstance)

    await updateDayBlockStatus({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      status: 'completed',
    })

    await updateDayBlockStatus({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      status: 'skipped',
    })

    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertDayInstance')

    if (queueItems[0].actionType !== 'upsertDayInstance') {
      throw new Error('Expected a day-instance sync queue item.')
    }

    expect(queueItems[0].payload.blocks[0].status).toBe('skipped')
  })

  it('supports move-later and restore transitions through the same queued day-instance path', async () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(dayInstance)

    await updateDayBlockStatus({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      status: 'moved',
    })

    await updateDayBlockStatus({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      status: 'planned',
    })

    const updatedDay = await localDayInstanceRepository.getByDate(dayInstance.date)
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(updatedDay?.blocks[0].status).toBe('planned')
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertDayInstance')

    if (queueItems[0].actionType !== 'upsertDayInstance') {
      throw new Error('Expected a day-instance sync queue item.')
    }

    expect(queueItems[0].payload.blocks[0].status).toBe('planned')
  })

  it('persists execution notes through the same coalesced day-instance queue path', async () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(dayInstance)

    await updateDayBlockNote({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      executionNote: 'Slipped because the commute ran long.',
    })

    await updateDayBlockNote({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      executionNote: 'Slipped because the commute ran long. Resume with the first focused 30-minute push.',
    })

    const updatedDay = await localDayInstanceRepository.getByDate(dayInstance.date)
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(updatedDay?.blocks[0].executionNote).toBe(
      'Slipped because the commute ran long. Resume with the first focused 30-minute push.',
    )
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertDayInstance')

    if (queueItems[0].actionType !== 'upsertDayInstance') {
      throw new Error('Expected a day-instance sync queue item.')
    }

    expect(queueItems[0].payload.blocks[0].executionNote).toBe(
      'Slipped because the commute ran long. Resume with the first focused 30-minute push.',
    )
  })

  it('keeps guest block mutations local-only when sync is explicitly disabled', async () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(dayInstance)

    const result = await updateDayBlockStatus({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      status: 'completed',
      syncMode: 'localOnly',
    })

    const updatedDay = await localDayInstanceRepository.getByDate(dayInstance.date)
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(0)
    expect(updatedDay?.blocks[0].status).toBe('completed')
    expect(queueItems).toHaveLength(0)
  })
})
