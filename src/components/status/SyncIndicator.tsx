import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import { Chip } from '@mui/material'

type SyncIndicatorProps = {
  status: 'stable' | 'syncing' | 'queued'
}

const statusMap = {
  stable: {
    label: 'Sync Stable',
    color: 'success' as const,
    icon: <CloudDoneRoundedIcon fontSize="small" />,
  },
  syncing: {
    label: 'Syncing',
    color: 'warning' as const,
    icon: <SyncRoundedIcon fontSize="small" />,
  },
  queued: {
    label: 'Queued Offline',
    color: 'default' as const,
    icon: <WifiOffRoundedIcon fontSize="small" />,
  },
}

export function SyncIndicator({ status }: SyncIndicatorProps) {
  const config = statusMap[status]

  return <Chip icon={config.icon} label={config.label} color={config.color} size="small" variant="outlined" />
}
