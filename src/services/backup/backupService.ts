import {
  localBackupRepository,
  localDayInstanceRepository,
  localExportPayloadRepository,
  localNotificationStateRepository,
  localSettingsRepository,
  localSyncDiagnosticsRepository,
} from '@/data/local'
import {
  createDefaultAnalyticsMetadataSnapshot,
  createDefaultStreakSnapshot,
} from '@/domain/analytics/types'
import {
  FORGE_BACKUP_SCHEMA_VERSION,
  type BackupSnapshotRecord,
  type ForgeExportPayload,
  type ForgeUserBackupRecord,
} from '@/domain/backup/types'
import { createDefaultCalendarSyncStateSnapshot } from '@/domain/calendar/types'
import { createDefaultHealthIntegrationSnapshot } from '@/domain/health/types'
import { createDefaultNotificationStateSnapshot } from '@/domain/notifications/types'
import { createDefaultUserSettings } from '@/domain/settings/types'
import type { SessionUser } from '@/features/auth/types/auth'
import { deriveAnalyticsInterpretation } from '@/services/analytics/analyticsInterpretationService'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'

export type ManualBackupResult = {
  backupRecord: BackupSnapshotRecord
  payload: ForgeExportPayload
  jsonText: string
  notesMarkdown: string
  suggestedJsonFilename: string
  suggestedNotesFilename: string
}

export async function createManualBackup(user: SessionUser | null): Promise<ManualBackupResult> {
  const exportedAt = new Date().toISOString()
  const payload = await buildExportPayload({
    user,
    exportedAt,
    trigger: 'manual',
  })
  const jsonText = JSON.stringify(payload, null, 2)
  const notesMarkdown = buildNotesMarkdown(payload)
  const backupRecord = buildBackupSnapshotRecord({
    payload,
    exportedAt,
    trigger: 'manual',
    jsonText,
  })

  await Promise.all([localExportPayloadRepository.save(payload), localBackupRepository.upsert(backupRecord)])

  return {
    backupRecord,
    payload,
    jsonText,
    notesMarkdown,
    suggestedJsonFilename: `forge-backup-${payload.userId}-${payload.exportedAt.slice(0, 10)}.json`,
    suggestedNotesFilename: `forge-notes-${payload.userId}-${payload.exportedAt.slice(0, 10)}.md`,
  }
}

export async function buildExportPayload({
  user,
  exportedAt = new Date().toISOString(),
  trigger = 'manual',
}: {
  user: SessionUser | null
  exportedAt?: string
  trigger?: 'manual' | 'scheduled'
}): Promise<ForgeExportPayload> {
  const [settings, dayInstances, notificationState, syncDiagnostics] = await Promise.all([
    localSettingsRepository.getDefault(),
    localDayInstanceRepository.listAll(),
    localNotificationStateRepository.getDefault(),
    localSyncDiagnosticsRepository.getDefault(),
  ])
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

  return {
    id: buildBackupId({
      userId: user?.uid ?? 'local-user',
      exportedAt,
      trigger,
    }),
    schemaVersion: FORGE_BACKUP_SCHEMA_VERSION,
    exportedAt,
    userId: user?.uid ?? 'local-user',
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

function buildBackupSnapshotRecord({
  payload,
  exportedAt,
  trigger,
  jsonText,
}: {
  payload: ForgeExportPayload
  exportedAt: string
  trigger: 'manual' | 'scheduled'
  jsonText: string
}): BackupSnapshotRecord {
  return {
    id: payload.id,
    schemaVersion: payload.schemaVersion,
    trigger,
    status: 'ready',
    createdAt: exportedAt,
    completedAt: exportedAt,
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

function mapUserRecord(user: SessionUser | null): ForgeUserBackupRecord | null {
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

function buildBackupId({
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

function buildChecksum(content: string) {
  let hash = 5381

  for (let index = 0; index < content.length; index += 1) {
    hash = (hash * 33) ^ content.charCodeAt(index)
  }

  return `djb2-${(hash >>> 0).toString(16)}`
}
