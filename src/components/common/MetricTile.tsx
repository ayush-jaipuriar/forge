import { alpha } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'

type MetricTileProps = {
  eyebrow: string
  value: string
  detail: string
  tone?: 'neutral' | 'success' | 'warning'
}

export function MetricTile({ eyebrow, value, detail, tone = 'neutral' }: MetricTileProps) {
  return (
    <Stack
      spacing={0.8}
      sx={(theme) => {
        const toneColor = {
          neutral: theme.palette.secondary.main,
          success: theme.palette.success.main,
          warning: theme.palette.warning.main,
        }[tone]

        return {
          minHeight: { xs: 126, md: 138 },
          border: '1px solid',
          borderColor: alpha(theme.palette.text.secondary, theme.palette.mode === 'light' ? 0.12 : 0.08),
          borderRadius: 3.5,
          p: 2.15,
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.82)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
              : alpha(theme.palette.background.paper, 0.42),
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            insetInlineStart: 18,
            insetBlockStart: 18,
            width: 8,
            height: 8,
            borderRadius: '999px',
            backgroundColor: alpha(toneColor, theme.palette.mode === 'light' ? 0.5 : 0.72),
          },
        }
      }}
    >
      <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.62rem', letterSpacing: '0.12em', fontWeight: 700 }}>
        {eyebrow}
      </Typography>
      <Typography variant="h3" sx={{ fontSize: '1.28rem', lineHeight: 1.05 }}>
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
