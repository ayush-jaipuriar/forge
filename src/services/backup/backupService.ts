import {
  localBackupOperationsRepository,
  localBackupRepository,
  localDayInstanceRepository,
  localExportPayloadRepository,
  localNotificationStateRepository,
  localSettingsRepository,
  localSyncDiagnosticsRepository,
} from '@/data/local'
import {
  type BackupSnapshotRecord,
  type ForgeExportPayload,
} from '@/domain/backup/types'
import type { SessionUser } from '@/features/auth/types/auth'
import {
  buildBackupOperationsSnapshot,
  buildBackupPayload,
  buildBackupSnapshotRecord,
  buildNotesMarkdown,
} from '@/services/backup/backupSerialization'

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

  await Promise.all([
    localExportPayloadRepository.save(payload),
    localBackupRepository.upsert(backupRecord),
    localBackupOperationsRepository.upsert(
      buildBackupOperationsSnapshot({
        recentBackups: [backupRecord, ...(await localBackupRepository.listRecent(20))],
        retentionPolicy: (await localBackupOperationsRepository.getDefault())?.retentionPolicy ?? {
          keepDaily: 7,
          keepWeekly: 8,
          keepManual: 20,
        },
        updatedAt: exportedAt,
      }),
    ),
  ])

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
  return buildBackupPayload({
    user,
    fallbackUserId: 'local-user',
    settings,
    dayInstances,
    notificationState,
    syncDiagnostics,
    exportedAt,
    trigger,
  })
}
