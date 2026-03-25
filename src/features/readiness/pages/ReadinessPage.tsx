import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { Card, CardContent, Stack, Typography } from '@mui/material'

export function ReadinessPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h2">Readiness</Typography>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUpRoundedIcon color="primary" />
              <Typography variant="h3">Target Date: May 31, 2026</Typography>
            </Stack>
            <Typography color="text.secondary">
              Phase 1 will establish the honest pace-vs-target framing and keep the readiness model modular so stronger
              projections can land in Phase 2 without replacing the fundamentals.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
