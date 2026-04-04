import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded'
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import { Alert, Button, Chip, CircularProgress, Grid, Stack, Switch, Typography } from '@mui/material'
import { useRef, useState, type ChangeEvent } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { usePlatformWorkspace } from '@/features/platform/hooks/usePlatformWorkspace'
import { useApplyRestoreStage } from '@/features/settings/hooks/useApplyRestoreStage'
import { useConnectCalendarRead } from '@/features/settings/hooks/useConnectCalendarRead'
import { useConnectCalendarWrite } from '@/features/settings/hooks/useConnectCalendarWrite'
import { useCreateManualBackup } from '@/features/settings/hooks/useCreateManualBackup'
import { useDisconnectCalendar } from '@/features/settings/hooks/useDisconnectCalendar'
import { useLoadServerRestoreStage } from '@/features/settings/hooks/useLoadServerRestoreStage'
import { useInvokePlatformOperation } from '@/features/settings/hooks/useInvokePlatformOperation'
import { useRefreshCalendarCache } from '@/features/settings/hooks/useRefreshCalendarCache'
import { useRequestNotificationPermission } from '@/features/settings/hooks/useRequestNotificationPermission'
import { useSettingsWorkspace } from '@/features/settings/hooks/useSettingsWorkspace'
import { useSyncCalendarMirrors } from '@/features/settings/hooks/useSyncCalendarMirrors'
import { useUpdateNotificationPreference } from '@/features/settings/hooks/useUpdateNotificationPreference'
import { formatCalendarTimestamp, getCalendarStatusTone } from '@/domain/calendar/presentation'
import { getPlatformCapability } from '@/domain/platform/capabilities'
import type { PlatformCapabilityStatus, PlatformWorkspace } from '@/domain/platform/types'
import type { OperationalDiagnosticSeverity } from '@/services/monitoring/operationalDiagnosticsService'
import { parseRestorePayloadText, type RestoreStage } from '@/services/backup/restoreService'

function getOperationalTone(severity: OperationalDiagnosticSeverity) {
  if (severity === 'critical') {
    return 'error' as const
  }

  if (severity === 'warning') {
    return 'warning' as const
  }

  return 'success' as const
}

function getCapabilityTone(status: PlatformCapabilityStatus) {
  if (status === 'limited') {
    return 'warning' as const
  }

  if (status === 'planned') {
    return 'default' as const
  }

  return 'success' as const
}

function getShellTone(workspace: PlatformWorkspace) {
  if (workspace.runtime === 'nativeShell') {
    return 'warning' as const
  }

  return 'success' as const
}

