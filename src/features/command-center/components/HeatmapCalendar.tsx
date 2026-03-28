import { Box, Stack, Typography } from '@mui/material'
import type { AnalyticsHeatmapCell } from '@/domain/analytics/chartData'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type HeatmapCalendarProps = {
  cells: AnalyticsHeatmapCell[]
  tone?: CommandCenterTone
}

export function HeatmapCalendar({ cells, tone = 'ember' }: HeatmapCalendarProps) {
  const palette = commandCenterChartTheme.tones[tone]

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 0.85,
        }}
      >
        {cells.map((cell) => (
          <Box
            key={cell.date}
            title={`${cell.date}: ${cell.completionPercent}% complete, score ${cell.score}`}
            sx={{
              aspectRatio: '1 / 1',
              borderRadius: 2,
              border: '1px solid',
              borderColor: cell.intensity === 0 ? 'divider' : palette.border,
              backgroundColor:
                cell.intensity === 0
                  ? 'rgba(255, 255, 255, 0.03)'
                  : cell.intensity === 1
                    ? palette.soft
                    : cell.intensity === 2
                      ? 'rgba(255, 255, 255, 0.12)'
                      : cell.intensity === 3
                        ? palette.border
                        : palette.solid,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.64rem',
                color: cell.intensity >= 3 ? '#06080f' : 'text.secondary',
              }}
            >
              {cell.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Darker cells represent stronger execution density in the tracked period.
      </Typography>
    </Stack>
  )
}
