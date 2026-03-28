import { getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import type { NotificationStateSnapshot } from '@/domain/notifications/types'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import {
  createDefaultBackupOperationsSnapshot,
  createDefaultBackupRetentionPolicy,
  type BackupOperationsSnapshot,
  type BackupSnapshotRecord,
} from '@/domain/backup/types'
import { createDefaultNotificationStateSnapshot } from '@/domain/notifications/types'
import {
  buildBackupOperationsSnapshot,
  buildBackupPayload,
  buildBackupSnapshotRecord,
  selectBackupIdsToExpire,
} from '@/services/backup/backupSerialization'
import {
  buildBackupPayloadCleanupPlan,
  buildBackupRestoreEligibility,
  buildCloudStoragePayloadPointer,
  resolveBackupPayloadPointer,
} from '@/services/backup/backupPayloadStorage'

function getAdminApp() {
  return getApps().length > 0 ? getApp() : initializeApp()
}

function resolveBackupStorageBucketName() {
  const app = getAdminApp()
  const configuredBucket = app.options.storageBucket

  if (configuredBucket) {
    return configuredBucket
  }

  const firebaseConfig = process.env.FIREBASE_CONFIG

  if (firebaseConfig) {
    try {
      const parsed = JSON.parse(firebaseConfig) as { storageBucket?: string }

      if (parsed.storageBucket) {
        return parsed.storageBucket
      }
    } catch {
      // Ignore malformed local config and fall through to the explicit error.
    }
  }

  throw new Error('Firebase Storage bucket is unavailable for scheduled backup payload persistence.')
}

export async function generateBackupForUser(userId: string, anchorDate = new Date()) {
  const firestore = getFirestore(getAdminApp())
  const storage = getStorage(getAdminApp())
  const bucketName = resolveBackupStorageBucketName()
  const bucket = storage.bucket(bucketName)
  const exportedAt = anchorDate.toISOString()
  const userRef = firestore.doc(`users/${userId}`)
  const settingsRef = firestore.doc(`users/${userId}/settings/default`)
  const dayInstancesRef = firestore.collection(`users/${userId}/dayInstances`)
  const notificationStateRef = firestore.doc(`users/${userId}/notificationState/default`)
  const backupOperationsRef = firestore.doc(`users/${userId}/backupOperations/default`)
  const backupsRef = firestore.collection(`users/${userId}/backups`)

  const [userSnapshot, settingsSnapshot, dayInstancesSnapshot, notificationStateSnapshot, backupOperationsSnapshot, backupsSnapshot] =
    await Promise.all([
      userRef.get(),
      settingsRef.get(),
      dayInstancesRef.get(),
      notificationStateRef.get(),
      backupOperationsRef.get(),
      backupsRef.get(),
    ])

  if (!settingsSnapshot.exists) {
    throw new Error(`Missing default settings for user ${userId}.`)
  }

  const settings = settingsSnapshot.data() as UserSettings
  const dayInstances = dayInstancesSnapshot.docs.map((entry) => entry.data() as DayInstance)
  const notificationState = notificationStateSnapshot.exists
    ? ({ ...createDefaultNotificationStateSnapshot(), ...notificationStateSnapshot.data() } as NotificationStateSnapshot)
    : createDefaultNotificationStateSnapshot()
  const backupOperations = backupOperationsSnapshot.exists
    ? ({ ...createDefaultBackupOperationsSnapshot(), ...backupOperationsSnapshot.data() } as BackupOperationsSnapshot)
    : createDefaultBackupOperationsSnapshot()
  const existingBackups = backupsSnapshot.docs.map((entry) => entry.data() as BackupSnapshotRecord)
  const payload = buildBackupPayload({
    user: userSnapshot.exists
      ? {
          uid: userId,
          email: (userSnapshot.data()?.email as string | null | undefined) ?? null,
          displayName: (userSnapshot.data()?.displayName as string | null | undefined) ?? null,
          photoURL: (userSnapshot.data()?.photoURL as string | null | undefined) ?? null,
        }
      : null,
    fallbackUserId: userId,
    settings,
    dayInstances,
    notificationState,
    syncDiagnostics: null,
    exportedAt,
    trigger: 'scheduled',
  })
  const jsonText = JSON.stringify(payload)
  const retentionPolicy = backupOperations.retentionPolicy ?? createDefaultBackupRetentionPolicy()
  const payloadPointer = buildCloudStoragePayloadPointer({
    userId,
    backupId: payload.id,
    bucket: bucketName,
  })
  const newBackupRecord = buildBackupSnapshotRecord({
    payload,
    exportedAt,
    trigger: 'scheduled',
    jsonText,
    payloadPointer,
    restoreEligibility: buildBackupRestoreEligibility({
      backup: {
        id: payload.id,
        schemaVersion: payload.schemaVersion,
        trigger: 'scheduled',
        status: 'ready',
        createdAt: exportedAt,
        completedAt: exportedAt,
        sourceRecordCount: 0,
        payloadPointer,
      },
      userId,
      checkedAt: exportedAt,
    }),
  })
  const resolvedPayloadPointer = resolveBackupPayloadPointer({
    backup: newBackupRecord,
    userId,
  })
  const backupsAfterCreate = [newBackupRecord, ...existingBackups]
  const backupIdsToExpire = selectBackupIdsToExpire({
    backups: backupsAfterCreate,
    policy: retentionPolicy,
  })
  const backupsToExpire = backupsAfterCreate.filter((backup) => backupIdsToExpire.includes(backup.id))
  const cleanupPlan = buildBackupPayloadCleanupPlan({
    backups: backupsToExpire,
    userId,
  })
  const batch = firestore.batch()

  if (!resolvedPayloadPointer || resolvedPayloadPointer.provider !== 'cloudStorage') {
    throw new Error(`Scheduled backup ${newBackupRecord.id} does not have a Cloud Storage payload pointer.`)
  }

  await bucket.file(resolvedPayloadPointer.location).save(jsonText, {
    contentType: 'application/json; charset=utf-8',
    resumable: false,
    metadata: {
      contentType: 'application/json',
      metadata: {
        userId,
        backupId: newBackupRecord.id,
        exportedAt,
      },
    },
  })

  batch.set(firestore.doc(`users/${userId}/backups/${newBackupRecord.id}`), newBackupRecord, { merge: true })

  for (const backupId of backupIdsToExpire) {
    batch.set(
      firestore.doc(`users/${userId}/backups/${backupId}`),
      {
        status: 'expired',
        retentionExpiresAt: exportedAt,
        restoreEligibility: {
          status: 'expired',
          reason: 'retentionExpired',
          checkedAt: exportedAt,
        },
      },
      { merge: true },
    )
  }

  batch.set(
    backupOperationsRef,
    buildBackupOperationsSnapshot({
      recentBackups: backupsAfterCreate.map((backup) =>
        backupIdsToExpire.includes(backup.id)
          ? {
              ...backup,
              status: 'expired',
              retentionExpiresAt: exportedAt,
            }
          : backup,
      ),
      retentionPolicy,
      updatedAt: exportedAt,
    }),
    { merge: true },
  )

  await batch.commit()

  const cleanupErrors: string[] = []

  for (const entry of cleanupPlan) {
    try {
      if (entry.pointer.provider === 'cloudStorage') {
        await bucket.file(entry.pointer.location).delete({
          ignoreNotFound: true,
        })
      } else {
        await firestore.doc(entry.pointer.location).delete()
      }
    } catch (error) {
      cleanupErrors.push(`${entry.backupId}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (cleanupErrors.length > 0) {
    await backupOperationsRef.set(
      {
        ...buildBackupOperationsSnapshot({
          recentBackups: backupsAfterCreate.map((backup) =>
            backupIdsToExpire.includes(backup.id)
              ? {
                  ...backup,
                  status: 'expired',
                  retentionExpiresAt: exportedAt,
                  restoreEligibility: {
                    status: 'expired',
                    reason: 'retentionExpired',
                    checkedAt: exportedAt,
                  },
                }
              : backup,
          ),
          retentionPolicy,
          latestFailureAt: exportedAt,
          latestFailureMessage: `Scheduled backup retention cleanup failed for ${cleanupErrors.length} payload(s): ${cleanupErrors.join('; ')}`,
          updatedAt: exportedAt,
        }),
      },
      { merge: true },
    )
  }

  return {
    userId,
    backupId: newBackupRecord.id,
    expiredBackupCount: backupIdsToExpire.length,
    sourceRecordCount: newBackupRecord.sourceRecordCount,
  }
}

export async function generateBackupsForAllUsers(anchorDate = new Date()) {
  const firestore = getFirestore(getAdminApp())
  const usersSnapshot = await firestore.collection('users').get()
  const results = []

  for (const userDoc of usersSnapshot.docs) {
    try {
      results.push(await generateBackupForUser(userDoc.id, anchorDate))
    } catch (error) {
      const exportedAt = anchorDate.toISOString()
      const backupOperationsRef = firestore.doc(`users/${userDoc.id}/backupOperations/default`)
      const backupOperationsSnapshot = await backupOperationsRef.get()
      const existingOperations = backupOperationsSnapshot.exists
        ? ({ ...createDefaultBackupOperationsSnapshot(), ...backupOperationsSnapshot.data() } as BackupOperationsSnapshot)
        : createDefaultBackupOperationsSnapshot()

      await backupOperationsRef.set(
        {
          ...buildBackupOperationsSnapshot({
            recentBackups: [],
            retentionPolicy: existingOperations.retentionPolicy,
            latestFailureAt: exportedAt,
            latestFailureMessage: error instanceof Error ? error.message : String(error),
            updatedAt: exportedAt,
          }),
          latestBackupId: existingOperations.latestBackupId,
          latestSuccessfulBackupAt: existingOperations.latestSuccessfulBackupAt,
        },
        { merge: true },
      )

      results.push({
        userId: userDoc.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}
