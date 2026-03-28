import { Box, Stack, Typography } from '@mui/material'
import type { CommandCenterTrendPoint } from '@/services/analytics/commandCenterWorkspaceService'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type MiniTrendChartProps = {
  data: CommandCenterTrendPoint[]
  tone?: CommandCenterTone
  secondaryLabel?: string
}

export function MiniTrendChart({
  data,
  tone = 'gold',
  secondaryLabel,
}: MiniTrendChartProps) {
  const palette = commandCenterChartTheme.tones[tone]
  const maxValue = Math.max(1, ...data.flatMap((entry) => [entry.value, entry.secondaryValue ?? 0]))

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="flex-end" spacing={1.25} sx={{ minHeight: 144 }}>
        {data.map((entry) => (
          <Stack key={entry.label} spacing={0.75} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: '100%',
                height: `${Math.max(10, (entry.value / maxValue) * 112)}px`,
                borderRadius: 999,
                background: `linear-gradient(180deg, ${palette.solid} 0%, ${palette.border} 100%)`,
                position: 'relative',
              }}
            >
              {typeof entry.secondaryValue === 'number' ? (
                <Box
                  sx={{
                    position: 'absolute',
                    insetInline: 4,
                    bottom: `${Math.min(104, Math.max(4, (entry.secondaryValue / maxValue) * 112))}px`,
                    borderTop: '2px solid',
                    borderColor: 'rgba(255, 255, 255, 0.72)',
                    opacity: 0.85,
                  }}
                />
              ) : null}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {entry.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {secondaryLabel ? (
        <Typography variant="body2" color="text.secondary">
          White marker: {secondaryLabel}
        </Typography>
      ) : null}
    </Stack>
  )
}
