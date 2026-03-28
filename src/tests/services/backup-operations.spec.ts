import { describe, expect, it, vi } from 'vitest'
import {
  createDefaultBackupOperationsSnapshot,
  type BackupOperationsSnapshot,
} from '@/domain/backup/types'
import * as monitoringService from '@/services/monitoring/monitoringService'
import { reportBackupHealthMonitoring } from '@/services/backup/backupOperationsService'

describe('backup operations monitoring', () => {
  it('emits a warning event when scheduled backup protection is stale', () => {
    const spy = vi.spyOn(monitoringService, 'reportMonitoringEvent')
    const operations: BackupOperationsSnapshot = {
      ...createDefaultBackupOperationsSnapshot(),
      healthState: 'stale',
      latestBackupId: 'backup-1',
      latestSuccessfulBackupAt: '2026-03-28T00:00:00.000Z',
    }

    reportBackupHealthMonitoring({
      operations,
      source: 'remote',
      userId: 'user-1',
    })

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warning',
        domain: 'backup',
        action: 'scheduled-backup-stale',
      }),
    )
  })

  it('emits an error event when scheduled backup protection is degraded', () => {
    const spy = vi.spyOn(monitoringService, 'reportMonitoringEvent')
    const operations: BackupOperationsSnapshot = {
      ...createDefaultBackupOperationsSnapshot(),
      healthState: 'degraded',
      latestFailureAt: '2026-03-29T00:00:00.000Z',
      latestFailureMessage: 'Retention cleanup failed.',
    }

    reportBackupHealthMonitoring({
      operations,
      source: 'local',
      userId: 'user-1',
    })

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        domain: 'backup',
        action: 'scheduled-backup-degraded',
      }),
    )
  })
})
