import { Grid, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { getPhysicalSnapshot } from '@/data/seeds/usePhysicalSnapshot'

export function PhysicalPage() {
  const { dayInstance, scheduledWorkout, weeklyWorkoutSummary } = getPhysicalSnapshot()

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Physical"
        title="Physical execution is part of the score."
        description={`Today's ${dayInstance.label} uses the same generated day model as the rest of Forge. Physical scheduling now reads from the seeded workout plan instead of static copy.`}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Today"
            title={scheduledWorkout?.label ?? 'Recovery / Flex'}
            description="Upper A, Lower A, Upper B, and recovery states are now read from the generated weekday/day-type schedule."
          >
            <Typography variant="body2" color="text.secondary">
              Status: {scheduledWorkout?.status ?? 'optional'}
            </Typography>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard
            eyebrow="Sleep Logging"
            title="Manual in V1"
            description="Sleep remains a fast manual input in Phase 1, but the screen is now aligned to the generated daily routine context."
          >
            <Typography variant="body2" color="text.secondary">
              Wake target: {dayInstance.wakeWindow ?? 'Not specified'} · Sleep target: {dayInstance.sleepWindow ?? 'Not specified'}
            </Typography>
          </SurfaceCard>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <SurfaceCard
            eyebrow="Weekly Training Shape"
            title={`${weeklyWorkoutSummary.scheduledCount} scheduled sessions + ${weeklyWorkoutSummary.optionalCount} optional windows`}
            description="The weekly distribution is now driven by the workout seed schedule and ready for later persistence."
          >
            <Stack spacing={1}>
              {weeklyWorkoutSummary.labels.map((label) => (
                <Typography key={label} variant="body2" color="text.secondary">
                  {label}
                </Typography>
              ))}
            </Stack>
          </SurfaceCard>
        </Grid>
      </Grid>
    </Stack>
  )
}
