import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDefaultBackupOperationsSnapshot,
  type BackupOperationsSnapshot,
} from '@/domain/backup/types'
import * as monitoringService from '@/services/monitoring/monitoringService'
import { reportBackupHealthMonitoring } from '@/services/backup/backupOperationsService'

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('does not emit duplicate stale events for the same observed backup state', () => {
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
      userId: 'user-duplicate',
    })
    reportBackupHealthMonitoring({
      operations,
      source: 'remote',
      userId: 'user-duplicate',
    })

    expect(spy).toHaveBeenCalledTimes(1)
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

  it('allows a new stale event after backup health recovers and degrades again', () => {
    const spy = vi.spyOn(monitoringService, 'reportMonitoringEvent')
    const staleOperations: BackupOperationsSnapshot = {
      ...createDefaultBackupOperationsSnapshot(),
      healthState: 'stale',
      latestBackupId: 'backup-2',
      latestSuccessfulBackupAt: '2026-03-28T00:00:00.000Z',
    }
    const healthyOperations: BackupOperationsSnapshot = {
      ...createDefaultBackupOperationsSnapshot(),
      healthState: 'healthy',
      latestBackupId: 'backup-3',
      latestSuccessfulBackupAt: '2026-03-29T00:00:00.000Z',
    }

    reportBackupHealthMonitoring({
      operations: staleOperations,
      source: 'remote',
      userId: 'user-recover',
    })
    reportBackupHealthMonitoring({
      operations: healthyOperations,
      source: 'remote',
      userId: 'user-recover',
    })
    reportBackupHealthMonitoring({
      operations: staleOperations,
      source: 'remote',
      userId: 'user-recover',
    })

    expect(
      spy.mock.calls.filter(
        ([event]) =>
          event.domain === 'backup' &&
          event.action === 'scheduled-backup-stale' &&
          event.metadata?.userId === 'user-recover',
      ),
    ).toHaveLength(2)
  })
})
