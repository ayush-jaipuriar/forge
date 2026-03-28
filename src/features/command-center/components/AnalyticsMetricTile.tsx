import { Box, Stack, Typography } from '@mui/material'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type AnalyticsMetricTileProps = {
  eyebrow: string
  value: string
  detail: string
  tone?: CommandCenterTone
}

export function AnalyticsMetricTile({
  eyebrow,
  value,
  detail,
  tone = 'steel',
}: AnalyticsMetricTileProps) {
  const palette = commandCenterChartTheme.tones[tone]

  return (
    <Stack
      spacing={1}
      sx={{
        minHeight: 152,
        border: '1px solid',
        borderColor: palette.border,
        borderRadius: 4,
        p: 2.5,
        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(255, 255, 255, 0.02) 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          insetInlineStart: 0,
          insetBlockStart: 0,
          width: 4,
          height: '100%',
          backgroundColor: palette.solid,
        }}
      />
      <Typography variant="overline" color="text.secondary">
        {eyebrow}
      </Typography>
      <Typography variant="h2" sx={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  )
}
