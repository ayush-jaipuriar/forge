import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded'
import { useMemo, useState } from 'react'
import { Box, Button, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { analyticsRollingWindowKeys, type AnalyticsRollingWindowKey } from '@/domain/analytics/types'
import { hasMeaningfulSleepPerformanceComparison } from '@/domain/analytics/chartData'
import { AnalyticsMetricTile } from '@/features/command-center/components/AnalyticsMetricTile'
import { AnalyticsStateNotice } from '@/features/command-center/components/AnalyticsStateNotice'
import { ChartCard } from '@/features/command-center/components/ChartCard'
import { ComparisonBars } from '@/features/command-center/components/ComparisonBars'
import { CurveChart } from '@/features/command-center/components/CurveChart'
import { DistributionBars } from '@/features/command-center/components/DistributionBars'
import { HeatmapCalendar } from '@/features/command-center/components/HeatmapCalendar'
import { InsightCard } from '@/features/command-center/components/InsightCard'
import { MiniTrendChart } from '@/features/command-center/components/MiniTrendChart'
import { ProjectionPanel } from '@/features/command-center/components/ProjectionPanel'
import { WarningCard } from '@/features/command-center/components/WarningCard'
import { useCommandCenterWorkspace } from '@/features/command-center/hooks/useCommandCenterWorkspace'

export function CommandCenterPage() {
  const [windowKey, setWindowKey] = useState<AnalyticsRollingWindowKey>('30d')
  const { data, error, isError, isLoading, isStale } = useCommandCenterWorkspace(windowKey)

  const primaryStatusChip = useMemo(() => {
    if (!data) {
      return null
    }

    if (data.dataState === 'empty') {
      return { label: 'Waiting for history', color: 'warning' as const }
    }

    if (data.dataState === 'limited') {
      return { label: 'Directional only', color: 'default' as const }
    }

    return { label: 'Pattern window ready', color: 'success' as const }
  }, [data])
  const sleepComparisonReady = hasMeaningfulSleepPerformanceComparison(data?.sleepPerformanceCorrelation ?? [])

  if (isError) {
    return (
      <SurfaceCard
        title="Command Center could not load"
        description="Forge hit a real analytics-workspace failure. This state should be explicit so data and storage issues do not masquerade as loading."
        action={<ErrorOutlineRoundedIcon color="error" />}
      >
        <AnalyticsStateNotice
          title="Analytics workspace failed"
          description={
            error instanceof Error
              ? error.message
              : 'The rolling analytics workspace could not be assembled from local history and settings.'
          }
          tone="critical"
          kind="stale"
        />
      </SurfaceCard>
    )
  }

  if (isLoading || !data) {
    return (
      <SurfaceCard
        title="Loading Command Center"
        description="Forge is assembling the rolling analytics workspace and preparing the first desktop-grade command layout."
      >
        <Stack spacing={2} alignItems="center" py={3}>
          <CircularProgress color="primary" />
          <AnalyticsStateNotice
            title="Building the analytics surface"
            description="This stage is reading historical day instances and translating them into chart-ready signals."
            tone="gold"
            kind="loading"
          />
        </Stack>
      </SurfaceCard>
    )
  }

  return (
    <Stack spacing={3}>
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at top right, rgba(77, 96, 122, 0.22), transparent 32%), linear-gradient(180deg, rgba(18, 24, 36, 0.98) 0%, rgba(9, 11, 18, 1) 100%)',
        }}
      >
        <SectionHeader
          eyebrow="Analytics Cockpit"
          title="Command Center"
          description="See the pattern, not just the day. This surface is desktop-heavy by design so trends, projections, warnings, and pressure signals can sit together without collapsing into a toy dashboard."
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              {primaryStatusChip ? <Chip label={primaryStatusChip.label} color={primaryStatusChip.color} size="small" /> : null}
              {isStale ? <Chip label="Snapshot stale" size="small" color="warning" /> : null}
              <Chip label={`Source ${data.sourceLabel}`} size="small" />
            </Stack>
          }
        />
      </SurfaceCard>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'stretch', lg: 'center' }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {analyticsRollingWindowKeys.map((key) => (
            <Button
              key={key}
              variant={windowKey === key ? 'contained' : 'outlined'}
              color={windowKey === key ? 'primary' : 'inherit'}
              onClick={() => setWindowKey(key)}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Rolling windows matter because pattern detection is only as honest as the observation frame it is using.
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {data.metrics.map((metric) => (
          <Grid key={metric.id} size={{ xs: 12, sm: 6, xl: 3 }}>
            <AnalyticsMetricTile
              eyebrow={metric.eyebrow}
              value={metric.value}
              detail={metric.detail}
              tone={metric.tone === 'success' ? 'success' : metric.tone === 'warning' ? 'gold' : 'steel'}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <Stack spacing={2.5}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <ChartCard
                  eyebrow="Projection"
                  title="Projected readiness curve"
                  description="This is the lead chart in the Command Center because pace toward the target date is the main strategic question."
                  tone="gold"
                  state={data.readinessCurve.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <CurveChart data={data.readinessCurve} tone="gold" />
                </ChartCard>
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <ChartCard
                  eyebrow="Trend"
                  title="Daily score rhythm"
                  description="Projected score bars with earned-score markers, so drift and recoverability stay visible at the same time."
                  tone="gold"
                  state={data.scoreTrend.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <MiniTrendChart data={data.scoreTrend} tone="gold" secondaryLabel="earned score" />
                </ChartCard>
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <ChartCard
                  eyebrow="Trend"
                  title="Deep work throughput"
                  description="Daily deep-block completions with prep-hour markers to show where interview output is actually landing."
                  tone="ember"
                  state={data.deepWorkTrend.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <MiniTrendChart data={data.deepWorkTrend} tone="ember" secondaryLabel="prep hours" />
                </ChartCard>
              </Grid>
              <Grid size={{ xs: 12, lg: 7 }}>
                <ChartCard
                  eyebrow="Prep"
                  title="Prep hours by topic"
                  description="Cumulative tracked topic hours from the current prep-progress model. This is honest about being topic-state-driven rather than fully event-timestamped history."
                  tone="ember"
                  state={data.prepTopicHours.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <DistributionBars
                    data={data.prepTopicHours.map((entry) => ({
                      key: entry.key,
                      label: `${entry.label} · ${entry.domain}`,
                      value: entry.hours,
                      secondaryValue: undefined,
                      percent: undefined,
                    }))}
                    tone="ember"
                    valueLabel="hours"
                  />
                </ChartCard>
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  eyebrow="Sleep"
                  title="Sleep vs performance"
                  description="Average prep and projected score grouped by logged sleep outcomes. This only becomes a true comparison once both met and missed sleep buckets exist."
                  tone="steel"
                  state={sleepComparisonReady ? (isStale ? 'stale' : 'ready') : 'insufficientData'}
                  emptyTitle="Need both sleep-met and sleep-missed days"
                  emptyDescription="Logged sleep data is still too one-sided to support a meaningful comparison. Unknown sleep entries can add context, but they should not stand in for a real comparison bucket."
                >
                  <ComparisonBars
                    data={data.sleepPerformanceCorrelation}
                    tone="steel"
                    primaryLabel="prep"
                    secondaryLabel="score"
                  />
                </ChartCard>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  eyebrow="Context"
                  title="WFO vs WFH comparison"
                  description="This view compares execution quality across the two canonical workday shapes where Phase 1 data is actually structured enough to support it."
                  tone="gold"
                  state={data.wfoWfhComparison.length < 2 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <ComparisonBars
                    data={data.wfoWfhComparison}
                    tone="gold"
                    primaryLabel="score"
                    secondaryLabel="deep"
                  />
                </ChartCard>
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  eyebrow="Pressure"
                  title="Time-window execution reliability"
                  description="This is currently a completion-stability view by time band. It highlights where blocks are most likely to land or drift without claiming deeper cognitive-performance scoring yet."
                  tone="critical"
                  state={data.timeWindowPerformance.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <ComparisonBars
                    data={data.timeWindowPerformance}
                    tone="critical"
                    primaryLabel="% complete"
                    secondaryLabel="% skipped"
                  />
                </ChartCard>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  eyebrow="Balance"
                  title="Prep domain attention"
                  description="Approx prep hours allocated across focused domains inside this rolling window. This stays window-aware without pretending historical per-topic logging is deeper than it is."
                  tone="steel"
                  state={data.prepDomainBalance.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <DistributionBars data={data.prepDomainBalance} tone="steel" valueLabel="hours" />
                </ChartCard>
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  eyebrow="Recovery"
                  title="Gym vs productivity"
                  description="Workout-complete days versus workout-expected days that drifted. This is correlation framing, not causal proof."
                  tone="success"
                  state={
                    data.workoutProductivityCorrelation.length < 2 ? 'insufficientData' : isStale ? 'stale' : 'ready'
                  }
                >
                  <ComparisonBars
                    data={data.workoutProductivityCorrelation}
                    tone="success"
                    primaryLabel="prep"
                    secondaryLabel="score"
                  />
                </ChartCard>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  eyebrow="Density"
                  title="Daily completion heatmap"
                  description="A six-week execution-density view for seeing clumps of drift, strong recovery runs, and dead zones at a glance."
                  tone="ember"
                  state={
                    data.completionHeatmap.every((cell) => cell.intensity === 0)
                      ? 'insufficientData'
                      : isStale
                        ? 'stale'
                        : 'ready'
                  }
                >
                  <HeatmapCalendar cells={data.completionHeatmap} tone="ember" />
                </ChartCard>
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  eyebrow="Streak"
                  title="Execution streak calendar"
                  description="This is a Milestone 5 precursor to the formal streak engine: it shows strong execution days using a clear temporary threshold instead of pretending the full streak system already exists."
                  tone="gold"
                  state={
                    data.streakCalendar.cells.every((cell) => cell.status === 'none')
                      ? 'insufficientData'
                      : isStale
                        ? 'stale'
                        : 'ready'
                  }
                >
                  <Stack spacing={1.5}>
                    <HeatmapCalendar cells={data.streakCalendar.cells} tone="gold" />
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip label={`Current streak ${data.streakCalendar.currentStreak}`} size="small" />
                      <Chip label={`Longest streak ${data.streakCalendar.longestStreak}`} size="small" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {data.streakCalendar.thresholdLabel}
                    </Typography>
                  </Stack>
                </ChartCard>
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Stack spacing={2.5}>
            <ProjectionPanel projection={data.projection} />

            <SurfaceCard
              eyebrow="Risk Stack"
              title="What needs intervention now"
              description="Warnings belong beside projections because an analytics cockpit is only useful if it points back toward action."
              action={<TrackChangesRoundedIcon color="warning" />}
            >
              <Stack spacing={1.5}>
                {data.warnings.length === 0 ? (
                  <AnalyticsStateNotice
                    title="No active warning cards"
                    description="Either the window is still young or the current risk rules are not seeing a clear intervention target."
                    tone="success"
                    kind="insufficientData"
                  />
                ) : (
                  data.warnings.map((warning) => <WarningCard key={warning.id} warning={warning} />)
                )}
              </Stack>
            </SurfaceCard>

            <SurfaceCard
              eyebrow="Insight Stack"
              title="Emerging signals"
              description="These are still lightweight heuristics in Milestone 4, but the card system is now ready for the deeper pattern engine."
              action={<DashboardRoundedIcon color="primary" />}
            >
              <Stack spacing={1.5}>
                {data.insights.length === 0 ? (
                  <AnalyticsStateNotice
                    title="Insights need more history"
                    description="Forge avoids pretending certainty when the observation window is too shallow."
                    tone="steel"
                    kind="insufficientData"
                  />
                ) : (
                  data.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
                )}
              </Stack>
            </SurfaceCard>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ display: { xs: 'block', xl: 'none' } }}>
        <Typography variant="body2" color="text.secondary">
          Desktop is still the native mode for this surface. Mobile should degrade honestly into stacked panels, not fake a mini dashboard.
        </Typography>
      </Box>
    </Stack>
  )
}
