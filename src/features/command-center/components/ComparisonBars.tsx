import { Box, Stack, Typography } from '@mui/material'
import type { AnalyticsComparisonDatum } from '@/domain/analytics/chartData'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type ComparisonBarsProps = {
  data: AnalyticsComparisonDatum[]
  tone?: CommandCenterTone
  primaryLabel: string
  secondaryLabel?: string
}

export function ComparisonBars({
  data,
  tone = 'steel',
  primaryLabel,
  secondaryLabel,
}: ComparisonBarsProps) {
  const palette = commandCenterChartTheme.tones[tone]
  const maxPrimary = Math.max(1, ...data.map((entry) => entry.primaryValue))

  return (
    <Stack spacing={1.5}>
      {data.map((entry) => (
        <Stack key={entry.key} spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="body2">{entry.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {entry.primaryValue} {primaryLabel}
              {typeof entry.secondaryValue === 'number'
                ? ` · ${entry.secondaryValue} ${secondaryLabel ?? 'secondary'}`
                : ''}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: `${Math.max(8, (entry.primaryValue / maxPrimary) * 100)}%`,
                height: '100%',
                borderRadius: 999,
                background: `linear-gradient(90deg, ${palette.solid} 0%, ${palette.border} 100%)`,
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {entry.detail}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}
