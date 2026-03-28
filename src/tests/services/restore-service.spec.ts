import { beforeEach, describe, expect, it } from 'vitest'
import {
  localDayInstanceRepository,
  localNotificationStateRepository,
  localRestoreJobRepository,
  localSettingsRepository,
  localSyncQueueRepository,
} from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { createDefaultNotificationStateSnapshot } from '@/domain/notifications/types'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { createManualBackup } from '@/services/backup/backupService'
import { applyRestoreStage, parseRestorePayloadText } from '@/services/backup/restoreService'
import { createSyncQueueItem } from '@/services/sync/syncQueue'

describe('restore service', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('stages and applies a restore payload while reporting partial compatibility honestly', async () => {
    const settings = createDefaultUserSettings()
    settings.notificationsEnabled = false

    const notificationState = createDefaultNotificationStateSnapshot()
    notificationState.permission = 'granted'

    const dayInstance = generateDayInstance({
      date: '2026-03-28',
      routine: forgeRoutine,
    })
    dayInstance.blocks[0].status = 'completed'

    await localSettingsRepository.upsert(settings)
    await localDayInstanceRepository.upsert(dayInstance)
    await localNotificationStateRepository.upsert(notificationState)

    const backup = await createManualBackup({
      uid: 'user-1',
      email: 'forge@example.com',
      displayName: 'Forge User',
      photoURL: null,
    })

    await resetForgeDb()

    const stage = await parseRestorePayloadText(backup.jsonText)
    await localSyncQueueRepository.enqueue(createSyncQueueItem('upsertSettings', settings.id, settings))
    const job = await applyRestoreStage(stage)
    const restoredSettings = await localSettingsRepository.getDefault()
    const restoredDay = await localDayInstanceRepository.getByDate('2026-03-28')
    const restoredNotificationState = await localNotificationStateRepository.getDefault()
    const restoreJobs = await localRestoreJobRepository.listRecent()
    const queueItems = await localSyncQueueRepository.listOutstanding()

    expect(stage.summary).toContain('day instance')
    expect(job.status).toBe('partial')
    expect(job.warnings.some((warning) => warning.includes('derived state'))).toBe(true)
    expect(job.warnings.some((warning) => warning.includes('Cleared 1 queued local sync item'))).toBe(true)
    expect(restoredSettings?.notificationsEnabled).toBe(false)
    expect(restoredDay?.blocks[0].status).toBe('completed')
    expect(restoredNotificationState?.permission).toBe('granted')
    expect(restoreJobs[0]?.id).toBe(job.id)
    expect(queueItems).toHaveLength(0)
  })

  it('rejects invalid restore payloads before applying them', async () => {
    await expect(parseRestorePayloadText('{"schemaVersion":999}')).rejects.toThrow('Unsupported backup schema version')
  })
})
