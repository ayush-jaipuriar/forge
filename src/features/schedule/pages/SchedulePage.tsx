import { Grid, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { getWeeklyRoutineSnapshot } from '@/data/seeds/useRoutineSnapshot'

export function SchedulePage() {
  const weekInstances = getWeeklyRoutineSnapshot()

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Schedule"
        title="Fixed routine, visible at a glance."
        description="This screen will eventually expose limited operational overrides while protecting the fixed-routine philosophy of V1."
      />
      <Grid container spacing={2}>
        {weekInstances.map((day) => (
          <Grid key={day.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <SurfaceCard
              eyebrow={`${day.weekdayLabel} · ${day.dateLabel}`}
              title={day.label}
              description={day.focusLabel}
            >
              <Stack spacing={1}>
                {day.expectationSummary.slice(0, 2).map((expectation) => (
                  <Typography key={expectation} variant="body2" color="text.secondary">
                    {expectation}
                  </Typography>
                ))}
                <Typography variant="body2" color="primary.light">
                  {day.blocks.length} planned blocks
                </Typography>
              </Stack>
            </SurfaceCard>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
