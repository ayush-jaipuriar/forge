import {
  createDefaultAnalyticsMetadataSnapshot,
  createDefaultStreakSnapshot,
} from '@/domain/analytics/types'
import {
  createDefaultBackupOperationsSnapshot,
  FORGE_BACKUP_SCHEMA_VERSION,
  type BackupOperationsSnapshot,
  type BackupRetentionPolicy,
  type BackupSnapshotRecord,
  type ForgeExportPayload,
  type ForgeUserBackupRecord,
} from '@/domain/backup/types'
import { createDefaultCalendarSyncStateSnapshot } from '@/domain/calendar/types'
import { createDefaultHealthIntegrationSnapshot } from '@/domain/health/types'
import { createDefaultNotificationStateSnapshot, type NotificationStateSnapshot } from '@/domain/notifications/types'
import type { DayInstance } from '@/domain/routine/types'
import { createDefaultUserSettings, type UserSettings } from '@/domain/settings/types'
import type { SyncDiagnosticsSnapshot } from '@/domain/sync/types'
import { deriveAnalyticsInterpretation } from '@/services/analytics/analyticsInterpretationService'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'

type BackupUserLike = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export function buildBackupPayload({
  user,
  fallbackUserId,
  settings,
  dayInstances,
  notificationState,
  syncDiagnostics,
  exportedAt,
  trigger,
}: {
  user: BackupUserLike | null
  fallbackUserId: string
  settings: UserSettings | null
  dayInstances: DayInstance[]
  notificationState: NotificationStateSnapshot | null
  syncDiagnostics: SyncDiagnosticsSnapshot | null
  exportedAt: string
  trigger: 'manual' | 'scheduled'
}): ForgeExportPayload {
  const normalizedSettings = settings ?? createDefaultUserSettings()
  const bundle = generateAnalyticsSnapshotBundle({
    dayInstances,
    settings: normalizedSettings,
    anchorDate: new Date(exportedAt),
  })
  const interpretation = deriveAnalyticsInterpretation({
    bundle,
    windowKey: '30d',
    anchorDateKey: bundle.projection.lastEvaluatedDate,
  })
  const userRecord = mapUserRecord(user)
  const userId = user?.uid ?? fallbackUserId

  return {
    id: buildBackupId({
      userId,
      exportedAt,
      trigger,
    }),
    schemaVersion: FORGE_BACKUP_SCHEMA_VERSION,
    exportedAt,
    userId,
    user: userRecord,
    settings,
    dayInstances,
    analytics: {
      snapshots: [...bundle.dailySnapshots, ...bundle.weeklySnapshots, ...bundle.rollingSnapshots],
      metadata: bundle.metadata ?? createDefaultAnalyticsMetadataSnapshot(),
      projection: bundle.projection,
      streaks: interpretation.gamification.streakSnapshot ?? createDefaultStreakSnapshot(bundle.projection.lastEvaluatedDate),
      missions: interpretation.gamification.missions,
    },
    integrations: {
      calendar: settings
        ? {
            ...createDefaultCalendarSyncStateSnapshot(),
            ...settings.calendarIntegration,
          }
        : null,
      notificationState: notificationState ?? createDefaultNotificationStateSnapshot(),
      syncDiagnostics,
      health: createDefaultHealthIntegrationSnapshot(),
    },
  }
}

export function buildBackupSnapshotRecord({
  payload,
  exportedAt,
  trigger,
  jsonText,
  retentionExpiresAt,
}: {
  payload: ForgeExportPayload
  exportedAt: string
  trigger: 'manual' | 'scheduled'
  jsonText: string
  retentionExpiresAt?: string
}): BackupSnapshotRecord {
  return {
    id: payload.id,
    schemaVersion: payload.schemaVersion,
    trigger,
    status: 'ready',
    createdAt: exportedAt,
    completedAt: exportedAt,
    retentionExpiresAt,
    checksum: buildChecksum(jsonText),
    byteSize: new TextEncoder().encode(jsonText).length,
    sourceRecordCount:
      (payload.user ? 1 : 0) +
      (payload.settings ? 1 : 0) +
      payload.dayInstances.length +
      payload.analytics.snapshots.length +
      (payload.analytics.metadata ? 1 : 0) +
      (payload.analytics.projection ? 1 : 0) +
      (payload.analytics.streaks ? 1 : 0) +
      payload.analytics.missions.length +
      (payload.integrations.notificationState ? 1 : 0) +
      (payload.integrations.calendar ? 1 : 0) +
      (payload.integrations.health ? 1 : 0),
  }
}

