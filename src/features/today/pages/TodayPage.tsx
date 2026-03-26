import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { MetricTile } from '@/components/common/MetricTile'
import { SurfaceCard } from '@/components/common/SurfaceCard'

const agenda = [
  { time: '08:00', title: 'Morning Deep Block', detail: 'DSA / System Design' },
  { time: '13:00', title: 'Mini Prep Block', detail: 'Retention and review' },
  { time: '19:00', title: 'Workout Window', detail: 'Upper A / Lower A by schedule' },
]

export function TodayPage() {
  return (
    <Stack spacing={3}>
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at top right, rgba(210, 162, 98, 0.12), transparent 35%), linear-gradient(180deg, rgba(18, 24, 36, 0.98) 0%, rgba(12, 16, 24, 0.98) 100%)',
        }}
      >
        <SectionHeader
          eyebrow="Today"
          title="Run the day with clarity."
          description="The Today surface is where Forge becomes operational: agenda visibility, current block context, friction-light logging, and the recommendation lane that will later connect to scoring and fallback logic."
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" startIcon={<KeyboardDoubleArrowRightRoundedIcon />}>
                What should I do now?
              </Button>
              <Button variant="outlined" startIcon={<AccessTimeRoundedIcon />}>
                Mark current block complete
              </Button>
            </Stack>
          }
        />
      </SurfaceCard>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="Master Score"
            value="62 / 100"
            detail="Strict weighting will live in the domain layer."
            tone="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Readiness Pace" value="On Watch" detail="Target date remains visible from the start." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Workout" value="Upper A" detail="Physical execution stays first-class." tone="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Sync State" value="Stable" detail="Offline queue wiring starts in the foundation." />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SurfaceCard
            eyebrow="Operational View"
            title="Agenda"
            description="Blocks are already framed in the tone the final execution screen will use: compact, direct, and easy to scan under pressure."
          >
            <Stack spacing={2}>
              {agenda.map((block) => (
                <Box
                  key={block.title}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    p: 2,
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <Typography variant="body2" color="primary.light">
                    {block.time}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="h3">{block.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {block.detail}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <SurfaceCard
              eyebrow="Decision Layer"
              title="Recommendation Engine"
              description="Rules-based recommendations will live outside the UI and return ranked, explainable next actions."
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoGraphRoundedIcon color="primary" />
                <Typography color="text.secondary">Recommendation panels will explain why the next action matters.</Typography>
              </Stack>
            </SurfaceCard>
            <SurfaceCard
              eyebrow="Physical Signal"
              title="Physical Execution"
              description="Workout state, sleep state, and readiness pressure will feed the main score rather than sit in a side tracker."
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <FitnessCenterRoundedIcon color="primary" />
                <Typography color="text.secondary">The visual language already keeps physical execution equally serious.</Typography>
              </Stack>
            </SurfaceCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
