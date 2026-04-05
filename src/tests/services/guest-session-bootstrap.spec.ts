import { beforeEach, describe, expect, it } from 'vitest'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { getDateKey } from '@/domain/routine/week'
import { bootstrapGuestSession } from '@/features/auth/services/bootstrapGuestSession'

describe('bootstrapGuestSession', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('seeds a believable local guest workspace with settings, history, and prep progress', async () => {
    const anchorDate = new Date('2026-04-05T09:00:00.000Z')

    await bootstrapGuestSession(anchorDate)

    const settings = await localSettingsRepository.getDefault()
    const dayInstances = await localDayInstanceRepository.listAll()
    const today = await localDayInstanceRepository.getByDate(getDateKey(anchorDate))

    expect(settings).not.toBeNull()
    expect(dayInstances.length).toBe(28)
    expect(today).not.toBeNull()
    expect(Object.keys(settings?.prepTopicProgress ?? {})).not.toHaveLength(0)
    expect(settings?.dailySignals[getDateKey(anchorDate)]).toMatchObject({
      sleepStatus: 'met',
      energyStatus: 'normal',
    })
  })
})
