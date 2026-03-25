import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'

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
      <Typography variant="h2">Schedule</Typography>
      <Typography color="text.secondary" maxWidth={720}>
        This screen will eventually expose limited operational overrides while protecting the fixed-routine philosophy
        of V1.
      </Typography>
      <Grid container spacing={2}>
        {dayCards.map((day) => (
          <Grid key={day.day} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="primary.light">
                    {day.day}
                  </Typography>
                  <Typography variant="h3">{day.type}</Typography>
                  <Typography color="text.secondary">{day.focus}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
