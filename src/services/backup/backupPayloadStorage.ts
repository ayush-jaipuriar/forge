import type {
  BackupPayloadPointer,
  BackupSnapshotRecord,
  BackupRestoreEligibility,
} from '@/domain/backup/types'

export function buildBackupStorageObjectPath({
  userId,
  backupId,
}: {
  userId: string
  backupId: string
}) {
  return `users/${userId}/backups/${backupId}.json`
}

export function buildCloudStoragePayloadPointer({
  userId,
  backupId,
  bucket,
}: {
  userId: string
  backupId: string
  bucket: string
}): BackupPayloadPointer {
  return {
    provider: 'cloudStorage',
    location: buildBackupStorageObjectPath({
      userId,
      backupId,
    }),
    bucket,
    contentType: 'application/json',
  }
}

export function buildLegacyFirestorePayloadPointer({
  userId,
  backupId,
}: {
  userId: string
  backupId: string
}): BackupPayloadPointer {
  return {
    provider: 'firestoreDocument',
    location: `users/${userId}/backupPayloads/${backupId}`,
    contentType: 'application/json',
  }
}

export function resolveBackupPayloadPointer({
  backup,
  userId,
}: {
  backup: BackupSnapshotRecord
  userId: string
}): BackupPayloadPointer | null {
  if (backup.payloadPointer) {
    return backup.payloadPointer
  }

  if (backup.trigger === 'scheduled') {
    return buildLegacyFirestorePayloadPointer({
      userId,
      backupId: backup.id,
    })
  }

  return null
}

export function buildBackupRestoreEligibility({
  backup,
  userId,
  checkedAt,
}: {
  backup: BackupSnapshotRecord
  userId: string
  checkedAt: string
}): BackupRestoreEligibility {
  if (backup.status === 'expired') {
    return {
      status: 'expired',
      reason: 'retentionExpired',
      checkedAt,
    }
  }

  const pointer = resolveBackupPayloadPointer({
    backup,
    userId,
  })

  if (!pointer) {
    return {
      status: 'unavailable',
      reason: 'payloadLocationMissing',
      checkedAt,
    }
  }

  return {
    status: 'eligible',
    checkedAt,
  }
}

export function isServerRestoreEligible({
  backup,
  userId,
}: {
  backup: BackupSnapshotRecord
  userId: string
}) {
  return buildBackupRestoreEligibility({
    backup,
    userId,
    checkedAt: backup.completedAt ?? backup.createdAt,
  }).status === 'eligible'
}

export function buildBackupPayloadCleanupPlan({
  backups,
  userId,
}: {
  backups: BackupSnapshotRecord[]
  userId: string
}) {
  return backups
    .map((backup) => ({
      backupId: backup.id,
      pointer: resolveBackupPayloadPointer({
        backup,
        userId,
      }),
    }))
    .filter((entry): entry is { backupId: string; pointer: BackupPayloadPointer } => entry.pointer !== null)
}
