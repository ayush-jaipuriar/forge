import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded'
import { Alert, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { usePwaState } from '@/features/pwa/providers/usePwaState'
import { useSettingsWorkspace } from '@/features/settings/hooks/useSettingsWorkspace'

export function SettingsPage() {
  const { status } = useAuthSession()
  const { canInstall, isInstalled, isOnline, needRefresh, offlineReady } = usePwaState()
  const { data, isLoading } = useSettingsWorkspace()

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading integration workspace" description="Forge is restoring local settings and future integration scaffolding.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const { calendarConnection, featureFlags, mirroredBlockPreview } = data

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
        Calendar scaffolding is active at the architecture boundary, but no Google Calendar API read or write flow is enabled in Phase 1 yet.
      </Alert>
      <EmptyState
        icon={<SettingsSuggestRoundedIcon color="primary" />}
        title="Integration controls will land here."
        description="Empty and placeholder states now use a deliberate pattern instead of ad hoc text blocks, so unfinished areas can still feel intentional."
      />
    </Stack>
  )
}
