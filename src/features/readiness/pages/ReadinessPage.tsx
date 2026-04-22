import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { Alert, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material'
import { MetricTile } from '@/components/common/MetricTile'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { usePlatformWorkspace } from '@/features/platform/hooks/usePlatformWorkspace'
import { useReadinessWorkspace } from '@/features/readiness/hooks/useReadinessWorkspace'

type ReadinessPageProps = {
  embedded?: boolean
}

export function ReadinessPage({ embedded = false }: ReadinessPageProps) {
  const { data, isLoading } = useReadinessWorkspace()
  const platformWorkspace = usePlatformWorkspace()

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading readiness snapshot" description="Forge is deriving pressure, pace, and domain readiness from the persisted prep model.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const { operationalSignals, readinessSnapshot } = data
  const healthWorkspace = data.healthIntegration
  const strongestFocusedDomain = data.focusedDomains[0]

  return (
    <Stack spacing={3}>
      {!embedded ? (
        <SectionHeader
          eyebrow="Readiness"
          title="Pressure should become readable early."
          description="See whether the target date, topic coverage, and current pace still support the plan."
        />
      ) : null}

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, xl: 8 }}>
          <SurfaceCard
            eyebrow="Target Posture"
            title={`Target date: ${readinessSnapshot.targetDate}`}
            description={readinessSnapshot.paceSnapshot.paceLabel}
          >
            <Stack spacing={2.25}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                <Stack spacing={1.1} maxWidth={560}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUpRoundedIcon color="primary" />
                    <Typography variant="h3">{readinessSnapshot.pressureLabel}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {readinessSnapshot.paceSnapshot.paceLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coverage is currently {readinessSnapshot.paceSnapshot.coveragePercent}% with {readinessSnapshot.daysRemaining} days left before the target date.
                  </Typography>
                </Stack>
                {strongestFocusedDomain ? (
                  <Stack spacing={0.6} sx={{ minWidth: { md: 220 } }}>
                    <Typography variant="overline" color="primary.light">
                      Current focus pressure
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {strongestFocusedDomain.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Readiness {strongestFocusedDomain.readinessLevel}
                    </Typography>
                  </Stack>
                ) : null}
              </Stack>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricTile eyebrow="Target Date" value={readinessSnapshot.targetDate} detail={`${readinessSnapshot.daysRemaining} days remaining`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricTile eyebrow="Pressure" value={readinessSnapshot.pressureLevel} detail={readinessSnapshot.pressureLabel} tone={['critical', 'behind'].includes(readinessSnapshot.pressureLevel) ? 'warning' : 'neutral'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricTile eyebrow="Coverage" value={`${readinessSnapshot.paceSnapshot.coveragePercent}%`} detail={`${readinessSnapshot.paceSnapshot.touchedTopicCount}/${readinessSnapshot.paceSnapshot.totalTopicCount} topics touched`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricTile eyebrow="Required Pace" value={`${readinessSnapshot.paceSnapshot.requiredTopicsPerWeek}/wk`} detail={readinessSnapshot.paceSnapshot.paceLabel} tone={readinessSnapshot.paceSnapshot.paceLevel === 'behind' ? 'warning' : 'neutral'} />
                </Grid>
              </Grid>
            </Stack>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Stack spacing={2} height="100%">
            <SurfaceCard
              eyebrow="Focused Domains"
              title="Where today is already exposed"
              description="The first prep domains to check when readiness feels thin."
            >
              {data.focusedDomains.length > 0 ? (
                <Stack spacing={1.1} divider={<Divider flexItem />}>
                  {data.focusedDomains.map((domain) => (
                    <Stack key={domain.domain} spacing={0.35}>
                      <Typography variant="h3">{domain.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Readiness {domain.readinessLevel}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  The current generated plan is not concentrating pressure into one prep domain right now.
                </Typography>
              )}
            </SurfaceCard>

            <SurfaceCard
              eyebrow="Intervention Count"
              title={operationalSignals.length > 0 ? `${operationalSignals.length} signals need attention` : 'No acute intervention signal'}
              description="This count stays small on purpose."
            >
              <Typography variant="body2" color="text.secondary">
                {operationalSignals.length > 0
                  ? 'Use the intervention layer below to decide where the target or coverage model is slipping.'
                  : 'The current pace and domain mix do not show an acute readiness intervention signal.'}
              </Typography>
            </SurfaceCard>
          </Stack>
        </Grid>
      </Grid>

      {operationalSignals.length > 0 ? (
        <SurfaceCard
          eyebrow="Intervention Layer"
          title="Where readiness is actually under pressure"
          description="Signals that show where the target model is becoming operationally expensive."
        >
          <Grid container spacing={1.5}>
            {operationalSignals.map((signal) => (
              <Grid key={signal.id} size={{ xs: 12, md: 6 }}>
                <OperationalSignalCard
                  title={signal.title}
                  detail={signal.detail}
                  tone={signal.tone}
                  badge={signal.badge}
                />
              </Grid>
            ))}
          </Grid>
        </SurfaceCard>
      ) : null}

      <SurfaceCard
        eyebrow="Domain Readiness"
        title="Coverage and confidence across the prep map"
        description="Keep domain weakness visible enough to act on."
      >
        <Grid container spacing={2}>
          {readinessSnapshot.domainStates.map((domain) => (
            <Grid key={domain.domain} size={{ xs: 12, md: 6, xl: 4 }}>
              <SurfaceCard
                title={domain.label}
                description={`Current readiness reads ${domain.readinessLevel}. This is still a simplified model driven by confidence, coverage, and logged effort.`}
                contentSx={{ p: { xs: 2, md: 2.25 } }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Touched topics: {domain.touchedTopicCount}/{domain.totalTopicCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High confidence topics: {domain.highConfidenceCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Logged effort: {domain.hoursSpent.toFixed(1)}h
                  </Typography>
                </Stack>
              </SurfaceCard>
            </Grid>
          ))}
        </Grid>
      </SurfaceCard>

      <SurfaceCard
        eyebrow="Recovery Signal Scaffolding"
        title="Future provider contribution points"
        description="Recovery signals stay behind a typed seam until real provider ingestion exists."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={1.1}>
              <Typography variant="body2" color="text.secondary">
                {healthWorkspace.statusSummaryLabel}
              </Typography>
              {healthWorkspace.providers
                .filter((provider) => provider.supportedSignalCount > 0)
                .slice(0, 2)
                .map((provider) => (
                  <Typography key={provider.provider} variant="body2" color="text.secondary">
                    {provider.displayName}: {provider.unavailableLabel} · recovery score signal planned
                  </Typography>
                ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Alert severity="info" variant="outlined">
              {platformWorkspace.runtime === 'nativeShell'
                ? 'Recovery score is still not factored into readiness inside the native shell because no health-provider bridge is connected yet. The seam exists; the missing piece is real provider ingestion.'
                : 'Recovery score is not yet factored into readiness because no health provider is connected. When Fitbit or Apple Health integration lands, those signals can be normalized into the existing seam without pretending they already exist today.'}
            </Alert>
          </Grid>
        </Grid>
      </SurfaceCard>
    </Stack>
  )
}
