import { beforeEach, describe, expect, it, vi } from 'vitest'

const firestoreDayUpsertMock = vi.hoisted(() => vi.fn())
const firestoreSettingsPatchMock = vi.hoisted(() => vi.fn())

vi.mock('@/data/firebase/firestoreDayInstanceRepository', () => ({
  FirestoreDayInstanceRepository: class {
    upsert = firestoreDayUpsertMock
  },
}))

vi.mock('@/data/firebase/firestoreSettingsRepository', () => ({
  FirestoreSettingsRepository: class {
    patch = firestoreSettingsPatchMock
  },
}))

import { localDayInstanceRepository, localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { updateDayBlockStatus } from '@/services/routine/dayExecutionService'
import { updateDailySignals } from '@/services/settings/dailySignalsService'

describe('authenticated online-only persistence', () => {
  beforeEach(async () => {
    await resetForgeDb()
    firestoreDayUpsertMock.mockReset()
    firestoreSettingsPatchMock.mockReset()
    setNavigatorOnline(true)
  })

  it('writes authenticated day mutations directly to Firestore without queueing local sync work', async () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(dayInstance)

    const result = await updateDayBlockStatus({
      date: dayInstance.date,
      blockId: dayInstance.blocks[0].id,
      status: 'completed',
      userId: 'user-123',
      syncMode: 'cloud',
    })

    const updatedDay = await localDayInstanceRepository.getByDate(dayInstance.date)
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(0)
    expect(updatedDay?.blocks[0].status).toBe('completed')
    expect(queueItems).toHaveLength(0)
    expect(firestoreDayUpsertMock).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        id: dayInstance.id,
      }),
    )
  })

  it('blocks authenticated day mutations while offline before changing local state', async () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
    })

    await localDayInstanceRepository.upsert(dayInstance)
    setNavigatorOnline(false)

    await expect(
      updateDayBlockStatus({
        date: dayInstance.date,
        blockId: dayInstance.blocks[0].id,
        status: 'completed',
        userId: 'user-123',
        syncMode: 'cloud',
      }),
    ).rejects.toThrow('Reconnect to save changes.')

    const unchangedDay = await localDayInstanceRepository.getByDate(dayInstance.date)
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(unchangedDay?.blocks[0].status).toBe(dayInstance.blocks[0].status)
    expect(queueItems).toHaveLength(0)
    expect(firestoreDayUpsertMock).not.toHaveBeenCalled()
  })

  it('writes authenticated settings patches directly to Firestore without queueing local sync work', async () => {
    const result = await updateDailySignals({
      date: '2026-03-27',
      sleepStatus: 'met',
      energyStatus: 'high',
      userId: 'user-123',
      syncMode: 'cloud',
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(0)
    expect(settings.dailySignals['2026-03-27']).toEqual({
      sleepStatus: 'met',
      energyStatus: 'high',
      sleepDurationHours: undefined,
    })
    expect(queueItems).toHaveLength(0)
    expect(firestoreSettingsPatchMock).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        type: 'mergeDailySignals',
        settingsId: 'default',
      }),
    )
  })

  it('blocks authenticated settings patches while offline before changing local state', async () => {
    setNavigatorOnline(false)

    await expect(
      updateDailySignals({
        date: '2026-03-27',
        sleepStatus: 'met',
        energyStatus: 'high',
        userId: 'user-123',
        syncMode: 'cloud',
      }),
    ).rejects.toThrow('Reconnect to save changes.')

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(settings.dailySignals['2026-03-27']).toBeUndefined()
    expect(queueItems).toHaveLength(0)
    expect(firestoreSettingsPatchMock).not.toHaveBeenCalled()
  })
})

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: isOnline,
  })
}
