import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import { MetricTile } from '@/components/common/MetricTile'

const agenda = [
  { time: '08:00', title: 'Morning Deep Block', detail: 'DSA / System Design' },
  { time: '13:00', title: 'Mini Prep Block', detail: 'Retention and review' },
  { time: '19:00', title: 'Workout Window', detail: 'Upper A / Lower A by schedule' },
]

export function TodayPage() {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <Typography variant="overline" color="primary.light">
              Today
            </Typography>
            <Typography variant="h1">Run the day with clarity.</Typography>
            <Typography color="text.secondary" maxWidth={720}>
              The Today surface is where Forge becomes operational: agenda visibility, current block context,
              friction-light logging, and the recommendation lane that will later connect to scoring and fallback
              logic.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" startIcon={<KeyboardDoubleArrowRightRoundedIcon />}>
                What should I do now?
              </Button>
              <Button variant="outlined" startIcon={<AccessTimeRoundedIcon />}>
                Mark current block complete
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Master Score" value="62 / 100" detail="Strict weighting will live in the domain layer." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Readiness Pace" value="On Watch" detail="Target date remains visible from the start." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Workout" value="Upper A" detail="Physical execution stays first-class." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Sync State" value="Stable" detail="Offline queue wiring starts in the foundation." />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h3">Agenda</Typography>
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
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AutoGraphRoundedIcon color="primary" />
                    <Typography variant="h3">Recommendation Engine</Typography>
                  </Stack>
                  <Typography color="text.secondary">
                    Rules-based recommendations will live outside the UI and return ranked, explainable next actions.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FitnessCenterRoundedIcon color="primary" />
                    <Typography variant="h3">Physical Execution</Typography>
                  </Stack>
                  <Typography color="text.secondary">
                    Workout state, sleep state, and readiness pressure will feed the main score rather than sit in a
                    side tracker.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
