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
import { usePwaState } from '@/features/pwa/providers/usePwaState'
import { useApplyRestoreStage } from '@/features/settings/hooks/useApplyRestoreStage'
import { useConnectCalendarRead } from '@/features/settings/hooks/useConnectCalendarRead'
import { useConnectCalendarWrite } from '@/features/settings/hooks/useConnectCalendarWrite'
import { useCreateManualBackup } from '@/features/settings/hooks/useCreateManualBackup'
import { useDisconnectCalendar } from '@/features/settings/hooks/useDisconnectCalendar'
import { useRefreshCalendarCache } from '@/features/settings/hooks/useRefreshCalendarCache'
import { useRequestNotificationPermission } from '@/features/settings/hooks/useRequestNotificationPermission'
import { useSettingsWorkspace } from '@/features/settings/hooks/useSettingsWorkspace'
import { useSyncCalendarMirrors } from '@/features/settings/hooks/useSyncCalendarMirrors'
import { useUpdateNotificationPreference } from '@/features/settings/hooks/useUpdateNotificationPreference'
import { formatCalendarTimestamp, getCalendarStatusTone } from '@/domain/calendar/presentation'
import { parseRestorePayloadText, type RestoreStage } from '@/services/backup/restoreService'

export function SettingsPage() {
  const { status, user } = useAuthSession()
  const { canInstall, isInstalled, isOnline, needRefresh, offlineReady } = usePwaState()
  const { data, isLoading } = useSettingsWorkspace(user?.uid)
  const updateNotificationPreference = useUpdateNotificationPreference()
  const requestNotificationPermission = useRequestNotificationPermission()
  const createManualBackup = useCreateManualBackup(user)
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
  } = data
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
            eyebrow="PWA Surface"
            title="Installability and shell readiness"
            description="Milestone 9 made the app installable and offline-aware; this card exposes that platform state inside the product."
            action={<Chip label={isOnline ? 'Online' : 'Offline'} size="small" variant="outlined" color={isOnline ? 'success' : 'warning'} />}
          >
            <Stack spacing={0.75}>
              <Typography variant="body2" color="text.secondary">
                Installed: {isInstalled ? 'Yes' : 'Not yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Install prompt available: {canInstall ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending update: {needRefresh ? 'Yes' : 'No'} · Offline shell ready: {offlineReady ? 'Yes' : 'No'}
              </Typography>
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
                Server restore foundation: {serverRestoreReadyCount} restore-ready scheduled backup{serverRestoreReadyCount === 1 ? '' : 's'} in the current view.
                {latestServerRestoreReadyBackup ? ` Latest restore-ready backup: ${latestServerRestoreReadyBackup.createdAt}.` : ' No server restore-ready backup is visible yet.'}
              </Typography>
              {backupSource.operations !== backupSource.recentBackups ? (
                <Alert severity="info" variant="outlined">
                  Forge loaded backup health from {backupSource.operations} state, but the recent backup list is currently using {backupSource.recentBackups} fallback data.
                </Alert>
              ) : null}
              {serverRestoreReadyCount === 0 ? (
                <Alert severity="info" variant="outlined">
                  Forge now has the retrieval foundation for server-side scheduled backup restore, but the in-app backup picker is still a later milestone.
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
              {restoreError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {restoreError}
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
                  {restoreStage.summary}
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
                Health integration seams are typed and ready for future providers. No fake connectivity or dead buttons exist here. Connect flows will land in a dedicated future phase once the native mobile shell exists.
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
