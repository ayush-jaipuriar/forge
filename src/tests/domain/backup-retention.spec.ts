import { describe, expect, it } from 'vitest'
import { createDefaultBackupRetentionPolicy, type BackupSnapshotRecord } from '@/domain/backup/types'
import { buildBackupOperationsSnapshot, selectBackupIdsToExpire } from '@/services/backup/backupSerialization'

function createBackupRecord(input: Partial<BackupSnapshotRecord> & Pick<BackupSnapshotRecord, 'id' | 'createdAt' | 'trigger'>): BackupSnapshotRecord {
  return {
    ...input,
    schemaVersion: 1,
    status: input.status ?? 'ready',
    completedAt: input.createdAt,
    sourceRecordCount: input.sourceRecordCount ?? 1,
  }
}

describe('backup retention and operations helpers', () => {
  it('expires scheduled backups beyond the daily and weekly retention windows while preserving manual backups separately', () => {
    const policy = {
      keepDaily: 2,
      keepWeekly: 1,
      keepManual: 1,
    }
    const backups = [
      createBackupRecord({ id: 'scheduled-1', trigger: 'scheduled', createdAt: '2026-03-29T03:30:00.000Z' }),
      createBackupRecord({ id: 'scheduled-2', trigger: 'scheduled', createdAt: '2026-03-28T03:30:00.000Z' }),
      createBackupRecord({ id: 'scheduled-3', trigger: 'scheduled', createdAt: '2026-03-21T03:30:00.000Z' }),
      createBackupRecord({ id: 'scheduled-4', trigger: 'scheduled', createdAt: '2026-03-14T03:30:00.000Z' }),
      createBackupRecord({ id: 'manual-1', trigger: 'manual', createdAt: '2026-03-29T08:00:00.000Z' }),
      createBackupRecord({ id: 'manual-2', trigger: 'manual', createdAt: '2026-03-20T08:00:00.000Z' }),
    ]

    const expiredIds = selectBackupIdsToExpire({
      backups,
      policy,
    })

    expect(expiredIds).toContain('scheduled-4')
    expect(expiredIds).toContain('manual-2')
    expect(expiredIds).not.toContain('scheduled-1')
    expect(expiredIds).not.toContain('scheduled-2')
    expect(expiredIds).not.toContain('scheduled-3')
    expect(expiredIds).not.toContain('manual-1')
  })

  it('marks backup operations stale or degraded based on scheduled backup freshness and failures', () => {
    const scheduledBackup = createBackupRecord({
      id: 'scheduled-1',
      trigger: 'scheduled',
      createdAt: '2026-03-27T03:30:00.000Z',
    })
    const staleSnapshot = buildBackupOperationsSnapshot({
      recentBackups: [scheduledBackup],
      retentionPolicy: createDefaultBackupRetentionPolicy(),
      updatedAt: '2026-03-29T20:00:00.000Z',
    })
    const degradedSnapshot = buildBackupOperationsSnapshot({
      recentBackups: [scheduledBackup],
      retentionPolicy: createDefaultBackupRetentionPolicy(),
      latestFailureAt: '2026-03-29T04:00:00.000Z',
      latestFailureMessage: 'scheduled backup failed',
      updatedAt: '2026-03-29T04:00:00.000Z',
    })

    expect(staleSnapshot.healthState).toBe('stale')
    expect(degradedSnapshot.healthState).toBe('degraded')
    expect(degradedSnapshot.latestFailureMessage).toBe('scheduled backup failed')
  })
})
