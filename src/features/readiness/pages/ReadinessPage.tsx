import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { Alert, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { MetricTile } from '@/components/common/MetricTile'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { usePlatformWorkspace } from '@/features/platform/hooks/usePlatformWorkspace'
import { useReadinessWorkspace } from '@/features/readiness/hooks/useReadinessWorkspace'

export function ReadinessPage() {
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

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Readiness"
        title="Pressure should be visible, not abstract."
        description="Readiness is now derived from actual prep progress plus the target date, so this page shows a simple but honest view of pace and domain strength instead of a placeholder banner."
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Target Date" value={readinessSnapshot.targetDate} detail={`${readinessSnapshot.daysRemaining} days remaining`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Target Pressure" value={readinessSnapshot.pressureLevel} detail={readinessSnapshot.pressureLabel} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Coverage" value={`${readinessSnapshot.paceSnapshot.coveragePercent}%`} detail={`${readinessSnapshot.paceSnapshot.touchedTopicCount}/${readinessSnapshot.paceSnapshot.totalTopicCount} topics touched`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Required Pace" value={`${readinessSnapshot.paceSnapshot.requiredTopicsPerWeek}/wk`} detail={readinessSnapshot.paceSnapshot.paceLabel} />
        </Grid>
      </Grid>

      <SurfaceCard title={`Target Date: ${readinessSnapshot.targetDate}`}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TrendingUpRoundedIcon color="primary" />
          <Typography color="text.secondary">{readinessSnapshot.paceSnapshot.paceLabel}</Typography>
        </Stack>
      </SurfaceCard>

      {operationalSignals.length > 0 ? (
        <SurfaceCard
          eyebrow="Intervention Layer"
          title="Where readiness is actually under pressure"
          description="This page should make target risk and domain weakness visible enough to act on, without forcing you back into the full Command Center every time."
        >
          <Stack spacing={1.25}>
            {operationalSignals.map((signal) => (
              <OperationalSignalCard
                key={signal.id}
                title={signal.title}
                detail={signal.detail}
                tone={signal.tone}
                badge={signal.badge}
              />
            ))}
          </Stack>
        </SurfaceCard>
      ) : null}

      <Grid container spacing={2}>
        {readinessSnapshot.domainStates.map((domain) => (
          <Grid key={domain.domain} size={{ xs: 12, md: 6, xl: 4 }}>
            <SurfaceCard
              eyebrow="Domain Readiness"
              title={domain.label}
              description={`Current readiness reads ${domain.readinessLevel}. This is still a Phase 1 simplification driven by confidence, coverage, and logged effort.`}
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

      {data.focusedDomains.length > 0 ? (
        <SurfaceCard
          eyebrow="Today's Pressure Points"
          title="Focused domains under execution pressure"
          description="These are the prep domains most directly connected to today's generated plan and current block priorities."
        >
          <Stack spacing={1}>
            {data.focusedDomains.map((domain) => (
              <Typography key={domain.domain} variant="body2" color="text.secondary">
                {domain.label} · readiness {domain.readinessLevel}
              </Typography>
            ))}
          </Stack>
        </SurfaceCard>
      ) : null}

      <SurfaceCard
        eyebrow="Recovery Signal Scaffolding"
        title="Future health provider contribution points"
        description="Readiness scoring in Phase 3 is based on prep coverage, confidence, and pace against the target date. Future phases will add recovery signal weighting from connected providers."
      >
        <Stack spacing={1.25}>
          <Typography variant="body2" color="text.secondary">
            {healthWorkspace.statusSummaryLabel}
          </Typography>
          {healthWorkspace.providers
            .filter((p) => p.supportedSignalCount > 0)
            .slice(0, 2)
            .map((provider) => (
              <Typography key={provider.provider} variant="body2" color="text.secondary">
                {provider.displayName}: {provider.unavailableLabel} · recovery score signal planned
              </Typography>
            ))}
          <Alert severity="info" variant="outlined">
            {platformWorkspace.runtime === 'nativeShell'
              ? 'Recovery Score is still not factored into readiness, even inside the native shell, because no health provider bridge is connected yet. The typed seam already exists; the missing piece is real native provider ingestion.'
              : 'Recovery Score is not yet factored into readiness because no health provider is connected. When Fitbit or Apple Health integration lands, recovery signals will be normalized and weighted into the readiness model through a typed seam that already exists in the domain layer.'}
          </Alert>
        </Stack>
      </SurfaceCard>
    </Stack>
  )
}
