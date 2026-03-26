import { Grid, Stack } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'

const prepDomains = [
  'DSA',
  'System Design',
  'LLD',
  'Java / Backend',
  'CS Fundamentals / AI',
]

export function PrepPage() {
  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Prep"
        title="Structured readiness, not vague progress."
        description="Phase 1 will seed the taxonomy in code and build confidence, revision, and readiness contribution flows on top of typed domain models."
      />
      <Grid container spacing={2}>
        {prepDomains.map((domain) => (
          <Grid key={domain} size={{ xs: 12, sm: 6, lg: 4 }}>
            <SurfaceCard
              eyebrow="Domain"
              title={domain}
              description="Seeded progress, confidence, and exposure state will live in Firestore-backed repositories."
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
