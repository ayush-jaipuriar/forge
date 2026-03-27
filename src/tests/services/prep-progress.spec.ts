import { beforeEach, describe, expect, it } from 'vitest'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { updatePrepTopicProgress } from '@/services/settings/prepProgressService'

describe('updatePrepTopicProgress', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists prep progress locally and queues a settings sync item', async () => {
    const result = await updatePrepTopicProgress({
      topicId: 'dsa-arrays',
      patch: {
        confidence: 'high',
        revisionCount: 2,
        solvedCount: 3,
        hoursSpent: 1.5,
      },
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(settings?.prepTopicProgress['dsa-arrays']).toMatchObject({
      confidence: 'high',
      revisionCount: 2,
      solvedCount: 3,
      hoursSpent: 1.5,
    })
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].actionType).toBe('upsertSettings')
  })
})
