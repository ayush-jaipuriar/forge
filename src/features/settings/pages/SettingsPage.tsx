import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import { Alert, Box, Button, Chip, CircularProgress, Stack, Switch, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
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
          <SectionHeader
            eyebrow="Settings"
            title="Control the runtime, recovery, and integrations."
            description="Runtime, recovery, calendar, notifications, and provider seams."
            action={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Chip
                  label={operationalDiagnostics.headline}
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
            }
          />

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
            }}
          >
            <SettingsMetric
              label="Launch posture"
              value={operationalDiagnostics.headline}
              detail={operationalDiagnostics.summary}
            />
            <SettingsMetric
              label="Backup health"
              value={backupOperations.healthState}
              detail={backupOperations.latestSuccessfulBackupAt ? `Last success ${formatCalendarTimestamp(backupOperations.latestSuccessfulBackupAt, backupOperations.latestSuccessfulBackupAt)}` : 'No successful scheduled backup yet'}
            />
            <SettingsMetric
              label="Calendar"
              value={`${calendarConnection.connectionStatus}`}
              detail={`Read ${calendarSyncState.externalEventSyncStatus} · mirror ${calendarSyncState.mirrorSyncStatus}`}
            />
            <SettingsMetric
              label="Restore-ready"
              value={`${serverRestoreReadyCount}`}
              detail={
                latestServerRestoreReadyBackup
                  ? `Latest ${formatCalendarTimestamp(latestServerRestoreReadyBackup.createdAt, latestServerRestoreReadyBackup.createdAt)}`
                  : 'No remote restore staged yet'
              }
            />
          </Box>
        </Stack>
      </SurfaceCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.12fr) minmax(320px, 0.88fr)' },
          alignItems: 'start',
        }}
      >
        <SurfaceCard
          eyebrow="Recovery & Protection"
          title="Backup posture and controlled restore"
          description="Exports, staged restore, and restore truth."
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
          <Stack spacing={1.5}>
            <SettingsSubsection title="Backup posture">
              <Stack spacing={0.85}>
                <SettingsStatusRow
                  label="Scheduled backup health"
                  summary={`Ops ${backupSource.operations} · list ${backupSource.recentBackups}`}
                  meta={`Last success ${backupOperations.latestSuccessfulBackupAt ?? 'None yet'}`}
                  trailing={
                    <Chip
                      label={backupOperations.healthState}
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
                />
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
                  label="Server restore posture"
                  summary={`${serverRestoreReadyCount} restore-ready backup${serverRestoreReadyCount === 1 ? '' : 's'}`}
                  meta={
                    latestServerRestoreReadyBackup
                      ? `Latest ${formatCalendarTimestamp(latestServerRestoreReadyBackup.createdAt, latestServerRestoreReadyBackup.createdAt)}`
                      : 'Local-file restore only'
                  }
                />
                {backupOperations.latestFailureMessage ? (
                  <Alert severity="warning" variant="outlined">
                    Latest scheduled-backup issue: {backupOperations.latestFailureMessage}
                  </Alert>
                ) : null}
              </Stack>
            </SettingsSubsection>

            <SettingsSubsection title="Export controls">
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

            <SettingsSubsection title="Scheduled recovery candidates">
              <Stack spacing={1}>
                {eligibleServerBackups.length > 0 ? (
                  eligibleServerBackups.map((backup) => (
                    <SettingsStatusRow
                      key={backup.id}
                      label={`Scheduled backup · ${formatCalendarTimestamp(backup.createdAt, backup.createdAt)}`}
                      summary={`Status ${backup.status} · ${backup.sourceRecordCount} records`}
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
            </SettingsSubsection>

            <SettingsSubsection title="Restore stage">
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Source: {restoreStage ? restoreStage.source.label : 'No restore staged yet.'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recent jobs: {recentRestoreJobs.length === 0 ? 'None yet.' : recentRestoreJobs.map((job) => `${job.status} (${job.createdAt.slice(0, 10)})`).join(' · ')}
                </Typography>
                {backupSource.operations !== backupSource.recentBackups ? (
                  <Alert severity="info" variant="outlined">
                    Backup health is using {backupSource.operations}, while the recent list is using {backupSource.recentBackups}.
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
          </Stack>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="System Posture"
          title="What is healthy, degraded, or still limited"
          description="Runtime truth and capability boundaries."
          action={
            <Chip
              label={operationalDiagnostics.headline}
              size="small"
              variant="outlined"
              color={getOperationalTone(operationalDiagnostics.overallSeverity)}
            />
          }
        >
          <Stack spacing={1.5}>
            <Alert severity={getOperationalTone(operationalDiagnostics.overallSeverity)} variant="outlined">
              {operationalDiagnostics.summary}
            </Alert>

            <SettingsSubsection title="Operational diagnostics">
              <Stack spacing={0.85}>
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
            </SettingsSubsection>

            <SettingsSubsection title="Auth and runtime">
              <Stack spacing={0.85}>
                <SettingsStatusRow
                  label="Firebase auth"
                  summary={`Current auth state ${status}`}
                  meta="Gate for sync and provider work."
                  trailing={<Chip label={status} size="small" variant="outlined" color={status === 'authenticated' ? 'success' : 'default'} />}
                />
                <SettingsStatusRow
                  label="Runtime shell"
                  summary={platformWorkspace.summary}
                  meta={`Tier ${platformWorkspace.shellSupportLabel} · Install ${platformWorkspace.installSurfaceLabel}`}
                  trailing={<Chip label={platformWorkspace.shellLabel} size="small" variant="outlined" color={getShellTone(platformWorkspace)} />}
                />
                <Typography variant="body2" color="text.secondary">
                  Update needed: {platformWorkspace.needRefresh ? 'Yes' : 'No'} · Offline ready: {platformWorkspace.offlineReady ? 'Yes' : 'No'}
                </Typography>
              </Stack>
            </SettingsSubsection>

            <SettingsSubsection title="Capability boundary">
              <Stack spacing={0.85}>
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
            </SettingsSubsection>
          </Stack>
        </SurfaceCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'start',
        }}
      >
        <SurfaceCard
          eyebrow="Calendar Operations"
          title="Read pressure and explicit write mirroring"
          description="Read pressure stays continuous. Write mirroring stays explicit."
          action={
            <Chip
              label={`read ${calendarSyncState.externalEventSyncStatus} · mirror ${calendarSyncState.mirrorSyncStatus}`}
              size="small"
              variant="outlined"
              color={calendarTone}
            />
          }
        >
          <Stack spacing={1.5}>
            <SettingsSubsection title="Connection posture">
              <Stack spacing={0.85}>
                <SettingsStatusRow
                  label="Provider"
                  summary={`${calendarConnection.provider} · gate ${calendarConnection.featureGate}`}
                  meta={`Mode ${calendarConnection.managedEventMode}`}
                  trailing={
                    <Chip
                      label={calendarConnection.connectionStatus}
                      size="small"
                      variant="outlined"
                      color={calendarConnection.connectionStatus === 'connected' ? 'success' : 'default'}
                    />
                  }
                />
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
              </Stack>
            </SettingsSubsection>

            <SettingsSubsection title="Calendar actions">
              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
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
              </Stack>
            </SettingsSubsection>

            <SettingsSubsection title="Operational truth">
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Calendar: {calendarConnection.selectedCalendarIds[0] ?? 'primary'} · Mirror title: {mirroredBlockPreview.eventTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Read sync: {calendarSyncState.externalEventSyncStatus}. Mirror sync: {calendarSyncState.mirrorSyncStatus}.
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
              </Stack>
            </SettingsSubsection>
          </Stack>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Notification Engine"
          title="Browser-owned delivery and permission posture"
          description="Permission, delivery truth, and runtime limits."
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
            <SettingsSubsection title="Notification controls">
              <Stack spacing={1}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack spacing={0.25}>
                    <Typography variant="body2" color="text.primary">
                      Notification rules enabled
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily cap {notificationState.dailyCap} · Channels {notificationState.supportedChannels.join(', ')}
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
                  Permission {notificationState.permission} · Delivered {notificationState.countersByDate[new Date().toISOString().slice(0, 10)]?.delivered ?? 0} · Suppressed {notificationState.countersByDate[new Date().toISOString().slice(0, 10)]?.suppressed ?? 0}
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
            </SettingsSubsection>

            <SettingsSubsection title="Runtime note">
              <Stack spacing={1}>
                <Alert severity="info" variant="outlined">
                  Browser and installed-PWA delivery are the only supported channels today.
                </Alert>
              </Stack>
            </SettingsSubsection>
          </Stack>
        </SurfaceCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'start',
        }}
      >
        <SurfaceCard
          eyebrow="Platform Operations"
          title="Browser vs Functions ownership"
          description="What belongs to the browser vs Functions."
          action={
            <Chip
              label={`${platformServices.functionsOwned.length} Functions-owned`}
              size="small"
              variant="outlined"
              color="primary"
            />
          }
        >
          <Stack spacing={1.25}>
            {platformServices.boundaries.map((boundary) => (
              <SettingsStatusRow
                key={boundary.key}
                label={boundary.label}
                summary={boundary.description}
                trailing={
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Chip
                      label={boundary.owner}
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
                  : 'Forge could not run the selected Functions-backed platform operation.'}
              </Alert>
            ) : null}
            {invokePlatformOperation.data ? (
              <Alert severity="success" variant="outlined" aria-live="polite">
                Ran {invokePlatformOperation.data.callableName} through Firebase Functions for {invokePlatformOperation.data.key}.
              </Alert>
            ) : null}
            <Alert severity="info" variant="outlined">
              Planned Functions-owned areas stay documented only.
            </Alert>
          </Stack>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Health & Future Providers"
          title="Scaffolded integrations only"
          description="Provider seams stay visible without pretending anything is connected."
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
          <Stack spacing={1.5}>
            <SettingsSubsection title="Health integration">
              <Stack spacing={0.85}>
                <Typography variant="body2" color="text.secondary">
                  {healthIntegration.statusSummaryLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Signals: {healthIntegration.availableSignalCount} of {healthIntegration.totalSignalCount}
                </Typography>
                {healthIntegration.providers.map((provider) => (
                  <SettingsStatusRow
                    key={provider.provider}
                    label={provider.displayName}
                    summary={getProviderSupportSummary(provider.unavailableReason)}
                    trailing={<Chip label={getProviderSupportSummary(provider.unavailableReason)} size="small" variant="outlined" color="default" />}
                  />
                ))}
              </Stack>
            </SettingsSubsection>

            <SettingsSubsection title="Roadmap truth">
              <Stack spacing={0.85}>
                <Typography variant="body2" color="text.secondary">
                  Collision-aware recommendations: {featureFlags.collisionAwareRecommendations ? 'Enabled at the type boundary' : 'Off'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Read mirror: {featureFlags.readMirror} · Write mirror: {featureFlags.writeMirror}
                </Typography>
                <Alert severity="info" variant="outlined">
                  Health seams are typed and future-ready. No fake connectivity lives here.
                </Alert>
              </Stack>
            </SettingsSubsection>
          </Stack>
        </SurfaceCard>
      </Box>
    </Stack>
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
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.12),
        borderRadius: 4,
        p: 1.75,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.16),
      }}
    >
      <Typography variant="overline" color="primary.light">
        {label}
      </Typography>
      <Typography variant="h3">{value}</Typography>
      <Typography variant="body2" color="text.secondary">
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
      <Stack spacing={0.2} sx={{ flex: 1 }}>
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