export function buildNotesMarkdown(payload: ForgeExportPayload) {
  const notedBlocks = payload.dayInstances
    .flatMap((dayInstance) =>
      dayInstance.blocks
        .filter((block) => block.executionNote?.trim())
        .map((block) => ({
          date: dayInstance.date,
          title: block.title,
          status: block.status,
          note: block.executionNote?.trim() ?? '',
        })),
    )
    .sort((left, right) => left.date.localeCompare(right.date))

  if (notedBlocks.length === 0) {
    return [
      '# Forge Execution Notes',
      '',
      `Exported: ${payload.exportedAt}`,
      '',
      'No execution notes were captured in this backup window yet.',
      '',
    ].join('\n')
  }

  return [
    '# Forge Execution Notes',
    '',
    `Exported: ${payload.exportedAt}`,
    `User: ${payload.user?.displayName ?? payload.userId}`,
    '',
    ...notedBlocks.flatMap((entry) => [
      `## ${entry.date} · ${entry.title}`,
      '',
      `Status: ${entry.status}`,
      '',
      entry.note,
      '',
    ]),
  ].join('\n')
}

export function buildBackupOperationsSnapshot({
  recentBackups,
  retentionPolicy,
  latestFailureAt,
  latestFailureMessage,
  updatedAt,
}: {
  recentBackups: BackupSnapshotRecord[]
  retentionPolicy: BackupRetentionPolicy
  latestFailureAt?: string
  latestFailureMessage?: string
  updatedAt: string
}): BackupOperationsSnapshot {
  const latestSuccessfulBackup =
    recentBackups.find((backup) => backup.trigger === 'scheduled' && backup.status === 'ready') ?? null
  const snapshot = createDefaultBackupOperationsSnapshot()
  const staleAfterHours = snapshot.staleAfterHours
  const latestSuccessAgeHours = latestSuccessfulBackup
    ? (Date.parse(updatedAt) - Date.parse(latestSuccessfulBackup.createdAt)) / (1000 * 60 * 60)
    : null

  return {
    ...snapshot,
    retentionPolicy,
    latestBackupId: latestSuccessfulBackup?.id,
    latestSuccessfulBackupAt: latestSuccessfulBackup?.createdAt,
    latestFailureAt,
    latestFailureMessage,
    healthState:
      latestFailureAt && (!latestSuccessfulBackup || latestFailureAt > latestSuccessfulBackup.createdAt)
        ? 'degraded'
        : latestSuccessAgeHours === null
          ? 'unknown'
          : latestSuccessAgeHours > staleAfterHours
            ? 'stale'
            : 'healthy',
    pendingDeletionCount: recentBackups.filter((backup) => backup.status === 'expired').length,
    updatedAt,
  }
}

export function selectBackupIdsToExpire({
  backups,
  policy,
}: {
  backups: BackupSnapshotRecord[]
  policy: BackupRetentionPolicy
}) {
  const sorted = [...backups]
    .filter((backup) => backup.status === 'ready')
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  const keepIds = new Set<string>()
  const manualBackups = sorted.filter((backup) => backup.trigger === 'manual')
  const scheduledBackups = sorted.filter((backup) => backup.trigger === 'scheduled')

  for (const backup of manualBackups.slice(0, policy.keepManual)) {
    keepIds.add(backup.id)
  }

  const keptDailyDates = new Set<string>()
  for (const backup of scheduledBackups) {
    const dateKey = backup.createdAt.slice(0, 10)

    if (keptDailyDates.size < policy.keepDaily && !keptDailyDates.has(dateKey)) {
      keptDailyDates.add(dateKey)
      keepIds.add(backup.id)
    }
  }

  const keptWeeklyKeys = new Set<string>()
  for (const backup of scheduledBackups) {
    if (keepIds.has(backup.id)) {
      continue
    }

    const weekKey = getWeekKey(backup.createdAt.slice(0, 10))

    if (keptWeeklyKeys.size < policy.keepWeekly && !keptWeeklyKeys.has(weekKey)) {
      keptWeeklyKeys.add(weekKey)
      keepIds.add(backup.id)
    }
  }

  return sorted.filter((backup) => !keepIds.has(backup.id)).map((backup) => backup.id)
}

export function buildBackupId({
  userId,
  exportedAt,
  trigger,
}: {
  userId: string
  exportedAt: string
  trigger: 'manual' | 'scheduled'
}) {
  return `${trigger}-${userId}-${exportedAt.replaceAll(':', '-').replaceAll('.', '-')}`
}

function mapUserRecord(user: BackupUserLike | null): ForgeUserBackupRecord | null {
  if (!user) {
    return null
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

function buildChecksum(content: string) {
  let hash = 5381

  for (let index = 0; index < content.length; index += 1) {
    hash = (hash * 33) ^ content.charCodeAt(index)
  }

  return `djb2-${(hash >>> 0).toString(16)}`
}

function getWeekKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)

  return date.toISOString().slice(0, 10)
}
