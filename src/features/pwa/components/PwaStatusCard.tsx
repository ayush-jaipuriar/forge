import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import SystemUpdateAltRoundedIcon from '@mui/icons-material/SystemUpdateAltRounded'
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded'
import type { SyncStatus } from '@/domain/common/types'
import { Button, Chip, Stack, Typography } from '@mui/material'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { getConnectivityStatusModel } from '@/features/pwa/pwaStatus'

type PwaStatusCardProps = {
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
              Installing the app keeps the execution surface one tap away and gives the cached shell a more native-feeling entry point.
            </Typography>
          </Stack>
        ) : null}

        {needRefresh ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Button variant="contained" color="warning" startIcon={<SystemUpdateAltRoundedIcon />} onClick={() => void onApplyUpdate()}>
              Apply update
            </Button>
            <Typography variant="body2" color="text.secondary">
              A newer cached version of Forge is ready. Applying it now refreshes the shell and activates the latest service worker.
            </Typography>
          </Stack>
        ) : null}

        {offlineReady ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Button variant="outlined" color="inherit" onClick={onDismissOfflineReady}>
              Dismiss
            </Button>
            <Typography variant="body2" color="text.secondary">
              The shell is cached for offline use. This does not guarantee fresh remote data, but it does keep the primary execution UI recoverable.
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