export function SettingsPage() {
  const { status, user } = useAuthSession()
  const platformWorkspace = usePlatformWorkspace()
  const { data, isLoading } = useSettingsWorkspace(user?.uid)
  const updateNotificationPreference = useUpdateNotificationPreference()
  const requestNotificationPermission = useRequestNotificationPermission()
  const createManualBackup = useCreateManualBackup(user)
  const loadServerRestoreStage = useLoadServerRestoreStage(user?.uid)
  const invokePlatformOperation = useInvokePlatformOperation()
  const connectCalendarRead = useConnectCalendarRead()
  const connectCalendarWrite = useConnectCalendarWrite()
  const disconnectCalendar = useDisconnectCalendar()
  const refreshCalendarCache = useRefreshCalendarCache()
  const syncCalendarMirrors = useSyncCalendarMirrors()
  const applyRestoreStage = useApplyRestoreStage()
  const restoreInputRef = useRef<HTMLInputElement | null>(null)
  const [restoreStage, setRestoreStage] = useState<RestoreStage | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [backupNotice, setBackupNotice] = useState<string | null>(null)

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading integration workspace" description="Forge is restoring local settings and future integration scaffolding.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const {
    backupOperations,
    backupSource,
    calendarConnection,
    calendarMirrorErrorCount,
    calendarMirroredBlockCount,
    calendarSyncState,
    featureFlags,
    healthIntegration,
    latestServerRestoreReadyBackup,
    mirroredBlockPreview,
    notificationState,
    recentBackups,
    recentNotificationLogs,
    recentRestoreJobs,
    serverRestoreReadyCount,
    settings,
    operationalDiagnostics,
    platformServices,
  } = data
  const eligibleServerBackups = recentBackups.filter((backup) => backup.restoreEligibility?.status === 'eligible')
  const ineligibleServerBackups = recentBackups.filter((backup) => backup.restoreEligibility?.status !== 'eligible')
  const calendarTone = getCalendarStatusTone({
    connectionStatus: calendarConnection.connectionStatus,
    externalSyncStatus: calendarSyncState.externalEventSyncStatus,
    mirrorSyncStatus: calendarSyncState.mirrorSyncStatus,
  })
  const calendarActionPendingLabel =
    connectCalendarRead.isPending
      ? 'Connecting read access...'
      : connectCalendarWrite.isPending
        ? 'Enabling write mirroring...'
        : refreshCalendarCache.isPending
          ? 'Refreshing external events...'
          : disconnectCalendar.isPending
            ? 'Disconnecting Calendar...'
            : syncCalendarMirrors.isPending
              ? 'Reconciling mirrored blocks...'
              : null
  const notificationCapability = getPlatformCapability(platformWorkspace, 'notifications')
  const backupExportCapability = getPlatformCapability(platformWorkspace, 'backupExport')
  const restoreImportCapability = getPlatformCapability(platformWorkspace, 'restoreImport')
  const authCapability = getPlatformCapability(platformWorkspace, 'auth')
  const calendarCapability = getPlatformCapability(platformWorkspace, 'calendar')
  const healthCapability = getPlatformCapability(platformWorkspace, 'health')

  async function handleRestoreFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const stage = await parseRestorePayloadText(text)
      setRestoreStage(stage)
      setRestoreError(null)
      setBackupNotice(null)
    } catch (error) {
      setRestoreStage(null)
      setRestoreError(error instanceof Error ? error.message : 'Forge could not parse the selected backup file.')
      setBackupNotice(null)
    } finally {
      event.target.value = ''
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Settings"
        title="Infrastructure surfaces belong here."
        description="This screen will become the operational home for auth, integration status, installability, and future extension flags."
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <SurfaceCard
            eyebrow="Operational Diagnostics"
            title="Launch support posture"
            description="This summary compresses the highest-risk runtime surfaces into one operator view so launch issues can be triaged without cross-reading every integration card."
            action={
              <Chip
                label={operationalDiagnostics.headline}
                size="small"
                variant="outlined"
                color={getOperationalTone(operationalDiagnostics.overallSeverity)}
              />
            }
          >
            <Stack spacing={1.25}>
              <Alert severity={getOperationalTone(operationalDiagnostics.overallSeverity)} variant="outlined">
                {operationalDiagnostics.summary}
              </Alert>
              {operationalDiagnostics.items.map((item) => (
                <Stack
                  key={item.key}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack spacing={0.25} sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.primary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.summary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Owner: {item.owner}
                      {item.lastObservedAt ? ` · Last observed ${formatCalendarTimestamp(item.lastObservedAt, 'Not observed yet')}` : ''}
                    </Typography>
                  </Stack>
                  <Chip label={item.statusLabel} size="small" variant="outlined" color={getOperationalTone(item.severity)} />
                </Stack>
              ))}
              {operationalDiagnostics.blindSpots.map((blindSpot) => (
                <Alert key={blindSpot} severity="info" variant="outlined">
                  {blindSpot}
                </Alert>
              ))}
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SurfaceCard
            eyebrow="Platform Ownership"
            title="Browser vs Functions operational boundaries"
            description="Phase 4 formalizes which responsibilities still belong to the active browser session and which now have an explicit Functions-backed platform contract."
            action={
              <Chip
                label={`${platformServices.functionsOwned.length} Functions-owned`}
                size="small"
                variant="outlined"
                color="primary"
              />
            }
          >
            <Stack spacing={1.5}>
              {platformServices.boundaries.map((boundary) => (
                <Stack
                  key={boundary.key}
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.25}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Stack spacing={0.35} sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.primary">
                      {boundary.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {boundary.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Why this owner is correct: {boundary.rationale}
                    </Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Chip label={boundary.owner} size="small" variant="outlined" color={boundary.owner === 'firebaseFunctions' ? 'primary' : 'default'} />
                    <Chip label={boundary.status} size="small" variant="outlined" color={boundary.status === 'active' ? 'success' : 'default'} />
                    {boundary.callableName ? (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={invokePlatformOperation.isPending || status !== 'authenticated'}
                        onClick={() => invokePlatformOperation.mutate(boundary.key as 'scheduledBackups' | 'scheduledNotifications' | 'analyticsSnapshots')}
                      >
                        {invokePlatformOperation.isPending && invokePlatformOperation.variables === boundary.key
                          ? 'Running...'
                          : boundary.manualTriggerLabel ?? 'Run now'}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              ))}
              {invokePlatformOperation.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {invokePlatformOperation.error instanceof Error
                    ? invokePlatformOperation.error.message
                    : 'Forge could not run the selected Functions-backed platform operation.'}
                </Alert>
              ) : null}
              {invokePlatformOperation.data ? (
                <Alert severity="success" variant="outlined" aria-live="polite">
                  Ran {invokePlatformOperation.data.callableName} through Firebase Functions for {invokePlatformOperation.data.key}.
                </Alert>
              ) : null}
              <Alert severity="info" variant="outlined">
                Planned Functions-owned areas like integration token handling and richer remote diagnostics are documented here intentionally, but they are not prematurely implemented.
              </Alert>
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Auth Boundary"
            title="Firebase session status"
            description="Auth remains the real gate for sync replay and future provider work, so its state belongs in infrastructure settings."
            action={<Chip label={status} size="small" variant="outlined" color={status === 'authenticated' ? 'success' : 'default'} />}
          >
            <Typography variant="body2" color="text.secondary">
              Current auth state: {status}. Calendar scaffolding stays deliberately separate from auth until Google Calendar OAuth is designed for real.
            </Typography>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Runtime Boundary"
            title="Platform and shell support posture"
            description="Phase 4 now distinguishes browser, installed-PWA, and native-shell contexts explicitly so capability claims stay tied to the runtime that actually owns them."
            action={
              <Chip
                label={platformWorkspace.shellLabel}
                size="small"
                variant="outlined"
                color={getShellTone(platformWorkspace)}
              />
            }
          >
            <Stack spacing={1.25}>
              <Typography variant="body2" color="text.secondary">
                {platformWorkspace.summary}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Support tier: {platformWorkspace.shellSupportLabel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Install posture: {platformWorkspace.installSurfaceLabel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending update: {platformWorkspace.needRefresh ? 'Yes' : 'No'} · Offline shell ready: {platformWorkspace.offlineReady ? 'Yes' : 'No'}
              </Typography>
              {platformWorkspace.supportNotes.map((note) => (
                <Alert key={note} severity="info" variant="outlined">
                  {note}
                </Alert>
              ))}
              <Stack spacing={1}>
                {platformWorkspace.capabilities.map((capability) => (
                  <Stack
                    key={capability.key}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Stack spacing={0.25} sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.primary">
                        {capability.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {capability.summary}
                      </Typography>
                    </Stack>
                    <Chip
                      label={capability.status}
                      size="small"
                      variant="outlined"
                      color={getCapabilityTone(capability.status)}
                    />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Notification Surface"
            title="Operational notification posture"
            description="Phase 3 notifications stay sparse and rule-driven: missed prime block, fallback suggestion, and weekly summary. This card exposes the real browser permission and delivery state behind that posture."
            action={
              <Chip
                label={notificationState.permission}
                size="small"
                variant="outlined"
                color={notificationState.permission === 'granted' ? 'success' : notificationState.permission === 'denied' ? 'warning' : 'default'}
              />
            }
          >
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                <Stack spacing={0.25}>
                  <Typography variant="body2" color="text.secondary">
                    Notification rules enabled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily cap: {notificationState.dailyCap} · Supported channels: {notificationState.supportedChannels.join(', ')}
                  </Typography>
                </Stack>
                <Switch
                  checked={settings?.notificationsEnabled ?? true}
                  onChange={(_, checked) => updateNotificationPreference.mutate(checked)}
                  disabled={updateNotificationPreference.isPending}
                  inputProps={{
                    'aria-label': 'Enable operational notifications',
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Permission: {notificationState.permission}. Delivered today: {notificationState.countersByDate[new Date().toISOString().slice(0, 10)]?.delivered ?? 0}. Suppressed today: {notificationState.countersByDate[new Date().toISOString().slice(0, 10)]?.suppressed ?? 0}.
              </Typography>
              {notificationCapability ? (
                <Alert severity={notificationCapability.status === 'limited' ? 'warning' : 'info'} variant="outlined">
                  {notificationCapability.summary}
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<NotificationsActiveRoundedIcon />}
                  onClick={() => requestNotificationPermission.mutate()}
                  disabled={requestNotificationPermission.isPending || notificationState.permission === 'granted'}
                >
                  {notificationState.permission === 'granted' ? 'Permission granted' : 'Request browser permission'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Forge only asks for browser notification permission because browser and installed-PWA delivery are the honest Phase 3 channels.
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Recent notification records: {recentNotificationLogs.length === 0 ? 'None yet.' : recentNotificationLogs.slice(0, 2).map((log) => `${log.ruleKey} (${log.status})`).join(' · ')}
              </Typography>
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Backup Surface"
            title="Manual export and controlled restore"
            description="Forge now combines deterministic local exports with scheduled remote protection, while keeping restore posture and storage provenance explicit."
            action={
              <Chip
                label={recentBackups[0]?.status ?? 'No backups yet'}
                size="small"
                variant="outlined"
                color={
                  backupOperations.healthState === 'healthy'
                    ? 'success'
                    : backupOperations.healthState === 'stale' || backupOperations.healthState === 'degraded'
                      ? 'warning'
                      : 'default'
                }
              />
            }
          >
            <Stack spacing={1.25}>
              <Typography variant="body2" color="text.secondary">
                Latest backup record: {recentBackups[0] ? `${recentBackups[0].createdAt} · ${recentBackups[0].sourceRecordCount} records` : 'None yet.'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled backup health: {backupOperations.healthState}. Last successful backup:{' '}
                {backupOperations.latestSuccessfulBackupAt ?? 'None yet'}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Retention: keep {backupOperations.retentionPolicy.keepDaily} daily, {backupOperations.retentionPolicy.keepWeekly} weekly, and {backupOperations.retentionPolicy.keepManual} manual backups.
                Status source: {backupSource.operations}. Recent backup list source: {backupSource.recentBackups}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Server restore posture: {serverRestoreReadyCount} restore-ready scheduled backup{serverRestoreReadyCount === 1 ? '' : 's'} in the current view.
                {latestServerRestoreReadyBackup ? ` Latest restore-ready backup: ${latestServerRestoreReadyBackup.createdAt}.` : ' No server restore-ready backup is visible yet.'}
              </Typography>
              {backupExportCapability ? (
                <Alert severity={backupExportCapability.status === 'limited' ? 'warning' : 'info'} variant="outlined">
                  {backupExportCapability.summary}
                </Alert>
              ) : null}
              {restoreImportCapability ? (
                <Alert severity={restoreImportCapability.status === 'limited' ? 'warning' : 'info'} variant="outlined">
                  {restoreImportCapability.summary}
                </Alert>
              ) : null}
              {backupSource.operations !== backupSource.recentBackups ? (
                <Alert severity="info" variant="outlined">
                  Forge loaded backup health from {backupSource.operations} state, but the recent backup list is currently using {backupSource.recentBackups} fallback data.
                </Alert>
              ) : null}
              {serverRestoreReadyCount === 0 ? (
                <Alert severity="info" variant="outlined">
                  No restore-ready scheduled backups are visible right now, so recovery still depends on local file restore until the next successful scheduled backup appears.
                </Alert>
              ) : null}
              {backupOperations.latestFailureMessage ? (
                <Alert severity="warning" variant="outlined">
                  Latest scheduled-backup issue: {backupOperations.latestFailureMessage}
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={() =>
                    createManualBackup.mutate(
                      { kind: 'json' },
                      {
                        onSuccess: (result) => {
                          setBackupNotice(`Backup exported: ${result.suggestedJsonFilename}`)
                          setRestoreError(null)
                        },
                      },
                    )
                  }
                  disabled={createManualBackup.isPending}
                >
                  Export backup JSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArchiveRoundedIcon />}
                  onClick={() =>
                    createManualBackup.mutate(
                      { kind: 'notes' },
                      {
                        onSuccess: (result) => {
                          setBackupNotice(`Notes exported: ${result.suggestedNotesFilename}`)
                          setRestoreError(null)
                        },
                      },
                    )
                  }
                  disabled={createManualBackup.isPending}
                >
                  Export notes markdown
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileRoundedIcon />}
                  onClick={() => restoreInputRef.current?.click()}
                  disabled={applyRestoreStage.isPending}
                >
                  Load restore file
                </Button>
                <input
                  ref={restoreInputRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={handleRestoreFileSelected}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Restore applies core local state first and reports partial compatibility honestly for analytics or provider-owned metadata that Forge prefers to regenerate.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current restore source: {restoreStage ? restoreStage.source.label : 'No restore staged yet.'}
              </Typography>
              {eligibleServerBackups.length > 0 ? (
                <SurfaceCard
                  eyebrow="Scheduled Backup Recovery"
                  title="Stage a restore from server-backed protection"
                  description="These backups are already marked restore-eligible from remote metadata. Loading one here only stages it; Forge still waits for explicit apply confirmation."
                  contentSx={{ p: 0 }}
                >
                  <Stack spacing={1.25}>
                    {eligibleServerBackups.map((backup) => (
                      <Stack
                        key={backup.id}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Stack spacing={0.25} sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.primary">
                            Scheduled backup · {formatCalendarTimestamp(backup.createdAt, backup.createdAt)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: {backup.status} · Records: {backup.sourceRecordCount} · Source: {backupSource.recentBackups}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Payload: {backup.payloadPointer?.provider ?? 'legacy metadata'} · Eligibility checked {backup.restoreEligibility?.checkedAt ?? 'during backup load'}
                          </Typography>
                        </Stack>
                        <Button
                          variant="outlined"
                          startIcon={loadServerRestoreStage.isPending ? <CircularProgress size={16} color="inherit" /> : <RestoreRoundedIcon />}
                          disabled={loadServerRestoreStage.isPending || applyRestoreStage.isPending}
                          onClick={() =>
                            loadServerRestoreStage.mutate(backup, {
                              onSuccess: (stage) => {
                                setRestoreStage(stage)
                                setRestoreError(null)
                                setBackupNotice(`Staged remote restore from ${formatCalendarTimestamp(backup.createdAt, backup.createdAt)}.`)
                              },
                            })
                          }
                        >
                          {loadServerRestoreStage.isPending ? 'Loading remote backup...' : 'Stage restore'}
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                </SurfaceCard>
              ) : null}
              {ineligibleServerBackups.length > 0 ? (
                <Alert severity="info" variant="outlined">
                  Some recent scheduled backups are not restore-ready yet: {ineligibleServerBackups
                    .map((backup) => `${backup.id} (${backup.restoreEligibility?.status ?? 'unknown'})`)
                    .join(' · ')}
                </Alert>
              ) : null}
              {restoreError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {restoreError}
                </Alert>
              ) : null}
              {loadServerRestoreStage.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {loadServerRestoreStage.error instanceof Error
                    ? loadServerRestoreStage.error.message
                    : 'Forge could not load the selected scheduled backup.'}
                </Alert>
              ) : null}
              {createManualBackup.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {createManualBackup.error instanceof Error
                    ? createManualBackup.error.message
                    : 'Forge could not generate the requested backup export.'}
                </Alert>
              ) : null}
              {backupNotice ? (
                <Alert severity="success" variant="outlined" aria-live="polite">
                  {backupNotice}
                </Alert>
              ) : null}
              {restoreStage ? (
                <Alert severity="info" variant="outlined" aria-live="polite">
                  {restoreStage.summary} Source: {restoreStage.source.label}.
                  {restoreStage.warnings.length > 0 ? ` Warnings: ${restoreStage.warnings.join(' ')}` : ''}
                </Alert>
              ) : null}
              {applyRestoreStage.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {applyRestoreStage.error instanceof Error
                    ? applyRestoreStage.error.message
                    : 'Forge could not apply the staged restore.'}
                </Alert>
              ) : null}
              {applyRestoreStage.data ? (
                <Alert severity={applyRestoreStage.data.status === 'applied' ? 'success' : 'warning'} variant="outlined" aria-live="polite">
                  {applyRestoreStage.data.summary}
                  {applyRestoreStage.data.warnings.length > 0 ? ` ${applyRestoreStage.data.warnings.join(' ')}` : ''}
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<RestoreRoundedIcon />}
                  onClick={() =>
                    restoreStage &&
                    applyRestoreStage.mutate(restoreStage, {
                      onSuccess: () => {
                        setRestoreStage(null)
                        setRestoreError(null)
                        setBackupNotice('Restore applied. Forge refreshed local workspaces from the restored state.')
                      },
                    })
                  }
                  disabled={!restoreStage || applyRestoreStage.isPending}
                >
                  Apply staged restore
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Recent restore jobs: {recentRestoreJobs.length === 0 ? 'None yet.' : recentRestoreJobs.map((job) => `${job.status} (${job.createdAt.slice(0, 10)})`).join(' · ')}
                </Typography>
              </Stack>
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Calendar Read Integration"
            title="Google Calendar pressure and mirror boundary"
            description="Forge reads your primary Google Calendar for pressure, and can now mirror major routine blocks back into Calendar through an explicit write scope and manual reconciliation pass."
            action={
              <Chip
                label={`read ${calendarSyncState.externalEventSyncStatus} · mirror ${calendarSyncState.mirrorSyncStatus}`}
                size="small"
                variant="outlined"
                color={calendarTone}
              />
            }
          >
            <Stack spacing={1.25}>
              <Typography variant="body2" color="text.secondary">
                Provider: {calendarConnection.provider}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connection: {calendarConnection.connectionStatus} · Feature gate: {calendarConnection.featureGate} · Managed mode: {calendarConnection.managedEventMode}
              </Typography>
              {authCapability ? (
                <Alert severity={authCapability.status === 'limited' ? 'warning' : 'info'} variant="outlined">
                  {authCapability.summary}
                </Alert>
              ) : null}
              {calendarCapability ? (
                <Alert severity={calendarCapability.status === 'limited' ? 'warning' : 'info'} variant="outlined">
                  {calendarCapability.summary}
                </Alert>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                Read sync: {calendarSyncState.externalEventSyncStatus}. Last external sync: {formatCalendarTimestamp(calendarSyncState.lastExternalSyncAt)}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mirror sync: {calendarSyncState.mirrorSyncStatus}. Last mirror sync: {formatCalendarTimestamp(calendarSyncState.lastMirrorSyncAt)}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cached external events: {calendarSyncState.cachedEventCount}. Mirrored major blocks: {calendarMirroredBlockCount}. Mirror errors: {calendarMirrorErrorCount}. Selected calendar: {calendarConnection.selectedCalendarIds[0] ?? 'primary'}.
              </Typography>
              {calendarSyncState.lastSyncError ? (
                <Alert severity="warning" variant="outlined" aria-live="polite">
                  Calendar issue: {calendarSyncState.lastSyncError}
                </Alert>
              ) : null}
              {calendarSyncState.lastMirrorSyncError ? (
                <Alert severity="warning" variant="outlined" aria-live="polite">
                  Last mirror reconciliation issue: {calendarSyncState.lastMirrorSyncError}
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={connectCalendarRead.isPending ? <CircularProgress size={16} color="inherit" /> : <CalendarMonthRoundedIcon />}
                  onClick={() => connectCalendarRead.mutate()}
                  disabled={Boolean(calendarActionPendingLabel) || status !== 'authenticated'}
                >
                  {connectCalendarRead.isPending
                    ? 'Connecting read access...'
                    : calendarConnection.connectionStatus === 'connected'
                      ? 'Reconnect read access'
                      : 'Connect read access'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={connectCalendarWrite.isPending ? <CircularProgress size={16} color="inherit" /> : <CalendarMonthRoundedIcon />}
                  onClick={() => connectCalendarWrite.mutate()}
                  disabled={Boolean(calendarActionPendingLabel) || status !== 'authenticated'}
                >
                  {connectCalendarWrite.isPending
                    ? 'Enabling write mirroring...'
                    : calendarConnection.featureGate === 'writeEnabled'
                      ? 'Refresh write access'
                      : 'Enable write mirroring'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={refreshCalendarCache.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                  onClick={() => refreshCalendarCache.mutate()}
                  disabled={Boolean(calendarActionPendingLabel) || calendarConnection.connectionStatus !== 'connected'}
                >
                  {refreshCalendarCache.isPending ? 'Refreshing external events...' : 'Refresh read cache'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={syncCalendarMirrors.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                  onClick={() => syncCalendarMirrors.mutate()}
                  disabled={
                    Boolean(calendarActionPendingLabel) ||
                    calendarConnection.connectionStatus !== 'connected' ||
                    calendarConnection.featureGate !== 'writeEnabled'
                  }
                >
                  {syncCalendarMirrors.isPending ? 'Reconciling mirrored blocks...' : 'Sync major blocks'}
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => disconnectCalendar.mutate()}
                  disabled={Boolean(calendarActionPendingLabel) || calendarConnection.connectionStatus === 'notConnected'}
                >
                  {disconnectCalendar.isPending ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </Stack>
              {calendarActionPendingLabel ? (
                <Typography variant="body2" color="text.secondary">
                  {calendarActionPendingLabel}
                </Typography>
              ) : null}
              {connectCalendarRead.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {connectCalendarRead.error instanceof Error ? connectCalendarRead.error.message : 'Forge could not connect Google Calendar.'}
                </Alert>
              ) : null}
              {connectCalendarWrite.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {connectCalendarWrite.error instanceof Error ? connectCalendarWrite.error.message : 'Forge could not enable Calendar write mirroring.'}
                </Alert>
              ) : null}
              {refreshCalendarCache.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {refreshCalendarCache.error instanceof Error ? refreshCalendarCache.error.message : 'Forge could not refresh the Calendar cache.'}
                </Alert>
              ) : null}
              {syncCalendarMirrors.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {syncCalendarMirrors.error instanceof Error ? syncCalendarMirrors.error.message : 'Forge could not reconcile mirrored Calendar blocks.'}
                </Alert>
              ) : null}
              {disconnectCalendar.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {disconnectCalendar.error instanceof Error ? disconnectCalendar.error.message : 'Forge could not disconnect Google Calendar.'}
                </Alert>
              ) : null}
              {syncCalendarMirrors.data ? (
                <Alert severity={syncCalendarMirrors.data.errorCount > 0 ? 'warning' : 'success'} variant="outlined" aria-live="polite">
                  Mirror sync result: {syncCalendarMirrors.data.createdCount} created, {syncCalendarMirrors.data.updatedCount} updated, {syncCalendarMirrors.data.deletedCount} deleted, {syncCalendarMirrors.data.errorCount} failed.
                </Alert>
              ) : null}
              <Typography variant="body2" color="primary.light">
                Mirrored title convention: {mirroredBlockPreview.eventTitle}
              </Typography>
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Health Integration"
            title="Wearable and health provider scaffolding"
            description={healthIntegration.phaseNotice}
            action={
              <Chip
                label={healthIntegration.connectionSummary}
                size="small"
                variant="outlined"
                icon={<MonitorHeartRoundedIcon />}
                color="default"
              />
            }
          >
            <Stack spacing={1.25}>
              <Typography variant="body2" color="text.secondary">
                {healthIntegration.statusSummaryLabel}
              </Typography>
              {healthCapability ? (
                <Alert severity="info" variant="outlined">
                  {healthCapability.summary}
                </Alert>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                Available signals: {healthIntegration.availableSignalCount} of {healthIntegration.totalSignalCount} (0 connected in Phase 3)
              </Typography>
              {healthIntegration.providers.map((provider) => (
                <Stack key={provider.provider} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {provider.displayName}
                  </Typography>
                  <Chip
                    label={provider.unavailableLabel}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                </Stack>
              ))}
              <Alert severity="info" variant="outlined">
                Health integration seams are typed and ready for future providers. No fake connectivity or dead buttons exist here. The native shell now exists, but real provider bridges and permission flows are still deferred to a later milestone.
              </Alert>
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Feature Flags"
            title="Planned provider hooks"
            description="These flags make the current scaffold honest: the recommendation engine can accept calendar conflict context now, but live calendar reads and writes remain intentionally off."
          >
            <Stack spacing={0.75}>
              <Typography variant="body2" color="text.secondary">
                Collision-aware recommendations: {featureFlags.collisionAwareRecommendations ? 'Enabled at the type boundary' : 'Off'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Read mirror: {featureFlags.readMirror}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Write mirror: {featureFlags.writeMirror}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phase 3 currently supports primary-calendar read integration plus explicit major-block write mirroring. Long-lived server-managed Calendar OAuth is still deferred.
              </Typography>
            </Stack>
          </SurfaceCard>
        </Grid>
      </Grid>
      <Alert severity="info" variant="outlined">
        Notifications now have a real rule and delivery foundation. Backup and restore now provide deterministic local and scheduled safety. Calendar can read pressure and mirror major Forge blocks, but Forge remains the source of truth and Calendar reconciliation is still an explicit operator action.
      </Alert>
      <EmptyState
        icon={<SettingsSuggestRoundedIcon color="primary" />}
        title="Integration controls will land here."
        description="Empty and placeholder states now use a deliberate pattern instead of ad hoc text blocks, so unfinished areas can still feel intentional."
      />
    </Stack>
  )
}
