import { beforeEach, describe, expect, it } from 'vitest'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { updateBlockExecutionNote, updateBlockStatus } from '@/domain/routine/mutations'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'

describe('generateAnalyticsSnapshotBundle', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('produces daily, weekly, rolling, projection, and metadata outputs from source records', async () => {
    const settings = await localSettingsRepository.getDefault()
    settings.dailySignals['2026-03-26'] = {
      sleepStatus: 'met',
      energyStatus: 'high',
      sleepDurationHours: 8,
    }
    settings.prepTopicProgress['dsa-arrays'] = {
      confidence: 'high',
      exposureState: 'retention',
      revisionCount: 2,
      solvedCount: 6,
      exposureCount: 3,
      hoursSpent: 4,
      notes: 'Strong week.',
    }
    await localSettingsRepository.upsert(settings)

    const firstDayBase = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const firstPrime = firstDayBase.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)
    const firstDay = updateBlockExecutionNote(updateBlockStatus(firstDayBase, firstPrime!.id, 'completed'), firstPrime!.id, 'Shipped meaningful output.')
    const secondDay = generateDayInstance({
      date: '2026-03-27',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(firstDay)
    await localDayInstanceRepository.upsert(secondDay)

    const bundle = generateAnalyticsSnapshotBundle({
      dayInstances: await localDayInstanceRepository.listAll(),
      settings: await localSettingsRepository.getDefault(),
      anchorDate: new Date('2026-03-28T00:00:00'),
    })

    expect(bundle.dailySnapshots).toHaveLength(2)
    expect(bundle.weeklySnapshots.length).toBeGreaterThan(0)
    expect(bundle.rollingSnapshots).toHaveLength(4)
    expect(bundle.metadata.functionsEnabled).toBe(true)
    expect(bundle.projection.lastEvaluatedDate).toBe('2026-03-28')
  })
})
