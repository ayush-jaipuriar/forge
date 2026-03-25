import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'

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
      <Typography variant="h2">Physical</Typography>
      <Typography color="text.secondary" maxWidth={720}>
        Forge treats physical execution as a core discipline signal, not a side widget. The screen will stay lightweight
        while remaining important to scoring and readiness.
      </Typography>
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="h3">{card.title}</Typography>
                  <Typography color="text.secondary">{card.detail}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
