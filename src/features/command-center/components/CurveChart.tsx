import { Box, Stack, Typography } from '@mui/material'
import type { AnalyticsCurveDatum } from '@/domain/analytics/chartData'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type CurveChartProps = {
  data: AnalyticsCurveDatum[]
  tone?: CommandCenterTone
}

export function CurveChart({ data, tone = 'gold' }: CurveChartProps) {
  const palette = commandCenterChartTheme.tones[tone]

  if (data.length === 0) {
    return null
  }

  const maxValue = Math.max(100, ...data.map((point) => point.value), ...data.map((point) => point.target ?? 0))
  const pointGap = data.length === 1 ? 0 : 100 / (data.length - 1)
  const polyline = data
    .map((point, index) => `${index * pointGap},${100 - (point.value / maxValue) * 100}`)
    .join(' ')
  const targetLine = data[0]?.target ? 100 - ((data[0].target ?? 0) / maxValue) * 100 : null

  return (
    <Stack spacing={1.5}>
      <Box sx={{ height: 180, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)', p: 1.5 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {[20, 40, 60, 80].map((grid) => (
            <line
              key={grid}
              x1="0"
              y1={grid}
              x2="100"
              y2={grid}
              stroke={commandCenterChartTheme.gridLine}
              strokeWidth="0.6"
              strokeDasharray="2 2"
            />
          ))}
          {targetLine !== null ? (
            <line
              x1="0"
              y1={targetLine}
              x2="100"
              y2={targetLine}
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
          ) : null}
          <polyline
            points={polyline}
            fill="none"
            stroke={palette.solid}
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {data.map((point, index) => (
            <circle
              key={point.date}
              cx={index * pointGap}
              cy={100 - (point.value / maxValue) * 100}
              r="1.8"
              fill={palette.solid}
            />
          ))}
        </svg>
      </Box>
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        {data.map((point) => (
          <Typography key={point.date} variant="caption" color="text.secondary">
            {point.label}
          </Typography>
        ))}
      </Stack>
    </Stack>
  )
}
