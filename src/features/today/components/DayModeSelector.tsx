import { Button, Stack } from '@mui/material'
import type { DayMode } from '@/domain/common/types'

const dayModeOptions: Array<{ value: DayMode; label: string }> = [
  { value: 'ideal', label: 'Ideal' },
  { value: 'normal', label: 'Normal' },
  { value: 'lowEnergy', label: 'Low Energy' },
  { value: 'survival', label: 'Survival' },
]

type DayModeSelectorProps = {
  activeDayMode: DayMode
  disabled?: boolean
  onSelect: (dayMode: DayMode) => void
}

export function DayModeSelector({ activeDayMode, disabled = false, onSelect }: DayModeSelectorProps) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {dayModeOptions.map((option) => {
        const selected = option.value === activeDayMode

        return (
          <Button
            key={option.value}
            size="small"
            variant={selected ? 'contained' : 'outlined'}
            color={selected ? 'primary' : 'inherit'}
            disabled={disabled || selected}
            aria-pressed={selected}
            onClick={() => {
              if (!selected) {
                onSelect(option.value)
              }
            }}
          >
            {option.label}
          </Button>
        )
      })}
    </Stack>
  )
}
