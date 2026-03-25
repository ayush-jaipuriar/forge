import { Chip } from '@mui/material'
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
  return <Chip label={label} color={toneMap[tone]} size="small" variant="outlined" />
}
