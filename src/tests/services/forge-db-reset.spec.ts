import { beforeEach, describe, expect, it } from 'vitest'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'

describe('resetForgeDb', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('clears persisted workspace records and still allows the app to reopen local storage immediately', async () => {
    const seededSettings = await localSettingsRepository.getDefault()
    seededSettings.dayModeOverrides['2026-04-05'] = 'ideal'
    await localSettingsRepository.upsert(seededSettings)

    await localDayInstanceRepository.upsert(
      generateDayInstance({
        date: '2026-04-05',
        routine: forgeRoutine,
        dayMode: 'ideal',
      }),
    )

    await resetForgeDb()

    const reopenedSettings = await localSettingsRepository.getDefault()
    const reopenedDayInstances = await localDayInstanceRepository.listAll()

    expect(reopenedSettings.dayModeOverrides).toEqual({})
    expect(reopenedDayInstances).toEqual([])
  })
})
