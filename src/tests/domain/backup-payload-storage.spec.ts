import { describe, expect, it } from 'vitest'
import type { BackupSnapshotRecord } from '@/domain/backup/types'
import {
  buildBackupPayloadCleanupPlan,
  buildBackupRestoreEligibility,
  buildBackupStorageObjectPath,
  buildCloudStoragePayloadPointer,
  buildLegacyFirestorePayloadPointer,
  isServerRestoreEligible,
  resolveBackupPayloadPointer,
} from '@/services/backup/backupPayloadStorage'

function createBackupRecord(input: Partial<BackupSnapshotRecord> & Pick<BackupSnapshotRecord, 'id' | 'createdAt' | 'trigger'>): BackupSnapshotRecord {
  return {
    ...input,
    schemaVersion: 1,
    status: input.status ?? 'ready',
    completedAt: input.createdAt,
    sourceRecordCount: input.sourceRecordCount ?? 1,
  }
}

describe('backup payload storage helpers', () => {
  it('builds deterministic Cloud Storage payload paths for scheduled backups', () => {
    expect(
      buildBackupStorageObjectPath({
        userId: 'user-1',
        backupId: 'scheduled-user-1-2026-03-29T03-30-00-000Z',
      }),
    ).toBe('users/user-1/backups/scheduled-user-1-2026-03-29T03-30-00-000Z.json')

    expect(
      buildCloudStoragePayloadPointer({
        userId: 'user-1',
        backupId: 'scheduled-user-1-2026-03-29T03-30-00-000Z',
        bucket: 'forge-510f3.firebasestorage.app',
      }),
    ).toEqual({
      provider: 'cloudStorage',
      location: 'users/user-1/backups/scheduled-user-1-2026-03-29T03-30-00-000Z.json',
      bucket: 'forge-510f3.firebasestorage.app',
      contentType: 'application/json',
    })
  })

  it('falls back to legacy Firestore payload pointers for older scheduled backups without explicit metadata', () => {
    const backup = createBackupRecord({
      id: 'scheduled-legacy',
      trigger: 'scheduled',
      createdAt: '2026-03-28T03:30:00.000Z',
    })

    expect(
      resolveBackupPayloadPointer({
        backup,
        userId: 'user-1',
      }),
    ).toEqual(
      buildLegacyFirestorePayloadPointer({
        userId: 'user-1',
        backupId: 'scheduled-legacy',
      }),
    )
  })

  it('builds cleanup targets for both Cloud Storage-backed and legacy Firestore-backed scheduled backups', () => {
    const cloudBackup = createBackupRecord({
      id: 'scheduled-cloud',
      trigger: 'scheduled',
      createdAt: '2026-03-29T03:30:00.000Z',
      payloadPointer: buildCloudStoragePayloadPointer({
        userId: 'user-1',
        backupId: 'scheduled-cloud',
        bucket: 'forge-510f3.firebasestorage.app',
      }),
    })
    const legacyBackup = createBackupRecord({
      id: 'scheduled-legacy',
      trigger: 'scheduled',
      createdAt: '2026-03-20T03:30:00.000Z',
    })

    expect(
      buildBackupPayloadCleanupPlan({
        backups: [cloudBackup, legacyBackup],
        userId: 'user-1',
      }),
    ).toEqual([
      {
        backupId: 'scheduled-cloud',
        pointer: {
          provider: 'cloudStorage',
          location: 'users/user-1/backups/scheduled-cloud.json',
          bucket: 'forge-510f3.firebasestorage.app',
          contentType: 'application/json',
        },
      },
      {
        backupId: 'scheduled-legacy',
        pointer: {
          provider: 'firestoreDocument',
          location: 'users/user-1/backupPayloads/scheduled-legacy',
          contentType: 'application/json',
        },
      },
    ])
  })

  it('marks only non-expired backups with payload pointers as server-restore eligible', () => {
    const eligibleBackup = createBackupRecord({
      id: 'scheduled-cloud',
      trigger: 'scheduled',
      createdAt: '2026-03-29T03:30:00.000Z',
      payloadPointer: buildCloudStoragePayloadPointer({
        userId: 'user-1',
        backupId: 'scheduled-cloud',
        bucket: 'forge-510f3.firebasestorage.app',
      }),
    })
    const expiredBackup = createBackupRecord({
      id: 'scheduled-expired',
      trigger: 'scheduled',
      createdAt: '2026-03-21T03:30:00.000Z',
      status: 'expired',
    })
    const manualBackup = createBackupRecord({
      id: 'manual-local',
      trigger: 'manual',
      createdAt: '2026-03-29T08:00:00.000Z',
    })

    expect(
      buildBackupRestoreEligibility({
        backup: expiredBackup,
        userId: 'user-1',
        checkedAt: '2026-03-29T09:00:00.000Z',
      }),
    ).toEqual({
      status: 'expired',
      reason: 'retentionExpired',
      checkedAt: '2026-03-29T09:00:00.000Z',
    })

    expect(
      isServerRestoreEligible({
        backup: eligibleBackup,
        userId: 'user-1',
      }),
    ).toBe(true)
    expect(
      isServerRestoreEligible({
        backup: manualBackup,
        userId: 'user-1',
      }),
    ).toBe(false)
  })
})
