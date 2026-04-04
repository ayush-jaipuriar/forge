import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import FlagRoundedIcon from '@mui/icons-material/FlagRounded'
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded'
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { useMemo, useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
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
import { MissionCard } from '@/features/command-center/components/MissionCard'
import { MomentumPanel } from '@/features/command-center/components/MomentumPanel'
import { ProjectionPanel } from '@/features/command-center/components/ProjectionPanel'
import { StreakSummaryList } from '@/features/command-center/components/StreakSummaryList'
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
            'radial-gradient(circle at top right, rgba(212, 111, 60, 0.12), transparent 30%), linear-gradient(180deg, rgba(21, 27, 38, 0.98) 0%, rgba(11, 14, 21, 1) 100%)',
        }}
      >
        <Stack spacing={2.5}>
          <SectionHeader
            eyebrow="Command Center"
            title="Command Center"
            description="See the pattern, not just the day. This surface is where warnings, projections, trend shifts, and continuity signals become usable strategic judgment instead of disconnected charts."
            action={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                {primaryStatusChip ? <Chip label={primaryStatusChip.label} color={primaryStatusChip.color} size="small" /> : null}
                {isStale ? <Chip label="Snapshot stale" size="small" color="warning" /> : null}
                <Chip label={data.sourceLabel} size="small" />
              </Stack>
            }
          />

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.3fr) 320px' },
            }}
          >
            <Stack spacing={1.25}>
              <Typography variant="overline" color="primary.light">
                Strategic Summary
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', md: '3rem' },
                  maxWidth: 820,
                }}
              >
                {data.coachSummary.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820 }}>
                {data.coachSummary.summary}
              </Typography>
            </Stack>

            <Stack
              spacing={1.5}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 4,
                p: 2,
                backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.36),
              }}
            >
              <Stack spacing={0.85}>
                <Typography variant="overline" color="primary.light">
                  Observation Window
                </Typography>
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  {analyticsRollingWindowKeys.map((key) => (
                    <Button
                      key={key}
                      variant={windowKey === key ? 'contained' : 'outlined'}
                      color={windowKey === key ? 'primary' : 'inherit'}
                      size="small"
                      onClick={() => setWindowKey(key)}
                    >
                      {key.toUpperCase()}
                    </Button>
                  ))}
                </Stack>
              </Stack>
              <CompactInsight label="Window" value={windowKey.toUpperCase()} detail={data.sourceLabel} />
              <CompactInsight
                label="Momentum"
                value={`${data.momentum.score}/100`}
                detail={data.momentum.label}
              />
              <CompactInsight
                label="Projection"
                value={data.projection.statusLabel}
                detail={data.projection.summary}
              />
            </Stack>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            }}
          >
            {data.metrics.map((metric) => (
              <AnalyticsMetricTile
                key={metric.id}
                eyebrow={metric.eyebrow}
                value={metric.value}
                detail={metric.detail}
                tone={metric.tone === 'success' ? 'success' : metric.tone === 'warning' ? 'gold' : 'steel'}
              />
            ))}
          </Box>
        </Stack>
      </SurfaceCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5} sx={{ order: { xs: 2, lg: 1 } }}>
          <SurfaceCard
            eyebrow="Primary Diagnostics"
            title="The main pace and output questions"
            description="These charts carry the most strategic weight because they tell you whether readiness, score quality, and output are actually moving together."
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)' },
                }}
              >
                <ChartCard
                  eyebrow="Projection"
                  title="Projected readiness curve"
                  description="Pace toward the target date stays first because it is the main strategic question."
                  tone="gold"
                  state={data.readinessCurve.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <CurveChart data={data.readinessCurve} tone="gold" />
                </ChartCard>
                <ChartCard
                  eyebrow="Trend"
                  title="Daily score rhythm"
                  description="Projected score bars with earned-score markers keep drift and recoverability visible together."
                  tone="gold"
                  state={data.scoreTrend.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <MiniTrendChart data={data.scoreTrend} tone="gold" secondaryLabel="earned score" />
                </ChartCard>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 0.85fr) minmax(0, 1.15fr)' },
                }}
              >
                <ChartCard
                  eyebrow="Trend"
                  title="Deep work throughput"
                  description="Daily deep-block completions with prep-hour markers show where interview output is actually landing."
                  tone="ember"
                  state={data.deepWorkTrend.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <MiniTrendChart data={data.deepWorkTrend} tone="ember" secondaryLabel="prep hours" />
                </ChartCard>
                <ChartCard
                  eyebrow="Prep"
                  title="Prep hours by topic"
                  description="Tracked topic hours stay visible, but still honestly framed as topic-state-driven history."
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
              </Box>
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Support Analytics"
            title="Comparisons, context, and recovery balance"
            description="These panels support interpretation. They matter, but they should sit below the primary pace and output charts."
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                <ChartCard
                  eyebrow="Sleep"
                  title="Sleep vs performance"
                  description="This only becomes a true comparison once both sleep-met and sleep-missed buckets exist."
                  tone="gold"
                  state={sleepComparisonReady ? (isStale ? 'stale' : 'ready') : 'insufficientData'}
                  emptyTitle="Need both sleep-met and sleep-missed days"
                  emptyDescription="Logged sleep data is still too one-sided to support a meaningful comparison."
                >
                  <ComparisonBars
                    data={data.sleepPerformanceCorrelation}
                    tone="gold"
                    primaryLabel="prep"
                    secondaryLabel="score"
                  />
                </ChartCard>
                <ChartCard
                  eyebrow="Context"
                  title="WFO vs WFH comparison"
                  description="Execution quality across the two canonical workday shapes where the current data is structured enough to compare honestly."
                  tone="ember"
                  state={data.wfoWfhComparison.length < 2 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <ComparisonBars
                    data={data.wfoWfhComparison}
                    tone="ember"
                    primaryLabel="score"
                    secondaryLabel="deep"
                  />
                </ChartCard>
                <ChartCard
                  eyebrow="Pressure"
                  title="Time-window execution reliability"
                  description="This shows where blocks are most likely to land or drift without claiming deeper cognitive-performance scoring yet."
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
                <ChartCard
                  eyebrow="Balance"
                  title="Prep domain attention"
                  description="Approx prep hours allocated across focused domains inside the current rolling window."
                  tone="steel"
                  state={data.prepDomainBalance.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <DistributionBars data={data.prepDomainBalance} tone="steel" valueLabel="hours" />
                </ChartCard>
                <ChartCard
                  eyebrow="Recovery"
                  title="Gym vs productivity"
                  description="Workout-complete days versus workout-expected days that drifted. Correlation framing, not causal proof."
                  tone="success"
                  state={data.workoutProductivityCorrelation.length < 2 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <ComparisonBars
                    data={data.workoutProductivityCorrelation}
                    tone="success"
                    primaryLabel="prep"
                    secondaryLabel="score"
                  />
                </ChartCard>
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
              </Box>
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Continuity & Missions"
            title="What momentum is really built on"
            description="These surfaces explain whether consistency is compounding and whether the current missions are tied to real deficits instead of vanity goals."
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(320px, 0.95fr)' },
                }}
              >
                <ChartCard
                  eyebrow="Streak"
                  title="Execution streak calendar"
                  description="The calendar, streak counts, and break reasons now come from the formal shared discipline rules."
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
                    <StreakSummaryList streaks={data.streaks} />
                    <Typography variant="body2" color="text.secondary">
                      {data.streakCalendar.thresholdLabel}
                    </Typography>
                  </Stack>
                </ChartCard>

                <ChartCard
                  eyebrow="Missions"
                  title="Weekly pressure missions"
                  description="These missions are selected from deficits, not vanity goals."
                  tone="critical"
                  state={data.missions.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                  emptyTitle="Need more pressure signals before missions lock in"
                  emptyDescription="Forge avoids inventing missions until there is enough history to tie them to a real deficit or continuity risk."
                >
                  <Stack spacing={1.5}>
                    {data.missions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </Stack>
                </ChartCard>
              </Box>
            </Stack>
          </SurfaceCard>
        </Stack>

        <Stack spacing={2.5} sx={{ order: { xs: 1, lg: 2 } }}>
          <MomentumPanel momentum={data.momentum} posture={data.operatingTier} />

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
            description="These are the rule-backed pattern reads that explain why the charts and missions are pushing in a specific direction."
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

          <SurfaceCard
            eyebrow="Mission Posture"
            title="Why these missions exist"
            description="Missions should point back to leverage points, not easy completions."
            action={<FlagRoundedIcon color="warning" />}
          >
            <Stack spacing={1}>
              <PsychologyAltRoundedIcon
                color={
                  data.coachSummary.severity === 'critical'
                    ? 'error'
                    : data.coachSummary.severity === 'warning'
                      ? 'warning'
                      : 'primary'
                }
              />
              <Typography variant="body2" color="text.secondary">
                Missions are weighted toward deep-work continuity, recovery, neglected prep breadth, weekend usefulness, and WFO continuity. Low-friction logging alone cannot inflate this layer.
              </Typography>
            </Stack>
          </SurfaceCard>
        </Stack>
      </Box>
    </Stack>
  )
}

function CompactInsight({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Stack spacing={0.35}>
      <Typography variant="caption" color="primary.light">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  )
}
