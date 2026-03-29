import {
  localDayInstanceRepository,
  localHealthIntegrationRepository,
  localNotificationStateRepository,
  localRestoreJobRepository,
  localSettingsRepository,
  localSyncQueueRepository,
} from '@/data/local'
import {
  createEmptyRestoreCounts,
  FORGE_BACKUP_SCHEMA_VERSION,
  type ForgeExportPayload,
  type RestoreJobRecord,
} from '@/domain/backup/types'
import { createDefaultUserSettings } from '@/domain/settings/types'

export type RestoreStage = {
  payload: ForgeExportPayload
  summary: string
  warnings: string[]
}

export async function parseRestorePayloadText(text: string): Promise<RestoreStage> {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Restore payload is not valid JSON.')
  }

  const payload = validateRestorePayload(parsed)
  const warnings = buildRestoreWarnings(payload)

  return {
    payload,
    warnings,
    summary: `Restore payload includes ${payload.dayInstances.length} day instance(s), ${payload.analytics.snapshots.length} analytics snapshot(s), and ${payload.analytics.missions.length} mission record(s).`,
  }
}

export async function applyRestoreStage(stage: RestoreStage): Promise<RestoreJobRecord> {
  const startedAt = new Date().toISOString()
  const appliedCounts = createEmptyRestoreCounts()
  const warnings = [...stage.warnings]
  const outstandingSyncItems = await localSyncQueueRepository.listOutstanding()
  const baseSettings = stage.payload.settings ?? (stage.payload.integrations.calendar ? createDefaultUserSettings() : null)
  const normalizedSettings = baseSettings
    ? {
        ...baseSettings,
        calendarIntegration: stage.payload.integrations.calendar
          ? {
              provider: stage.payload.integrations.calendar.provider,
              connectionStatus: stage.payload.integrations.calendar.connectionStatus,
              featureGate: stage.payload.integrations.calendar.featureGate,
              managedEventMode: stage.payload.integrations.calendar.managedEventMode,
              selectedCalendarIds: stage.payload.integrations.calendar.selectedCalendarIds,
              lastConnectionCheckAt: stage.payload.integrations.calendar.lastConnectionCheckAt,
              lastSuccessfulSyncAt: stage.payload.integrations.calendar.lastSuccessfulSyncAt,
            }
          : baseSettings.calendarIntegration,
      }
    : null

  if (normalizedSettings) {
    await localSettingsRepository.upsert(normalizedSettings)
    appliedCounts.settings = 1
    appliedCounts.calendarState = stage.payload.integrations.calendar ? 1 : 0
  } else {
    warnings.push('Settings payload was empty, so Forge kept the current local settings baseline.')
  }

  if (stage.payload.dayInstances.length > 0) {
    await localDayInstanceRepository.upsertMany(stage.payload.dayInstances)
    appliedCounts.dayInstances = stage.payload.dayInstances.length
  }

  if (stage.payload.integrations.notificationState) {
    await localNotificationStateRepository.upsert(stage.payload.integrations.notificationState)
    appliedCounts.notificationState = 1
  }

  if (stage.payload.integrations.health) {
    await localHealthIntegrationRepository.upsert(stage.payload.integrations.health)
    appliedCounts.healthState = 1
  }

  if (stage.payload.user) {
    warnings.push('Auth user records are managed by Firebase Auth and were not restored into local app state.')
  }

  if (stage.payload.analytics.snapshots.length > 0 || stage.payload.analytics.projection || stage.payload.analytics.streaks) {
    warnings.push('Analytics snapshots, projections, streaks, and missions are derived state and will be regenerated rather than restored directly.')
  }

  if (stage.payload.integrations.syncDiagnostics) {
    warnings.push('Sync diagnostics are operational telemetry and were intentionally not restored.')
  }

  if (outstandingSyncItems.length > 0) {
    await localSyncQueueRepository.clearAll()
    warnings.push(
      `Cleared ${outstandingSyncItems.length} queued local sync item(s) so stale pre-restore writes cannot replay over the restored state.`,
    )
  }

  const completedAt = new Date().toISOString()
  const job: RestoreJobRecord = {
    id: `restore-${stage.payload.id}-${completedAt.replaceAll(':', '-').replaceAll('.', '-')}`,
    schemaVersion: stage.payload.schemaVersion,
    status: warnings.length > 0 ? 'partial' : 'applied',
    createdAt: startedAt,
    startedAt,
    completedAt,
    summary:
      warnings.length > 0
        ? 'Restore applied with partial compatibility warnings.'
        : 'Restore applied successfully.',
    warnings,
    appliedCounts,
  }

  await localRestoreJobRepository.upsert(job)

  return job
}

export function validateRestorePayload(payload: unknown): ForgeExportPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Restore payload must be an object.')
  }

  const candidate = payload as Partial<ForgeExportPayload>

  if (candidate.schemaVersion !== FORGE_BACKUP_SCHEMA_VERSION) {
    throw new Error(`Unsupported backup schema version: ${candidate.schemaVersion ?? 'unknown'}.`)
  }

  if (typeof candidate.id !== 'string' || typeof candidate.userId !== 'string' || typeof candidate.exportedAt !== 'string') {
    throw new Error('Restore payload is missing required backup metadata.')
  }

  if (!Array.isArray(candidate.dayInstances)) {
    throw new Error('Restore payload must include a dayInstances array.')
  }

  if (!candidate.analytics || typeof candidate.analytics !== 'object') {
    throw new Error('Restore payload is missing analytics content.')
  }

  if (!Array.isArray(candidate.analytics.snapshots) || !Array.isArray(candidate.analytics.missions)) {
    throw new Error('Restore payload analytics content is malformed.')
  }

  if (!candidate.integrations || typeof candidate.integrations !== 'object') {
    throw new Error('Restore payload is missing integration content.')
  }

  return {
    id: candidate.id,
    schemaVersion: candidate.schemaVersion,
    exportedAt: candidate.exportedAt,
    userId: candidate.userId,
    user: candidate.user ?? null,
    settings: candidate.settings ?? null,
    dayInstances: candidate.dayInstances,
    analytics: {
      snapshots: candidate.analytics.snapshots,
      metadata: candidate.analytics.metadata ?? null,
      projection: candidate.analytics.projection ?? null,
      streaks: candidate.analytics.streaks ?? null,
      missions: candidate.analytics.missions,
    },
    integrations: {
      calendar: candidate.integrations.calendar ?? null,
      notificationState: candidate.integrations.notificationState ?? null,
      syncDiagnostics: candidate.integrations.syncDiagnostics ?? null,
      health: candidate.integrations.health ?? null,
    },
  }
}

function buildRestoreWarnings(payload: ForgeExportPayload) {
  const warnings: string[] = []

  if (payload.analytics.snapshots.length === 0) {
    warnings.push('This backup does not include analytics snapshots, so trend history will regenerate from restored execution data only.')
  }

  if (!payload.integrations.notificationState) {
    warnings.push('Notification state is missing, so notification counters will restart from the local default.')
  }

  if (!payload.settings) {
    warnings.push('Settings are missing, so Forge will fall back to default local settings during restore.')
  }

  return warnings
}
