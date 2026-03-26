import { Grid, Stack } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'

const cards = [
  {
    title: 'Scheduled Workout',
    detail: 'Upper A, Lower A, Upper B, and recovery states are modeled as first-class inputs.',
  },
  {
    title: 'Sleep Logging',
    detail: 'Manual in V1, but architected so automated sync can replace the source later.',
  },
]

export function PhysicalPage() {
  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Physical"
        title="Physical execution is part of the score."
        description="Forge treats physical execution as a core discipline signal, not a side widget. The screen will stay lightweight while remaining important to scoring and readiness."
      />
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: 6 }}>
            <SurfaceCard title={card.title} description={card.detail} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
