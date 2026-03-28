import { beforeEach, describe, expect, it } from 'vitest'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { updateBlockStatus } from '@/domain/routine/mutations'
import { getRollingAnalyticsWorkspace } from '@/services/analytics/analyticsPersistenceService'

describe('getRollingAnalyticsWorkspace', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('loads historical day instances and current settings into a rolling analytics snapshot', async () => {
    const settings = await localSettingsRepository.getDefault()
    settings.dailySignals['2026-03-26'] = {
      sleepStatus: 'met',
      energyStatus: 'high',
      sleepDurationHours: 7.9,
    }
    settings.workoutLogs['2026-03-26'] = {
      date: '2026-03-26',
      workoutType: 'upperA',
      label: 'Upper A',
      status: 'done',
    }
    settings.prepTopicProgress['dsa-arrays'] = {
      confidence: 'high',
      exposureState: 'retention',
      revisionCount: 2,
      solvedCount: 6,
      exposureCount: 2,
      hoursSpent: 4,
      notes: 'Recovered well.',
    }
    await localSettingsRepository.upsert(settings)

    const firstDay = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })
    const secondDayBase = generateDayInstance({
      date: '2026-03-27',
      routine: forgeRoutine,
    })
    const primeBlock = secondDayBase.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput)
    const secondDay = updateBlockStatus(secondDayBase, primeBlock!.id, 'skipped')

    await localDayInstanceRepository.upsert(firstDay)
    await localDayInstanceRepository.upsert(secondDay)

    const workspace = await getRollingAnalyticsWorkspace('7d', new Date('2026-03-28T00:00:00'))

    expect(workspace.windowKey).toBe('7d')
    expect(workspace.facts).toHaveLength(2)
    expect(workspace.snapshot.summaryMetrics.trackedDays).toBe(2)
    expect(workspace.snapshot.summaryMetrics.missedPrimeBlocks).toBe(1)
    expect(workspace.snapshot.breakdowns.byPrepDomain.some((entry) => entry.key === 'dsa')).toBe(true)
  })
})
