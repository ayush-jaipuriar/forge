import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { DayMode, WarState } from '@/domain/common/types'
import { forgeTokens } from '@/app/theme/tokens'

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
  const palette = {
    default: forgeTokens.palette.text.secondary,
    success: forgeTokens.palette.accent.success,
    warning: forgeTokens.palette.accent.warning,
    error: forgeTokens.palette.accent.critical,
  }[toneMap[tone]]

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 24,
        px: 1,
        borderRadius: 2,
        color: palette,
        border: '1px solid',
        borderColor: alpha(palette, 0.2),
        backgroundColor: alpha(palette, 0.045),
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
          fontSize: '0.7rem',
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
