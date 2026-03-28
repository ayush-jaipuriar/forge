import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Chip } from '@mui/material'
import type { SyncStatus } from '@/domain/common/types'

type SyncIndicatorProps = {
  status: SyncStatus
}

const statusMap = {
  stable: {
    label: 'Synced',
    color: 'success' as const,
    icon: <CloudDoneRoundedIcon fontSize="small" />,
  },
  syncing: {
    label: 'Syncing',
    color: 'warning' as const,
    icon: <SyncRoundedIcon fontSize="small" />,
  },
  queued: {
    label: 'Queued to Sync',
    color: 'default' as const,
    icon: <CloudUploadRoundedIcon fontSize="small" />,
  },
  stale: {
    label: 'Sync Stale',
    color: 'warning' as const,
    icon: <WarningAmberRoundedIcon fontSize="small" />,
  },
  conflicted: {
    label: 'Sync Conflict',
    color: 'error' as const,
    icon: <ErrorOutlineRoundedIcon fontSize="small" />,
  },
  degraded: {
    label: 'Sync Degraded',
    color: 'error' as const,
    icon: <WarningAmberRoundedIcon fontSize="small" />,
  },
}

export function SyncIndicator({ status }: SyncIndicatorProps) {
  const config = statusMap[status]

  return <Chip icon={config.icon} label={config.label} color={config.color} size="small" variant="outlined" />
}
