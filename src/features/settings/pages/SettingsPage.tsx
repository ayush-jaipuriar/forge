import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'

const settingsCards = [
  'Firebase connection status',
  'PWA install state',
  'Google Calendar scaffolding',
  'Feature flags and future provider hooks',
]

export function SettingsPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h2">Settings</Typography>
      <Grid container spacing={2}>
        {settingsCards.map((item) => (
          <Grid key={item} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3">{item}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
