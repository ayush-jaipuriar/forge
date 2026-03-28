import { Box, Stack, Typography } from '@mui/material'
import type { AnalyticsBreakdownDatum } from '@/domain/analytics/types'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type DistributionBarsProps = {
  data: AnalyticsBreakdownDatum[]
  tone?: CommandCenterTone
  valueLabel?: string
}

export function DistributionBars({
  data,
  tone = 'steel',
  valueLabel,
}: DistributionBarsProps) {
  const palette = commandCenterChartTheme.tones[tone]
  const maxValue = Math.max(1, ...data.map((entry) => entry.value))

  return (
    <Stack spacing={1.25}>
      {data.map((entry) => (
        <Stack key={entry.key} spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="body2">{entry.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {entry.value}
              {valueLabel ? ` ${valueLabel}` : ''}
              {typeof entry.percent === 'number' ? ` · ${entry.percent}%` : ''}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${Math.max(8, (entry.value / maxValue) * 100)}%`,
                height: '100%',
                borderRadius: 999,
                background: `linear-gradient(90deg, ${palette.solid} 0%, ${palette.border} 100%)`,
              }}
            />
          </Box>
        </Stack>
      ))}
    </Stack>
  )
}
