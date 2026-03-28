import { onCall } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { generateAnalyticsSnapshotsForAllUsers, generateAnalyticsSnapshotsForUser } from './analytics/pipeline.js'
import { generateBackupsForAllUsers, generateBackupForUser } from './backups/pipeline.js'
import { evaluateNotificationsForAllUsers, evaluateNotificationsForUser } from './notifications/pipeline.js'

export const generateUserAnalyticsSnapshots = onCall(
  {
    region: 'asia-south1',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new Error('Authentication is required to generate analytics snapshots.')
    }

    return generateAnalyticsSnapshotsForUser(request.auth.uid)
  },
)

export const generateScheduledAnalyticsSnapshots = onSchedule(
  {
    region: 'asia-south1',
    schedule: '15 2 * * *',
    timeZone: 'Asia/Kolkata',
  },
  async () => {
    await generateAnalyticsSnapshotsForAllUsers()
  },
)

export const evaluateUserNotifications = onCall(
  {
    region: 'asia-south1',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new Error('Authentication is required to evaluate notifications.')
    }

    return evaluateNotificationsForUser(request.auth.uid)
  },
)

export const evaluateScheduledNotifications = onSchedule(
  {
    region: 'asia-south1',
    schedule: '*/30 * * * *',
    timeZone: 'Asia/Kolkata',
  },
  async () => {
    await evaluateNotificationsForAllUsers()
  },
)

export const generateUserBackup = onCall(
  {
    region: 'asia-south1',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new Error('Authentication is required to generate backups.')
    }

    return generateBackupForUser(request.auth.uid)
  },
)

export const generateScheduledBackups = onSchedule(
  {
    region: 'asia-south1',
    schedule: '30 3 * * *',
    timeZone: 'Asia/Kolkata',
  },
  async () => {
    await generateBackupsForAllUsers()
  },
)
