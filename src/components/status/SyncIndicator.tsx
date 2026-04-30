import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { SyncStatus } from '@/domain/common/types'

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

  return (
    <Box
      component="span"
      sx={(theme) => {
        const palette = {
          default: theme.palette.text.secondary,
          success: theme.palette.success.main,
          warning: theme.palette.warning.main,
          error: theme.palette.error.main,
        }[config.color]

        return {
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: compact ? 22 : 24,
          px: compact ? 0.8 : 0.95,
          borderRadius: 1.75,
          color: palette,
          border: '1px solid',
          borderColor: alpha(palette, theme.palette.mode === 'light' ? 0.18 : 0.16),
          backgroundColor: alpha(palette, theme.palette.mode === 'light' ? 0.05 : 0.035),
        }
      }}
    >
      <Stack direction="row" spacing={0.55} alignItems="center">
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'inherit',
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
            fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
            fontSize: compact ? '0.66rem' : '0.69rem',
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
