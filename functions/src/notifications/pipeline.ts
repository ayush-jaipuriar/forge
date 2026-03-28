import { getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import type { NotificationLogRecord, NotificationStateSnapshot } from '@/domain/notifications/types'
import { createDefaultNotificationStateSnapshot } from '@/domain/notifications/types'
import { evaluateNotificationRules } from '@/domain/notifications/rules'
import { buildNotificationEvaluationWorkspace } from '@/services/notifications/notificationWorkspaceService'
import {
  buildNotificationRunRecord,
  buildScheduledNotificationLogRecord,
} from '@/services/notifications/scheduledNotificationRunService'

function getAdminApp() {
  return getApps().length > 0 ? getApp() : initializeApp()
}

export async function evaluateNotificationsForUser(userId: string, anchorDate = new Date()) {
  const firestore = getFirestore(getAdminApp())
  const settingsRef = firestore.doc(`users/${userId}/settings/default`)
  const dayInstancesRef = firestore.collection(`users/${userId}/dayInstances`)
  const notificationStateRef = firestore.doc(`users/${userId}/notificationState/default`)
  const notificationLogQuery = firestore.collection(`users/${userId}/notificationLog`).orderBy('evaluatedAt', 'desc').limit(25)

  const [settingsSnapshot, dayInstancesSnapshot, notificationStateSnapshot, notificationLogSnapshot] = await Promise.all([
    settingsRef.get(),
    dayInstancesRef.get(),
    notificationStateRef.get(),
    notificationLogQuery.get(),
  ])

  if (!settingsSnapshot.exists) {
    throw new Error(`Missing default settings for user ${userId}.`)
  }

  const settings = settingsSnapshot.data() as UserSettings
  const dayInstances = dayInstancesSnapshot.docs.map((doc) => doc.data() as DayInstance)
  const notificationState = notificationStateSnapshot.exists
    ? ({ ...createDefaultNotificationStateSnapshot(), ...notificationStateSnapshot.data() } as NotificationStateSnapshot)
    : createDefaultNotificationStateSnapshot()
  const recentLogs = notificationLogSnapshot.docs.map((doc) => doc.data() as NotificationLogRecord)

  const workspace = buildNotificationEvaluationWorkspace({
    settings,
    dayInstances,
    anchorDate,
  })
  const evaluation = evaluateNotificationRules({
    today: workspace.today,
    summary: workspace.summary,
    notificationState,
    notificationsEnabled: settings.notificationsEnabled,
    recentLogs,
    now: anchorDate,
  })

  const candidateLog = buildScheduledNotificationLogRecord({
    evaluation,
    evaluatedAt: anchorDate.toISOString(),
  })
  const existingScheduledLog = candidateLog ? recentLogs.find((log) => log.id === candidateLog.id) ?? null : null
  const runRecord = buildNotificationRunRecord({
    evaluation,
    existingLog: existingScheduledLog,
    evaluatedAt: anchorDate.toISOString(),
  })
  const batch = firestore.batch()

  batch.set(
    notificationStateRef,
    {
      ...notificationState,
      lastEvaluatedAt: anchorDate.toISOString(),
      lastWeeklySummaryWeekKey:
        evaluation.candidate?.ruleKey === 'weekly-summary'
          ? evaluation.candidate.sourceWeekKey
          : notificationState.lastWeeklySummaryWeekKey,
      updatedAt: anchorDate.toISOString(),
    },
    { merge: true },
  )
  batch.set(firestore.doc(`users/${userId}/notificationRuns/${runRecord.id}`), runRecord, { merge: true })

  if (candidateLog && !existingScheduledLog) {
    batch.set(firestore.doc(`users/${userId}/notificationLog/${candidateLog.id}`), candidateLog, { merge: true })
  }

  await batch.commit()

  return {
    userId,
    status: runRecord.status,
    candidateId: evaluation.candidate?.id ?? null,
    suppressionReason: evaluation.suppressionReason ?? null,
  }
}

export async function evaluateNotificationsForAllUsers(anchorDate = new Date()) {
  const firestore = getFirestore(getAdminApp())
  const usersSnapshot = await firestore.collection('users').get()
  const results = []

  for (const userDoc of usersSnapshot.docs) {
    results.push(await evaluateNotificationsForUser(userDoc.id, anchorDate))
  }

  return results
}
