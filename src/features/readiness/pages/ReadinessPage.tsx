import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'

export function ReadinessPage() {
  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Readiness"
        title="Pressure should be visible, not abstract."
        description="Phase 1 will establish the honest pace-vs-target framing and keep the readiness model modular so stronger projections can land in Phase 2 without replacing the fundamentals."
      />
      <SurfaceCard title="Target Date: May 31, 2026">
        <Stack direction="row" spacing={1} alignItems="center">
          <TrendingUpRoundedIcon color="primary" />
          <Typography color="text.secondary">Pace, target pressure, and domain readiness will converge here.</Typography>
        </Stack>
      </SurfaceCard>
    </Stack>
  )
}
