import { Box, Stack, Typography } from '@mui/material'

type MetricTileProps = {
  eyebrow: string
  value: string
  detail: string
  tone?: 'neutral' | 'success' | 'warning'
}

const toneMap = {
  neutral: 'rgba(77, 96, 122, 0.65)',
  success: 'rgba(79, 143, 115, 0.75)',
  warning: 'rgba(194, 135, 56, 0.75)',
}

export function MetricTile({ eyebrow, value, detail, tone = 'neutral' }: MetricTileProps) {
  return (
    <Stack
      spacing={1}
      sx={{
        minHeight: 132,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        p: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInlineStart: 0,
          insetBlock: 0,
          width: 3,
          backgroundColor: toneMap[tone],
        },
      }}
    >
      <Typography variant="overline" color="text.secondary">
        {eyebrow}
      </Typography>
      <Typography variant="h3">{value}</Typography>
      <Box sx={{ mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      </Box>
    </Stack>
  )
}
