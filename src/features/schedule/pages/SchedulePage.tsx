import { Grid, Stack } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'

const dayCards = [
  { day: 'Monday', type: 'WFH High Output', focus: 'DSA + Java/Backend + Gym' },
  { day: 'Tuesday', type: 'WFO Continuity', focus: 'System Design retention' },
  { day: 'Wednesday', type: 'WFO Continuity', focus: 'LLD / DSA retention' },
  { day: 'Thursday', type: 'WFH High Output', focus: 'LLD + Backend + Gym' },
  { day: 'Friday', type: 'WFH High Output', focus: 'System Design + AI/Behavioral + Gym' },
  { day: 'Saturday', type: 'Weekend Deep Work', focus: 'DSA + LLD + Backend/Mock' },
]

export function SchedulePage() {
  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Schedule"
        title="Fixed routine, visible at a glance."
        description="This screen will eventually expose limited operational overrides while protecting the fixed-routine philosophy of V1."
      />
      <Grid container spacing={2}>
        {dayCards.map((day) => (
          <Grid key={day.day} size={{ xs: 12, md: 6, xl: 4 }}>
            <SurfaceCard eyebrow={day.day} title={day.type} description={day.focus} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
