import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { DayMode, WarState } from '@/domain/common/types'

type StatusBadgeProps = {
  label: string
  tone: WarState | DayMode
}

const toneMap: Record<WarState | DayMode, 'default' | 'success' | 'warning' | 'error'> = {
  dominant: 'success',
  onTrack: 'success',
  slipping: 'warning',
  critical: 'error',
  ideal: 'success',
  normal: 'default',
  lowEnergy: 'warning',
  survival: 'error',
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <Box
      component="span"
      sx={(theme) => {
        const palette = {
          default: theme.palette.text.secondary,
          success: theme.palette.success.main,
          warning: theme.palette.warning.main,
          error: theme.palette.error.main,
        }[toneMap[tone]]

        return {
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 22,
          px: 0.9,
          borderRadius: 1.75,
          color: palette,
          border: '1px solid',
          borderColor: alpha(palette, theme.palette.mode === 'light' ? 0.18 : 0.16),
          backgroundColor: alpha(palette, theme.palette.mode === 'light' ? 0.05 : 0.035),
        }
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Avenir Next", sans-serif',
          fontSize: '0.68rem',
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
