import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { SyncStatus } from '@/domain/common/types'
import { forgeTokens } from '@/app/theme/tokens'

type SyncIndicatorProps = {
  status: SyncStatus
  compact?: boolean
}

const statusMap = {
  stable: {
    label: 'Current',
    compactLabel: 'Current',
    color: 'success' as const,
    icon: <CloudDoneRoundedIcon fontSize="small" />,
  },
  syncing: {
    label: 'Updating',
    compactLabel: 'Updating',
    color: 'warning' as const,
    icon: <SyncRoundedIcon fontSize="small" />,
  },
  queued: {
    label: 'Local Changes',
    compactLabel: 'Pending',
    color: 'default' as const,
    icon: <CloudUploadRoundedIcon fontSize="small" />,
  },
  stale: {
    label: 'Refresh Needed',
    compactLabel: 'Refresh',
    color: 'warning' as const,
    icon: <WarningAmberRoundedIcon fontSize="small" />,
  },
  conflicted: {
    label: 'Conflict',
    compactLabel: 'Conflict',
    color: 'error' as const,
    icon: <ErrorOutlineRoundedIcon fontSize="small" />,
  },
  degraded: {
    label: 'Sync Issue',
    compactLabel: 'Issue',
    color: 'error' as const,
    icon: <WarningAmberRoundedIcon fontSize="small" />,
  },
}

export function SyncIndicator({ status, compact = false }: SyncIndicatorProps) {
  const config = statusMap[status]
  const palette = {
    default: forgeTokens.palette.text.secondary,
    success: forgeTokens.palette.accent.success,
    warning: forgeTokens.palette.accent.warning,
    error: forgeTokens.palette.accent.critical,
  }[config.color]

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: compact ? 24 : 26,
        px: compact ? 0.9 : 1,
        borderRadius: 2,
        color: palette,
        border: '1px solid',
        borderColor: alpha(palette, 0.2),
        backgroundColor: alpha(palette, 0.045),
      }}
    >
      <Stack direction="row" spacing={0.55} alignItems="center">
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: palette,
            '& svg': {
              fontSize: compact ? '0.95rem' : '1rem',
            },
          }}
        >
          {config.icon}
        </Box>
        <Typography
          component="span"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
            fontSize: compact ? '0.68rem' : '0.72rem',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {compact ? config.compactLabel : config.label}
        </Typography>
      </Stack>
    </Box>
  )
}
