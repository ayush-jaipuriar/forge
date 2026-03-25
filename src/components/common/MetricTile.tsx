import { Box, Stack, Typography } from '@mui/material'

type MetricTileProps = {
  eyebrow: string
  value: string
  detail: string
}

export function MetricTile({ eyebrow, value, detail }: MetricTileProps) {
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
