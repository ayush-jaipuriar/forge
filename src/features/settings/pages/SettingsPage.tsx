import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import { Alert, Box, Button, Chip, CircularProgress, Collapse, Stack, Switch, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
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
import { useRefreshCloudWorkspace } from '@/features/settings/hooks/useRefreshCloudWorkspace'
import { useRequestNotificationPermission } from '@/features/settings/hooks/useRequestNotificationPermission'
import { useSettingsWorkspace } from '@/features/settings/hooks/useSettingsWorkspace'
import { useSyncCalendarMirrors } from '@/features/settings/hooks/useSyncCalendarMirrors'
import { useUpdateNotificationPreference } from '@/features/settings/hooks/useUpdateNotificationPreference'
import { formatCalendarTimestamp, getCalendarStatusTone } from '@/domain/calendar/presentation'
import type { PlatformCapabilityStatus, PlatformWorkspace } from '@/domain/platform/types'
import type { OperationalDiagnosticSeverity } from '@/services/monitoring/operationalDiagnosticsService'
import { parseRestorePayloadText, type RestoreStage } from '@/services/backup/restoreService'
import { useOnlineStatus } from '@/services/sync/useOnlineStatus'

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

function getProviderSupportSummary(reason?: string) {
  switch (reason) {
    case 'requiresNativeShell':
      return 'Native shell required'
    case 'platformIncompatible':
      return 'Platform incompatible'
    case 'requiresWearableDevice':
      return 'Wearable required'
    case 'phaseNotStarted':
      return 'Future phase'
    default:
      return 'Unavailable'
  }
}

export function SettingsPage() {
  const { status, user } = useAuthSession()
  const isOnline = useOnlineStatus()
  const platformWorkspace = usePlatformWorkspace()
  const { data, error, isError, isLoading, refetch } = useSettingsWorkspace(user?.uid)
  const updateNotificationPreference = useUpdateNotificationPreference()
  const requestNotificationPermission = useRequestNotificationPermission()
  const createManualBackup = useCreateManualBackup(user)
  const loadServerRestoreStage = useLoadServerRestoreStage(user?.uid)
  const invokePlatformOperation = useInvokePlatformOperation()
  const connectCalendarRead = useConnectCalendarRead()
  const connectCalendarWrite = useConnectCalendarWrite()
  const disconnectCalendar = useDisconnectCalendar()
  const refreshCalendarCache = useRefreshCalendarCache()
  const refreshCloudWorkspace = useRefreshCloudWorkspace(user?.uid)
  const syncCalendarMirrors = useSyncCalendarMirrors()
  const applyRestoreStage = useApplyRestoreStage()
  const restoreInputRef = useRef<HTMLInputElement | null>(null)
  const [restoreStage, setRestoreStage] = useState<RestoreStage | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [backupNotice, setBackupNotice] = useState<string | null>(null)
  const [cloudRefreshNotice, setCloudRefreshNotice] = useState<string | null>(null)
  const authenticatedOffline = status === 'authenticated' && !isOnline

  if (isLoading || !data) {
    if (isError) {
      return (
        <SurfaceCard title="Settings could not load" description={getWorkspaceErrorMessage(error)}>
          <Stack spacing={2} alignItems="flex-start">
            <Alert severity="warning">Reconnect or retry when Firestore is reachable.</Alert>
            <Button variant="contained" onClick={() => void refetch()}>
              Retry
            </Button>
          </Stack>
        </SurfaceCard>
      )
    }

    return (
      <SurfaceCard title="Loading settings" description="Restoring local settings.">
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
          ? 'Refreshing events...'
          : disconnectCalendar.isPending
            ? 'Disconnecting Calendar...'
            : syncCalendarMirrors.isPending
              ? 'Syncing major blocks...'
              : null
  const todayKey = new Date().toISOString().slice(0, 10)
  const notificationCounters = notificationState.countersByDate[todayKey]

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
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at top right, rgba(212, 111, 60, 0.11), transparent 30%), linear-gradient(180deg, rgba(20, 25, 36, 0.98) 0%, rgba(11, 15, 23, 0.98) 100%)',
        }}
      >
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack spacing={0.75} maxWidth={680}>
              <Typography
                variant="overline"
                color="primary.light"
                sx={{ fontSize: '0.66rem', letterSpacing: '0.2em' }}
              >
                Settings
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.85rem', md: '3rem' },
                  lineHeight: 0.98,
                  letterSpacing: '-0.05em',
                }}
              >
                Keep Forge recoverable.
              </Typography>
              <Typography color="text.secondary">
                Manage sync, backup, calendar, and notifications.
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Chip
                label={operationalDiagnostics.overallSeverity === 'healthy' ? 'Healthy' : 'Review needed'}
                size="small"
                variant="outlined"
                color={getOperationalTone(operationalDiagnostics.overallSeverity)}
              />
              <Chip
                label={platformWorkspace.shellLabel}
                size="small"
                variant="outlined"
                color={getShellTone(platformWorkspace)}
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            }}
          >
            <SettingsMetric
              label="Account"
              value={status}
              detail={user?.email ?? user?.displayName ?? 'Local workspace'}
            />
            <SettingsMetric
              label="Backup"
              value={backupOperations.healthState}
              detail={
                backupOperations.latestSuccessfulBackupAt
                  ? `Last ${formatCalendarTimestamp(backupOperations.latestSuccessfulBackupAt, backupOperations.latestSuccessfulBackupAt)}`
                  : 'No successful backup yet'
              }
            />
            <SettingsMetric
              label="Calendar"
              value={calendarConnection.connectionStatus}
              detail={`Read ${calendarSyncState.externalEventSyncStatus}`}
            />
            <SettingsMetric
              label="Notifications"
              value={notificationState.permission}
              detail={(settings?.notificationsEnabled ?? true) ? 'Rules enabled' : 'Rules paused'}
            />
          </Box>
        </Stack>
      </SurfaceCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.12fr) minmax(340px, 0.88fr)' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5}>
          <SurfaceCard
            eyebrow="Backup"
            title="Backup & restore"
            description="Export data or apply a staged restore."
            action={
              <Chip
                label={recentBackups[0]?.status ?? 'No backups yet'}
                size="small"
                variant="outlined"
                color={getBackupTone(backupOperations.healthState)}
              />
            }
          >
            <Stack spacing={1.5}>
              <SettingsSubsection title="Actions">
                <Stack spacing={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
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
                  </Stack>
                  <input
                    ref={restoreInputRef}
                    type="file"
                    accept="application/json,.json"
                    hidden
                    onChange={handleRestoreFileSelected}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Restore stays staged until you apply it.
                  </Typography>
                </Stack>
              </SettingsSubsection>

              <SettingsSubsection title="Restore stage">
                <Stack spacing={1}>
                  <SettingsStatusRow
                    label="Source"
                    summary={restoreStage ? restoreStage.source.label : 'No restore staged yet.'}
                    meta={
                      recentRestoreJobs.length === 0
                        ? 'No recent restore jobs.'
                        : recentRestoreJobs.map((job) => `${job.status} (${job.createdAt.slice(0, 10)})`).join(' · ')
                    }
                  />
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
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Apply staged restore
                  </Button>
                </Stack>
              </SettingsSubsection>

              {backupOperations.latestFailureMessage ? (
                <Alert severity="warning" variant="outlined">
                  Backup issue: {backupOperations.latestFailureMessage}
                </Alert>
              ) : null}
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Calendar"
            title="Calendar access"
            description="Read events and mirror major blocks."
            action={
              <Chip
                label={`${calendarSyncState.externalEventSyncStatus} read`}
                size="small"
                variant="outlined"
                color={calendarTone}
              />
            }
          >
            <Stack spacing={1.5}>
              <SettingsStatusRow
                label="Connection"
                summary={`${calendarConnection.connectionStatus} · ${calendarConnection.featureGate}`}
                meta={`Cached events ${calendarSyncState.cachedEventCount}`}
                trailing={
                  <Chip
                    label={calendarConnection.connectionStatus}
                    size="small"
                    variant="outlined"
                    color={calendarConnection.connectionStatus === 'connected' ? 'success' : 'default'}
                  />
                }
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={connectCalendarRead.isPending ? <CircularProgress size={16} color="inherit" /> : <CalendarMonthRoundedIcon />}
                  onClick={() => connectCalendarRead.mutate()}
                  disabled={Boolean(calendarActionPendingLabel) || status !== 'authenticated'}
                >
                  {connectCalendarRead.isPending
                    ? 'Connecting...'
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
                    ? 'Enabling...'
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
                  {refreshCalendarCache.isPending ? 'Refreshing...' : 'Refresh read cache'}
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
                  {syncCalendarMirrors.isPending ? 'Syncing...' : 'Sync major blocks'}
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
              <CalendarErrorStack
                connectCalendarRead={connectCalendarRead}
                connectCalendarWrite={connectCalendarWrite}
                refreshCalendarCache={refreshCalendarCache}
                syncCalendarMirrors={syncCalendarMirrors}
                disconnectCalendar={disconnectCalendar}
              />
            </Stack>
          </SurfaceCard>
        </Stack>

        <Stack spacing={2.5}>
          <SurfaceCard
            eyebrow="Sync"
            title="Account & cloud"
            description="Keep this browser aligned with shared state."
            action={<Chip label={status} size="small" variant="outlined" color={status === 'authenticated' ? 'success' : 'default'} />}
          >
            <Stack spacing={1.5}>
              <SettingsStatusRow
                label="Signed in"
                summary={user?.email ?? user?.displayName ?? 'Local workspace'}
                meta={`${platformWorkspace.shellSupportLabel} · ${platformWorkspace.installSurfaceLabel}`}
                trailing={<Chip label={platformWorkspace.shellLabel} size="small" variant="outlined" color={getShellTone(platformWorkspace)} />}
              />
              <Button
                variant="contained"
                onClick={() =>
                  refreshCloudWorkspace.mutate(undefined, {
                    onSuccess: (result) => {
                      setCloudRefreshNotice(
                        `Cloud refresh complete. Settings ${result.hydratedSettings ? 'updated' : 'unchanged'} · ${result.hydratedDayInstances} day instance${result.hydratedDayInstances === 1 ? '' : 's'} hydrated.`,
                      )
                    },
                  })
                }
                disabled={refreshCloudWorkspace.isPending || status !== 'authenticated' || authenticatedOffline}
                sx={{ alignSelf: 'flex-start' }}
              >
                {refreshCloudWorkspace.isPending ? 'Refreshing...' : 'Refresh from cloud'}
              </Button>
              {cloudRefreshNotice ? (
                <Alert severity="success" variant="outlined" aria-live="polite">
                  {cloudRefreshNotice}
                </Alert>
              ) : null}
              {authenticatedOffline ? (
                <Alert severity="info" variant="outlined" aria-live="polite">
                  Reconnect to refresh or save cloud changes.
                </Alert>
              ) : null}
              {refreshCloudWorkspace.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {refreshCloudWorkspace.error instanceof Error
                    ? refreshCloudWorkspace.error.message
                    : 'Forge could not refresh shared cloud state.'}
                </Alert>
              ) : null}
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Notifications"
            title="Notification controls"
            description="Browser permission and daily delivery limits."
            action={
              <Chip
                label={notificationState.permission}
                size="small"
                variant="outlined"
                color={notificationState.permission === 'granted' ? 'success' : notificationState.permission === 'denied' ? 'warning' : 'default'}
              />
            }
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Stack spacing={0.25}>
                  <Typography variant="body2" color="text.primary">
                    Notification rules
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily cap {notificationState.dailyCap} · {notificationState.supportedChannels.join(', ')}
                  </Typography>
                </Stack>
                <Switch
                  checked={settings?.notificationsEnabled ?? true}
                  onChange={(_, checked) => updateNotificationPreference.mutate(checked)}
                  disabled={updateNotificationPreference.isPending || updateNotificationPreference.isCloudWriteUnavailable}
                  inputProps={{
                    'aria-label': 'Enable notifications',
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Delivered {notificationCounters?.delivered ?? 0} · Suppressed {notificationCounters?.suppressed ?? 0}
              </Typography>
              <Button
                variant="contained"
                startIcon={<NotificationsActiveRoundedIcon />}
                onClick={() => requestNotificationPermission.mutate()}
                disabled={requestNotificationPermission.isPending || notificationState.permission === 'granted'}
                sx={{ alignSelf: 'flex-start' }}
              >
                {notificationState.permission === 'granted' ? 'Permission granted' : 'Request browser permission'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Recent: {recentNotificationLogs.length === 0 ? 'None yet.' : recentNotificationLogs.slice(0, 2).map((log) => `${log.ruleKey} (${log.status})`).join(' · ')}
              </Typography>
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Integrations"
            title="Provider status"
            description="Connected services and planned integrations."
            action={<MonitorHeartRoundedIcon color="primary" />}
          >
            <Stack spacing={1.25}>
              <SettingsStatusRow
                label="Health providers"
                summary={healthIntegration.statusSummaryLabel}
                meta={`Signals ${healthIntegration.availableSignalCount}/${healthIntegration.totalSignalCount}`}
                trailing={<Chip label={healthIntegration.connectionSummary} size="small" variant="outlined" color="default" />}
              />
              <SettingsStatusRow
                label="Runtime"
                summary={platformWorkspace.summary}
                trailing={<Chip label={platformWorkspace.shellLabel} size="small" variant="outlined" color={getShellTone(platformWorkspace)} />}
              />
            </Stack>
          </SurfaceCard>
        </Stack>
      </Box>

      <SurfaceCard
        eyebrow="Advanced"
        title="Status details"
        description="Details stay available when needed."
      >
        <Stack spacing={1.5}>
          <AdvancedDisclosure title="Health details" summary={operationalDiagnostics.headline}>
            <Stack spacing={1}>
              {operationalDiagnostics.items.map((item) => (
                <SettingsStatusRow
                  key={item.key}
                  label={item.label}
                  summary={item.summary}
                  meta={`${item.owner}${item.lastObservedAt ? ` · ${formatCalendarTimestamp(item.lastObservedAt, 'Not observed yet')}` : ''}`}
                  trailing={
                    <Chip
                      label={item.statusLabel}
                      size="small"
                      variant="outlined"
                      color={getOperationalTone(item.severity)}
                    />
                  }
                />
              ))}
              {operationalDiagnostics.blindSpots.map((blindSpot) => (
                <Alert key={blindSpot} severity="info" variant="outlined">
                  {blindSpot}
                </Alert>
              ))}
            </Stack>
          </AdvancedDisclosure>

          <AdvancedDisclosure title="Backup details" summary={`${serverRestoreReadyCount} restore-ready backup${serverRestoreReadyCount === 1 ? '' : 's'}`}>
            <Stack spacing={1}>
              <SettingsStatusRow
                label="Retention"
                summary={`Daily ${backupOperations.retentionPolicy.keepDaily} · Weekly ${backupOperations.retentionPolicy.keepWeekly} · Manual ${backupOperations.retentionPolicy.keepManual}`}
                meta={
                  recentBackups[0]
                    ? `Latest ${formatCalendarTimestamp(recentBackups[0].createdAt, recentBackups[0].createdAt)} · ${recentBackups[0].sourceRecordCount} records`
                    : 'No recent backup record'
                }
              />
              <SettingsStatusRow
                label="Backup source"
                summary={`Health ${backupSource.operations} · list ${backupSource.recentBackups}`}
                meta={backupSource.operations !== backupSource.recentBackups ? 'Sources differ because local and remote backup views are tracked separately.' : undefined}
              />
              {eligibleServerBackups.length > 0 ? (
                eligibleServerBackups.map((backup) => (
                  <SettingsStatusRow
                    key={backup.id}
                    label={`Scheduled backup · ${formatCalendarTimestamp(backup.createdAt, backup.createdAt)}`}
                    summary={`${backup.status} · ${backup.sourceRecordCount} records`}
                    meta={`Payload ${backup.payloadPointer?.provider ?? 'legacy metadata'} · eligibility ${backup.restoreEligibility?.status ?? 'unknown'}`}
                    trailing={
                      <Button
                        variant="outlined"
                        size="small"
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
                        {loadServerRestoreStage.isPending ? 'Loading...' : 'Stage restore'}
                      </Button>
                    }
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No restore-ready scheduled backups yet.
                </Typography>
              )}
              {ineligibleServerBackups.length > 0 ? (
                <Alert severity="info" variant="outlined">
                  Not restore-ready yet: {ineligibleServerBackups
                    .map((backup) => `${backup.id} (${backup.restoreEligibility?.status ?? 'unknown'})`)
                    .join(' · ')}
                </Alert>
              ) : null}
            </Stack>
          </AdvancedDisclosure>

          <AdvancedDisclosure title="Calendar details" summary={`Mirror ${calendarSyncState.mirrorSyncStatus}`}>
            <Stack spacing={1}>
              <SettingsStatusRow
                label="Read sync"
                summary={`Last external sync ${formatCalendarTimestamp(calendarSyncState.lastExternalSyncAt)}`}
                meta={`Cached events ${calendarSyncState.cachedEventCount}`}
              />
              <SettingsStatusRow
                label="Mirror sync"
                summary={`Last mirror sync ${formatCalendarTimestamp(calendarSyncState.lastMirrorSyncAt)}`}
                meta={`Mirrored blocks ${calendarMirroredBlockCount} · errors ${calendarMirrorErrorCount}`}
              />
              <Typography variant="body2" color="text.secondary">
                Calendar: {calendarConnection.selectedCalendarIds[0] ?? 'primary'} · Mirror title: {mirroredBlockPreview.eventTitle}
              </Typography>
              {calendarSyncState.lastSyncError ? (
                <Alert severity="warning" variant="outlined" aria-live="polite">
                  Calendar issue: {calendarSyncState.lastSyncError}
                </Alert>
              ) : null}
              {calendarSyncState.lastMirrorSyncError ? (
                <Alert severity="warning" variant="outlined" aria-live="polite">
                  Last mirror issue: {calendarSyncState.lastMirrorSyncError}
                </Alert>
              ) : null}
              {syncCalendarMirrors.data ? (
                <Alert severity={syncCalendarMirrors.data.errorCount > 0 ? 'warning' : 'success'} variant="outlined" aria-live="polite">
                  Mirror sync result: {syncCalendarMirrors.data.createdCount} created, {syncCalendarMirrors.data.updatedCount} updated, {syncCalendarMirrors.data.deletedCount} deleted, {syncCalendarMirrors.data.errorCount} failed.
                </Alert>
              ) : null}
            </Stack>
          </AdvancedDisclosure>

          <AdvancedDisclosure title="Runtime details" summary={platformWorkspace.shellLabel}>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Update needed: {platformWorkspace.needRefresh ? 'Yes' : 'No'} · Offline ready: {platformWorkspace.offlineReady ? 'Yes' : 'No'}
              </Typography>
              {platformWorkspace.capabilities.map((capability) => (
                <SettingsStatusRow
                  key={capability.key}
                  label={capability.label}
                  summary={capability.summary}
                  trailing={
                    <Chip
                      label={capability.status}
                      size="small"
                      variant="outlined"
                      color={getCapabilityTone(capability.status)}
                    />
                  }
                />
              ))}
              {platformWorkspace.supportNotes.map((note) => (
                <Alert key={note} severity="info" variant="outlined">
                  {note}
                </Alert>
              ))}
            </Stack>
          </AdvancedDisclosure>

          <AdvancedDisclosure title="Background jobs" summary={`${platformServices.functionsOwned.length} managed job${platformServices.functionsOwned.length === 1 ? '' : 's'}`}>
            <Stack spacing={1}>
              {platformServices.boundaries.map((boundary) => (
                <SettingsStatusRow
                  key={boundary.key}
                  label={boundary.label}
                  summary={boundary.description}
                  meta={boundary.rationale}
                  trailing={
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                      <Chip
                        label={boundary.owner === 'firebaseFunctions' ? 'Firebase' : boundary.owner}
                        size="small"
                        variant="outlined"
                        color={boundary.owner === 'firebaseFunctions' ? 'primary' : 'default'}
                      />
                      <Chip
                        label={boundary.status}
                        size="small"
                        variant="outlined"
                        color={boundary.status === 'active' ? 'success' : 'default'}
                      />
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
                  }
                />
              ))}
              {invokePlatformOperation.isError ? (
                <Alert severity="error" variant="outlined" aria-live="polite">
                  {invokePlatformOperation.error instanceof Error
                    ? invokePlatformOperation.error.message
                    : 'Forge could not run the selected platform operation.'}
                </Alert>
              ) : null}
              {invokePlatformOperation.data ? (
                <Alert severity="success" variant="outlined" aria-live="polite">
                  Ran {invokePlatformOperation.data.callableName} for {invokePlatformOperation.data.key}.
                </Alert>
              ) : null}
            </Stack>
          </AdvancedDisclosure>

          <AdvancedDisclosure title="Provider roadmap" summary={healthIntegration.connectionSummary}>
            <Stack spacing={1}>
              {healthIntegration.providers.map((provider) => (
                <SettingsStatusRow
                  key={provider.provider}
                  label={provider.displayName}
                  summary={getProviderSupportSummary(provider.unavailableReason)}
                  trailing={<Chip label={getProviderSupportSummary(provider.unavailableReason)} size="small" variant="outlined" color="default" />}
                />
              ))}
              <Typography variant="body2" color="text.secondary">
                Collision-aware recommendations: {featureFlags.collisionAwareRecommendations ? 'Enabled' : 'Off'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Read mirror: {featureFlags.readMirror} · Write mirror: {featureFlags.writeMirror}
              </Typography>
              <Alert severity="info" variant="outlined">
                Future provider work stays visible here without claiming live connectivity.
              </Alert>
            </Stack>
          </AdvancedDisclosure>
        </Stack>
      </SurfaceCard>
    </Stack>
  )
}

function getWorkspaceErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Forge could not load this workspace.'
}

function CalendarErrorStack({
  connectCalendarRead,
  connectCalendarWrite,
  refreshCalendarCache,
  syncCalendarMirrors,
  disconnectCalendar,
}: {
  connectCalendarRead: { isError: boolean; error: unknown }
  connectCalendarWrite: { isError: boolean; error: unknown }
  refreshCalendarCache: { isError: boolean; error: unknown }
  syncCalendarMirrors: { isError: boolean; error: unknown }
  disconnectCalendar: { isError: boolean; error: unknown }
}) {
  return (
    <>
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
          {syncCalendarMirrors.error instanceof Error ? syncCalendarMirrors.error.message : 'Forge could not sync Calendar blocks.'}
        </Alert>
      ) : null}
      {disconnectCalendar.isError ? (
        <Alert severity="error" variant="outlined" aria-live="polite">
          {disconnectCalendar.error instanceof Error ? disconnectCalendar.error.message : 'Forge could not disconnect Google Calendar.'}
        </Alert>
      ) : null}
    </>
  )
}

function SettingsMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Stack
      spacing={0.5}
      sx={{
        minHeight: { xs: 76, sm: 96, md: 112 },
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.12),
        borderRadius: 4,
        p: { xs: 1.25, md: 1.75 },
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.16),
      }}
    >
      <Typography variant="overline" color="primary.light">
        {label}
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: '1.05rem', md: '1.45rem' } }}>
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: 'none', sm: 'block' }, mt: 'auto', overflowWrap: 'anywhere' }}
      >
        {detail}
      </Typography>
    </Stack>
  )
}

