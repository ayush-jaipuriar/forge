import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import SystemUpdateAltRoundedIcon from '@mui/icons-material/SystemUpdateAltRounded'
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded'
import { alpha } from '@mui/material/styles'
import type { SyncStatus } from '@/domain/common/types'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { getConnectivityStatusModel } from '@/features/pwa/pwaStatus'

type PwaStatusCardProps = {
  variant?: 'card' | 'compact'
  isOnline: boolean
  syncStatus: SyncStatus
  canInstall: boolean
  isInstalled: boolean
  needRefresh: boolean
  offlineReady: boolean
  onInstall: () => Promise<void> | void
  onApplyUpdate: () => Promise<void> | void
  onDismissOfflineReady: () => void
}

export function PwaStatusCard({
  variant = 'card',
  isOnline,
  syncStatus,
  canInstall,
  isInstalled,
  needRefresh,
  offlineReady,
  onInstall,
  onApplyUpdate,
  onDismissOfflineReady,
}: PwaStatusCardProps) {
  const connectivity = getConnectivityStatusModel({ isOnline, syncStatus })

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          px: { xs: 1.25, md: 1.5 },
          py: 1.25,
          backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.5),
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={0.35} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="overline" color="primary.light">
                Shell Readiness
              </Typography>
              <Chip
                label={connectivity.eyebrow}
                color={connectivity.tone === 'warning' ? 'warning' : connectivity.tone === 'success' ? 'success' : 'default'}
                size="small"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {canInstall
                ? 'Install Forge for one-tap entry.'
                : 'Shell cached and acknowledged.'}
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            {canInstall ? (
              <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={() => void onInstall()}>
                Install Forge
              </Button>
            ) : null}
            {offlineReady ? (
              <Button variant="outlined" color="inherit" onClick={onDismissOfflineReady}>
                Dismiss
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Box>
    )
  }

  return (
    <SurfaceCard
      eyebrow="Platform Status"
      title={connectivity.title}
      description={connectivity.detail}
      action={<Chip label={connectivity.eyebrow} color={connectivity.tone === 'warning' ? 'warning' : connectivity.tone === 'success' ? 'success' : 'default'} size="small" />}
    >
      <Stack spacing={1.5}>
        {!isOnline ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Chip icon={<WifiOffRoundedIcon fontSize="small" />} label="Offline mode" color="warning" size="small" variant="outlined" />
            <Typography variant="body2" color="text.secondary">
              The shell and recent local data should stay available, but remote sync is paused until the browser reconnects.
            </Typography>
          </Stack>
        ) : null}

        {canInstall ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={() => void onInstall()}>
              Install Forge
            </Button>
            <Typography variant="body2" color="text.secondary">
              Install for one-tap entry and a stronger app-like launch surface.
            </Typography>
          </Stack>
        ) : null}

        {needRefresh ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Button variant="contained" color="warning" startIcon={<SystemUpdateAltRoundedIcon />} onClick={() => void onApplyUpdate()}>
              Apply update
            </Button>
            <Typography variant="body2" color="text.secondary">
              A newer shell is ready to activate.
            </Typography>
          </Stack>
        ) : null}

        {offlineReady ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Button variant="outlined" color="inherit" onClick={onDismissOfflineReady}>
              Dismiss
            </Button>
            <Typography variant="body2" color="text.secondary">
              The shell is cached for offline recovery.
            </Typography>
          </Stack>
        ) : null}

        {isInstalled && !canInstall && !needRefresh && isOnline ? (
          <Typography variant="body2" color="text.secondary">
            Forge is already installed in standalone mode on this device.
          </Typography>
        ) : null}
      </Stack>
    </SurfaceCard>
  )
}
