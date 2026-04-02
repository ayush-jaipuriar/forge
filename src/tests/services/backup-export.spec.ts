import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  localDayInstanceRepository,
  localExportPayloadRepository,
  localNotificationStateRepository,
  localSettingsRepository,
  localSyncDiagnosticsRepository,
} from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine } from '@/data/seeds'
import { createDefaultNotificationStateSnapshot } from '@/domain/notifications/types'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { createDefaultSyncDiagnosticsSnapshot } from '@/domain/sync/types'
import { createManualBackup } from '@/services/backup/backupService'
import * as monitoringService from '@/services/monitoring/monitoringService'

describe('backup service', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a versioned export payload and markdown note export from local state', async () => {
    const monitoringSpy = vi.spyOn(monitoringService, 'reportMonitoringEvent')
    const settings = createDefaultUserSettings()
    settings.dailySignals['2026-03-28'] = {
      sleepStatus: 'met',
      energyStatus: 'normal',
      sleepDurationHours: 7.8,
    }

    const dayInstance = generateDayInstance({
      date: '2026-03-28',
      routine: forgeRoutine,
    })
    dayInstance.blocks[0].executionNote = 'Recovered the first 45 minutes after commute delay.'

    const notificationState = createDefaultNotificationStateSnapshot()
    notificationState.permission = 'granted'

    await localSettingsRepository.upsert(settings)
    await localDayInstanceRepository.upsert(dayInstance)
    await localNotificationStateRepository.upsert(notificationState)
    await localSyncDiagnosticsRepository.upsert(createDefaultSyncDiagnosticsSnapshot())

    const result = await createManualBackup({
      uid: 'user-1',
      email: 'forge@example.com',
      displayName: 'Forge User',
      photoURL: null,
    })

    expect(result.payload.userId).toBe('user-1')
    expect(result.payload.user?.displayName).toBe('Forge User')
    expect(result.payload.dayInstances).toHaveLength(1)
    expect(result.payload.integrations.notificationState?.permission).toBe('granted')
    expect(result.payload.analytics.snapshots.length).toBeGreaterThan(0)
    expect(result.backupRecord.status).toBe('ready')
    expect(result.backupRecord.byteSize).toBeGreaterThan(0)
    expect(result.notesMarkdown).toContain('Recovered the first 45 minutes after commute delay.')
    expect(result.suggestedJsonFilename).toContain('forge-backup-user-1')
    expect(monitoringSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        domain: 'backup',
        action: 'manual-backup-created',
      }),
    )
  })

  it('reports monitoring when manual backup creation fails', async () => {
    const monitoringSpy = vi.spyOn(monitoringService, 'reportMonitoringError')
    vi.spyOn(localExportPayloadRepository, 'save').mockRejectedValueOnce(new Error('disk full'))

    await expect(
      createManualBackup({
        uid: 'user-1',
        email: 'forge@example.com',
        displayName: 'Forge User',
        photoURL: null,
      }),
    ).rejects.toThrow('disk full')

    expect(monitoringSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'backup',
        action: 'manual-backup-failed',
      }),
    )
  })
})