function SettingsSubsection({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.1),
        borderRadius: 4,
        p: 1.5,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.14),
      }}
    >
      <Stack spacing={1.2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography variant="overline" color="primary.light">
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </Stack>
    </Box>
  )
}

function AdvancedDisclosure({
  title,
  summary,
  children,
}: {
  title: string
  summary: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.1),
        borderRadius: 4,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.1),
        overflow: 'hidden',
      }}
    >
      <Button
        type="button"
        color="inherit"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={`settings-advanced-${slugify(title)}`}
        endIcon={
          <ExpandMoreRoundedIcon
            sx={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 160ms ease',
            }}
          />
        }
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          textAlign: 'left',
          p: 1.5,
          borderRadius: 0,
        }}
      >
        <Stack spacing={0.25} alignItems="flex-start">
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {summary}
          </Typography>
        </Stack>
      </Button>
      <Collapse in={open} unmountOnExit>
        <Box id={`settings-advanced-${slugify(title)}`} sx={{ px: 1.5, pb: 1.5 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}

function SettingsStatusRow({
  label,
  summary,
  meta,
  trailing,
}: {
  label: string
  summary: string
  meta?: string
  trailing?: ReactNode
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
    >
      <Stack spacing={0.2} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" color="text.primary">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {summary}
        </Typography>
        {meta ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {meta}
          </Typography>
        ) : null}
      </Stack>
      {trailing ? <Box sx={{ flexShrink: 0 }}>{trailing}</Box> : null}
    </Stack>
  )
}

function getBackupTone(healthState: string) {
  if (healthState === 'healthy') {
    return 'success' as const
  }

  if (healthState === 'stale' || healthState === 'degraded') {
    return 'warning' as const
  }

  return 'default' as const
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
