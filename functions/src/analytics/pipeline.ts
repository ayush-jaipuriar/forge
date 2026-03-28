import { getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'

function getAdminApp() {
  return getApps().length > 0 ? getApp() : initializeApp()
}

export async function generateAnalyticsSnapshotsForUser(userId: string, anchorDate = new Date()) {
  const firestore = getFirestore(getAdminApp())
  const settingsRef = firestore.doc(`users/${userId}/settings/default`)
  const dayInstancesRef = firestore.collection(`users/${userId}/dayInstances`)
  const [settingsSnapshot, dayInstancesSnapshot] = await Promise.all([settingsRef.get(), dayInstancesRef.get()])

  if (!settingsSnapshot.exists) {
    throw new Error(`Missing default settings for user ${userId}.`)
  }

  const settings = settingsSnapshot.data() as UserSettings
  const dayInstances = dayInstancesSnapshot.docs.map((doc) => doc.data() as DayInstance)
  const bundle = generateAnalyticsSnapshotBundle({
    dayInstances,
    settings,
    anchorDate,
  })
  const batch = firestore.batch()

  for (const snapshot of bundle.dailySnapshots) {
    batch.set(firestore.doc(`users/${userId}/analyticsSnapshots/${snapshot.id}`), snapshot, { merge: true })
  }

  for (const snapshot of bundle.weeklySnapshots) {
    batch.set(firestore.doc(`users/${userId}/analyticsSnapshots/${snapshot.id}`), snapshot, { merge: true })
  }

  for (const snapshot of bundle.rollingSnapshots) {
    batch.set(firestore.doc(`users/${userId}/analyticsSnapshots/${snapshot.id}`), snapshot, { merge: true })
  }

  batch.set(firestore.doc(`users/${userId}/projections/default`), bundle.projection, { merge: true })
  batch.set(firestore.doc(`users/${userId}/analyticsMetadata/default`), bundle.metadata, { merge: true })

  await batch.commit()

  return {
    dailySnapshots: bundle.dailySnapshots.length,
    weeklySnapshots: bundle.weeklySnapshots.length,
    rollingSnapshots: bundle.rollingSnapshots.length,
    lastEvaluatedDate: bundle.projection.lastEvaluatedDate,
  }
}

export async function generateAnalyticsSnapshotsForAllUsers(anchorDate = new Date()) {
  const firestore = getFirestore(getAdminApp())
  const usersSnapshot = await firestore.collection('users').get()
  const results = []

  for (const userDoc of usersSnapshot.docs) {
    const result = await generateAnalyticsSnapshotsForUser(userDoc.id, anchorDate)
    results.push({
      userId: userDoc.id,
      ...result,
    })
  }

  return results
}
