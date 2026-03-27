import { Button, Stack, Typography } from '@mui/material'

type SignalToggleGroupProps<TValue extends string> = {
  label: string
  value: TValue
  disabled?: boolean
  options: Array<{
    value: TValue
    label: string
  }>
  onSelect: (value: TValue) => void
}

export function SignalToggleGroup<TValue extends string>({
  label,
  value,
  disabled = false,
  options,
  onSelect,
}: SignalToggleGroupProps<TValue>) {
  return (
    <Stack spacing={1}>
      <Typography variant="overline" color="primary.light">
        {label}
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {options.map((option) => {
          const selected = option.value === value

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
    </Stack>
  )
}
