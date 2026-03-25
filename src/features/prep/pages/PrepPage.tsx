import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'

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
      <Typography variant="h2">Prep</Typography>
      <Typography color="text.secondary" maxWidth={720}>
        Phase 1 will seed the taxonomy in code and build confidence, revision, and readiness contribution flows on top
        of typed domain models.
      </Typography>
      <Grid container spacing={2}>
        {prepDomains.map((domain) => (
          <Grid key={domain} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="primary.light">
                    Domain
                  </Typography>
                  <Typography variant="h3">{domain}</Typography>
                  <Typography color="text.secondary">
                    Seeded progress, confidence, and exposure state will live in Firestore-backed repositories.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
