import { onCall } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { generateAnalyticsSnapshotsForAllUsers, generateAnalyticsSnapshotsForUser } from './analytics/pipeline.js'

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
    return generateAnalyticsSnapshotsForAllUsers()
  },
)
