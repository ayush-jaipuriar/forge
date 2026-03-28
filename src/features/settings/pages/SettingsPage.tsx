import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
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
import { useCreateManualBackup } from '@/features/settings/hooks/useCreateManualBackup'
import { useRequestNotificationPermission } from '@/features/settings/hooks/useRequestNotificationPermission'
import { useSettingsWorkspace } from '@/features/settings/hooks/useSettingsWorkspace'
import { useUpdateNotificationPreference } from '@/features/settings/hooks/useUpdateNotificationPreference'
import { parseRestorePayloadText, type RestoreStage } from '@/services/backup/restoreService'

export function SettingsPage() {
  const { status, user } = useAuthSession()
  const { canInstall, isInstalled, isOnline, needRefresh, offlineReady } = usePwaState()
  const { data, isLoading } = useSettingsWorkspace()
  const updateNotificationPreference = useUpdateNotificationPreference()
  const requestNotificationPermission = useRequestNotificationPermission()
  const createManualBackup = useCreateManualBackup(user)
  const applyRestoreStage = useApplyRestoreStage()
  const restoreInputRef = useRef<HTMLInputElement | null>(null)
  const [restoreStage, setRestoreStage] = useState<RestoreStage | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading integration workspace" description="Forge is restoring local settings and future integration scaffolding.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const { calendarConnection, featureFlags, mirroredBlockPreview, notificationState, recentBackups, recentNotificationLogs, recentRestoreJobs, settings } = data

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
    } catch (error) {
      setRestoreStage(null)
      setRestoreError(error instanceof Error ? error.message : 'Forge could not parse the selected backup file.')
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
            description="Phase 3 backup work starts with deterministic local exports and partial-safe restores before scheduled backup jobs arrive."
            action={
              <Chip
                label={recentBackups[0]?.status ?? 'No backups yet'}
                size="small"
                variant="outlined"
                color={recentBackups[0]?.status === 'ready' ? 'success' : 'default'}
              />
            }
          >
            <Stack spacing={1.25}>
              <Typography variant="body2" color="text.secondary">
                Latest manual backup: {recentBackups[0] ? `${recentBackups[0].createdAt} · ${recentBackups[0].sourceRecordCount} records` : 'None yet.'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={() => createManualBackup.mutate({ kind: 'json' })}
                  disabled={createManualBackup.isPending}
                >
                  Export backup JSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArchiveRoundedIcon />}
                  onClick={() => createManualBackup.mutate({ kind: 'notes' })}
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
                <Alert severity="error" variant="outlined">
                  {restoreError}
                </Alert>
              ) : null}
              {restoreStage ? (
                <Alert severity="info" variant="outlined">
                  {restoreStage.summary}
                  {restoreStage.warnings.length > 0 ? ` Warnings: ${restoreStage.warnings.join(' ')}` : ''}
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<RestoreRoundedIcon />}
                  onClick={() => restoreStage && applyRestoreStage.mutate(restoreStage)}
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
            eyebrow="Calendar Scaffolding"
            title="Google Calendar future boundary"
            description="Phase 1 keeps this integration deliberately disabled while still giving the codebase a real typed seam for future event mirroring and collision-aware recommendations."
            action={
              <Chip
                label={calendarConnection.connectionStatus}
                size="small"
                variant="outlined"
                color={calendarConnection.connectionStatus === 'connected' ? 'success' : 'default'}
              />
            }
          >
            <Stack spacing={0.75}>
              <Typography variant="body2" color="text.secondary">
                Provider: {calendarConnection.provider}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Feature gate: {calendarConnection.featureGate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Managed event mode: {calendarConnection.managedEventMode}
              </Typography>
              <Typography variant="body2" color="primary.light">
                Future mirrored title convention: {mirroredBlockPreview.eventTitle}
              </Typography>
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
            </Stack>
          </SurfaceCard>
        </Grid>
      </Grid>
      <Alert severity="info" variant="outlined">
        Notifications now have a real local rule, permission, and logging foundation. Backup and restore now provide a deterministic local safety layer. Calendar scaffolding is still architecture-only until the later Phase 3 milestones.
      </Alert>
      <EmptyState
        icon={<SettingsSuggestRoundedIcon color="primary" />}
        title="Integration controls will land here."
        description="Empty and placeholder states now use a deliberate pattern instead of ad hoc text blocks, so unfinished areas can still feel intentional."
      />
    </Stack>
  )
}
