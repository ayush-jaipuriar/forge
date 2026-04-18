import { beforeEach, describe, expect, it } from 'vitest'
import { localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { updateWorkoutLog } from '@/services/settings/workoutLogService'

describe('updateWorkoutLog', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists the workout state locally and queues a settings sync item', async () => {
    const result = await updateWorkoutLog({
      date: '2026-03-27',
      patch: {
        date: '2026-03-27',
        workoutType: 'upperB',
        label: 'Upper B',
        status: 'done',
        note: 'Completed despite a compressed evening.',
      },
    })

    const settings = await localSettingsRepository.getDefault()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(1)
    expect(settings?.workoutLogs['2026-03-27']).toMatchObject({
      status: 'done',
      note: 'Completed despite a compressed evening.',
    })
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0]).toMatchObject({
      actionType: 'patchSettings',
      entityId: 'default:workoutLogs:2026-03-27',
    })
  })

  it('keeps guest workout writes local-only when sync is disabled', async () => {
    const result = await updateWorkoutLog({
      date: '2026-03-27',
      patch: {
        date: '2026-03-27',
        workoutType: 'upperB',
        label: 'Upper B',
        status: 'done',
      },
      syncMode: 'localOnly',
    })

    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(result.pendingCount).toBe(0)
    expect(queueItems).toHaveLength(0)
  })
})
