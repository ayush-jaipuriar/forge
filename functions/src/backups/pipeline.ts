import { getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
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

function getAdminApp() {
  return getApps().length > 0 ? getApp() : initializeApp()
}

export async function generateBackupForUser(userId: string, anchorDate = new Date()) {
  const firestore = getFirestore(getAdminApp())
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
  const newBackupRecord = buildBackupSnapshotRecord({
    payload,
    exportedAt,
    trigger: 'scheduled',
    jsonText,
  })
  const backupsAfterCreate = [newBackupRecord, ...existingBackups]
  const backupIdsToExpire = selectBackupIdsToExpire({
    backups: backupsAfterCreate,
    policy: retentionPolicy,
  })
  const batch = firestore.batch()

  batch.set(firestore.doc(`users/${userId}/backups/${newBackupRecord.id}`), newBackupRecord, { merge: true })
  batch.set(firestore.doc(`users/${userId}/backupPayloads/${newBackupRecord.id}`), payload, { merge: true })

  for (const backupId of backupIdsToExpire) {
    batch.set(
      firestore.doc(`users/${userId}/backups/${backupId}`),
      {
        status: 'expired',
        retentionExpiresAt: exportedAt,
      },
      { merge: true },
    )
    batch.delete(firestore.doc(`users/${userId}/backupPayloads/${backupId}`))
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
