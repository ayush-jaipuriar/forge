import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Button, Chip, Stack, Typography } from '@mui/material'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import type { DayMode } from '@/domain/common/types'
import type { FallbackModeSuggestion } from '@/domain/recommendation/types'

export function FallbackModeSuggestionCard({
  suggestion,
  currentModeLabel,
  disabled = false,
  onApply,
  onDismiss,
}: {
  suggestion: FallbackModeSuggestion
  currentModeLabel: string
  disabled?: boolean
  onApply: (dayMode: DayMode) => void
  onDismiss: () => void
}) {
  return (
    <SurfaceCard
      eyebrow="Fallback Guidance"
      title={suggestion.title}
      description={suggestion.rationale}
      action={
        <Chip
          icon={<WarningAmberRoundedIcon />}
          label={`${suggestion.urgency.toUpperCase()} SIGNAL`}
          color={suggestion.urgency === 'critical' ? 'error' : 'warning'}
          size="small"
        />
      }
    >
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Current stance: {currentModeLabel}. Suggested stance: {formatModeLabel(suggestion.suggestedDayMode)}.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Why this surfaced: {suggestion.explanation}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" disabled={disabled} onClick={() => onApply(suggestion.suggestedDayMode)}>
            Apply {formatModeLabel(suggestion.suggestedDayMode)}
          </Button>
          <Button variant="outlined" disabled={disabled} onClick={onDismiss}>
            Keep current stance
          </Button>
        </Stack>
      </Stack>
    </SurfaceCard>
  )
}

function formatModeLabel(dayMode: DayMode) {
  return dayMode === 'lowEnergy'
    ? 'Low Energy mode'
    : `${dayMode.charAt(0).toUpperCase()}${dayMode.slice(1)} mode`
}
