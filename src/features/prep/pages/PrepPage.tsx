import { Grid, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { getPrepSnapshot } from '@/data/seeds/usePrepSnapshot'

export function PrepPage() {
  const { dayLabel, domainSummaries, focusedDomains, totalTopicCount } = getPrepSnapshot()

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Prep"
        title="Structured readiness, not vague progress."
        description={`${totalTopicCount} seeded topics are now available across the prep taxonomy. ${dayLabel} focus is reflected below so Prep stays tied to the daily operating model.`}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SurfaceCard
            eyebrow="Today's Focus"
            title="Domains under pressure"
            description="These are inferred from the generated day instance and its priority blocks."
          >
            <Stack spacing={1.25}>
              {focusedDomains.length > 0 ? (
                focusedDomains.map((domain) => (
                  <Typography key={domain.domain} variant="body2" color="text.secondary">
                    {domain.label} · {domain.topicCount} topics · {domain.primaryGroups.join(', ')}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No direct prep focus areas were attached to today's generated blocks.
                </Typography>
              )}
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SurfaceCard
            eyebrow="Taxonomy Shape"
            title="Seeded scope"
            description="The prep system is now driven by structured domain/group metadata instead of static labels."
          >
            <Stack spacing={1.25}>
              {domainSummaries.map((domain) => (
                <Typography key={domain.domain} variant="body2" color="text.secondary">
                  {domain.label} · {domain.topicCount} topics across {domain.groupCount} groups
                </Typography>
              ))}
            </Stack>
          </SurfaceCard>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {domainSummaries.map((domain) => (
          <Grid key={domain.domain} size={{ xs: 12, sm: 6, lg: 4 }}>
            <SurfaceCard
              eyebrow="Domain"
              title={domain.label}
              description={`${domain.topicCount} topics seeded across ${domain.groupCount} structural groups.`}
            >
              <Stack spacing={1}>
                {domain.primaryGroups.map((group) => (
                  <Typography key={group} variant="body2" color="text.secondary">
                    {group}
                  </Typography>
                ))}
              </Stack>
            </SurfaceCard>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
