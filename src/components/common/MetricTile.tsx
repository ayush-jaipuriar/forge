import { alpha } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'

type MetricTileProps = {
  eyebrow: string
  value: string
  detail: string
  tone?: 'neutral' | 'success' | 'warning'
}

const toneMap = {
  neutral: forgeTokens.palette.accent.steel,
  success: forgeTokens.palette.accent.success,
  warning: forgeTokens.palette.accent.warning,
}

export function MetricTile({ eyebrow, value, detail, tone = 'neutral' }: MetricTileProps) {
  const toneColor = toneMap[tone]

  return (
    <Stack
      spacing={1}
      sx={{
        minHeight: { xs: 132, md: 144 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        p: 2.5,
        background: `linear-gradient(180deg, ${alpha(forgeTokens.palette.background.panel, 0.98)} 0%, ${alpha(forgeTokens.palette.background.surface, 0.98)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInline: 0,
          insetBlockStart: 0,
          height: 2,
          background: `linear-gradient(90deg, ${alpha(toneColor, 0.9)} 0%, ${alpha(toneColor, 0)} 100%)`,
        },
      }}
    >
      <Typography variant="overline" color="primary.light">
        {eyebrow}
      </Typography>
      <Typography variant="h3" sx={{ fontSize: '1.35rem' }}>
        {value}
      </Typography>
      <Box sx={{ mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      </Box>
    </Stack>
  )
}
