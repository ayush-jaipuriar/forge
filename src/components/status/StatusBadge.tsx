import { Chip } from '@mui/material'
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
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        color: palette,
        borderColor: alpha(palette, 0.34),
        backgroundColor: alpha(palette, 0.08),
      }}
    />
  )
}
