import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { getBytes, ref } from 'firebase/storage'
import type { BackupSnapshotRecord, ForgeExportPayload } from '@/domain/backup/types'
import { getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase/client'
import {
  buildBackupRestoreEligibility,
  isServerRestoreEligible,
  resolveBackupPayloadPointer,
} from '@/services/backup/backupPayloadStorage'
import { reportMonitoringError } from '@/services/monitoring/monitoringService'
import { parseRestorePayloadText, validateRestorePayload, type RestoreStage } from '@/services/backup/restoreService'

export async function listServerBackupRestoreCandidates({
  userId,
  max = 10,
}: {
  userId: string
  max?: number
}) {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firestore is unavailable because Firebase configuration is incomplete.')
  }

  const backupsQuery = query(collection(db, 'users', userId, 'backups'), orderBy('createdAt', 'desc'), limit(max))
  const snapshot = await getDocs(backupsQuery)
  const checkedAt = new Date().toISOString()

  return snapshot.docs
    .map((entry) => entry.data() as BackupSnapshotRecord)
    .map((backup) => ({
      ...backup,
      restoreEligibility:
        backup.restoreEligibility ??
        buildBackupRestoreEligibility({
          backup,
          userId,
          checkedAt,
        }),
    }))
    .filter((backup) =>
      isServerRestoreEligible({
        backup,
        userId,
      }),
    )
}

export async function fetchServerBackupPayload({
  userId,
  backup,
}: {
  userId: string
  backup: BackupSnapshotRecord
}): Promise<ForgeExportPayload> {
  const pointer = resolveBackupPayloadPointer({
    backup,
    userId,
  })

  if (!pointer) {
    throw new Error('Selected backup does not have a payload location.')
  }

  if (pointer.provider === 'cloudStorage') {
    const storage = getFirebaseStorage()

    if (!storage) {
      throw new Error('Firebase Storage is unavailable because Firebase configuration is incomplete.')
    }

    try {
      const bytes = await getBytes(ref(storage, pointer.location))
      const text = new TextDecoder().decode(bytes)
      const stage = await parseRestorePayloadText(text)
      return stage.payload
    } catch (error) {
      reportMonitoringError({
        domain: 'backup',
        action: 'load-server-backup-payload',
        message: 'Forge could not load a scheduled backup payload from Cloud Storage.',
        error,
        metadata: {
          userId,
          backupId: backup.id,
          pointerProvider: pointer.provider,
          pointerLocation: pointer.location,
        },
      })
      throw error
    }
  }

  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firestore is unavailable because Firebase configuration is incomplete.')
  }

  let snapshot

  try {
    snapshot = await getDoc(doc(db, pointer.location))
  } catch (error) {
    reportMonitoringError({
      domain: 'backup',
      action: 'load-legacy-backup-payload',
      message: 'Forge could not load a legacy Firestore-backed scheduled backup payload.',
      error,
      metadata: {
        userId,
        backupId: backup.id,
        pointerProvider: pointer.provider,
        pointerLocation: pointer.location,
      },
    })
    throw error
  }

  if (!snapshot.exists()) {
    const error = new Error('Selected backup payload document could not be found.')
    reportMonitoringError({
      domain: 'backup',
      action: 'load-legacy-backup-payload',
      message: 'Forge found backup metadata, but the legacy Firestore payload document is missing.',
      error,
      metadata: {
        userId,
        backupId: backup.id,
        pointerProvider: pointer.provider,
        pointerLocation: pointer.location,
      },
    })
    throw error
  }

  return validateRestorePayload(snapshot.data())
}

export async function buildServerBackupRestoreStage({
  userId,
  backup,
}: {
  userId: string
  backup: BackupSnapshotRecord
}): Promise<RestoreStage> {
  const payload = await fetchServerBackupPayload({
    userId,
    backup,
  })

  const serialized = JSON.stringify(payload)
  const stage = await parseRestorePayloadText(serialized)

  return {
    ...stage,
    source: {
      kind: 'serverBackup',
      label: `Loaded from scheduled backup ${backup.id}`,
      backupId: backup.id,
      createdAt: backup.createdAt,
    },
  }
}
