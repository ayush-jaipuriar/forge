import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { alpha } from '@mui/material/styles'
import { Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { forgeTokens } from '@/app/theme/tokens'
import { EmptyState } from '@/components/common/EmptyState'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { analyticsRollingWindowKeys, type AnalyticsRollingWindowKey } from '@/domain/analytics/types'
import { hasMeaningfulSleepPerformanceComparison } from '@/domain/analytics/chartData'
import { ChartCard } from '@/features/command-center/components/ChartCard'
import { ComparisonBars } from '@/features/command-center/components/ComparisonBars'
import { CurveChart } from '@/features/command-center/components/CurveChart'
import { DistributionBars } from '@/features/command-center/components/DistributionBars'
import { HeatmapCalendar } from '@/features/command-center/components/HeatmapCalendar'
import { MiniTrendChart } from '@/features/command-center/components/MiniTrendChart'
import { MissionCard } from '@/features/command-center/components/MissionCard'
import { StreakSummaryList } from '@/features/command-center/components/StreakSummaryList'
import { useCommandCenterWorkspace } from '@/features/command-center/hooks/useCommandCenterWorkspace'
import { useReadinessWorkspace } from '@/features/readiness/hooks/useReadinessWorkspace'
import type {
  CommandCenterInsight,
  CommandCenterWarning,
  CommandCenterWorkspace,
} from '@/services/analytics/commandCenterWorkspaceService'
import type { getReadinessWorkspace } from '@/services/readiness/readinessPersistenceService'
import { useState } from 'react'

type ReadinessWorkspace = Awaited<ReturnType<typeof getReadinessWorkspace>>

type InsightMetricProps = {
  eyebrow: string
  value: string
  detail: string
  tone?: 'neutral' | 'success' | 'warning'
}

export function InsightsPage() {
  const [searchParams] = useSearchParams()
  const [windowKey, setWindowKey] = useState<AnalyticsRollingWindowKey>('30d')
  const requestedFocus = searchParams.get('view') === 'readiness' ? 'readiness' : 'weekly'
  const analyticsQuery = useCommandCenterWorkspace(windowKey)
  const readinessQuery = useReadinessWorkspace()

  if (analyticsQuery.isError || readinessQuery.isError) {
    const error = analyticsQuery.error ?? readinessQuery.error

    return (
      <SurfaceCard
        eyebrow="Insights"
        title="Insights could not load"
        description="Forge could not assemble the current pattern view."
        action={<ErrorOutlineRoundedIcon color="error" />}
      >
        <EmptyState
          title="Pattern view unavailable"
          description={
            error instanceof Error
              ? error.message
              : 'Forge could not read recent history and prep progress.'
          }
          icon={<ErrorOutlineRoundedIcon />}
          tone="error"
        />
      </SurfaceCard>
    )
  }

  if (analyticsQuery.isLoading || readinessQuery.isLoading || !analyticsQuery.data || !readinessQuery.data) {
    return (
      <SurfaceCard eyebrow="Insights" title="Loading insights" description="Reading recent history and prep progress.">
        <EmptyState
          title="Building insights"
          description="This should only take a moment."
          tone="warning"
          loading
          align="center"
        />
      </SurfaceCard>
    )
  }

  return (
    <UnifiedInsightsSurface
      analytics={analyticsQuery.data}
      readiness={readinessQuery.data}
      windowKey={windowKey}
      requestedFocus={requestedFocus}
      isStale={analyticsQuery.isStale || readinessQuery.isStale}
      onWindowKeyChange={setWindowKey}
    />
  )
}

function UnifiedInsightsSurface({
  analytics,
  readiness,
  windowKey,
  requestedFocus,
  isStale,
  onWindowKeyChange,
}: {
  analytics: CommandCenterWorkspace
  readiness: ReadinessWorkspace
  windowKey: AnalyticsRollingWindowKey
  requestedFocus: 'weekly' | 'readiness'
  isStale: boolean
  onWindowKeyChange: (windowKey: AnalyticsRollingWindowKey) => void
}) {
  const readinessSnapshot = readiness.readinessSnapshot
  const focusedDomain = readiness.focusedDomains[0]
  const sleepComparisonReady = hasMeaningfulSleepPerformanceComparison(analytics.sleepPerformanceCorrelation)
  const statusChip = getStatusChip(analytics)
  const activeSignalCount = analytics.warnings.length + readiness.operationalSignals.length

  return (
    <Stack spacing={3} data-insights-focus={requestedFocus}>
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at top right, rgba(212, 111, 60, 0.16), transparent 32%), linear-gradient(180deg, rgba(21, 27, 38, 0.98) 0%, rgba(11, 14, 21, 1) 100%)',
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack spacing={0.9} maxWidth={760}>
              <Typography
                variant="overline"
                color="primary.light"
                sx={{
                  fontSize: '0.66rem',
                  letterSpacing: '0.2em',
                }}
              >
                Insights
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  maxWidth: 760,
                  fontSize: { xs: '2.25rem', sm: '2.7rem', md: '3rem' },
                  lineHeight: 0.96,
                  letterSpacing: 0,
                }}
              >
                {cleanCopy(analytics.coachSummary.title)}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                {cleanCopy(analytics.coachSummary.summary)}
              </Typography>
            </Stack>
            <Box sx={{ flexShrink: 0 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Chip label={statusChip.label} color={statusChip.color} size="small" />
                {isStale ? <Chip label="Stale" size="small" color="warning" /> : null}
                <Chip label={analytics.sourceLabel} size="small" />
              </Stack>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' },
              alignItems: 'stretch',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
              }}
            >
              <InsightMetric
                eyebrow="Momentum"
                value={`${analytics.momentum.score}/100`}
                detail={cleanCopy(analytics.momentum.label)}
                tone={analytics.momentum.score >= 70 ? 'success' : analytics.momentum.score > 0 ? 'neutral' : 'warning'}
              />
              <InsightMetric
                eyebrow="Readiness"
                value={`${readinessSnapshot.paceSnapshot.coveragePercent}%`}
                detail={`${readinessSnapshot.daysRemaining} days to target`}
                tone={readinessSnapshot.paceSnapshot.paceLevel === 'behind' ? 'warning' : 'neutral'}
              />
              <InsightMetric
                eyebrow="History"
                value={`${analytics.trackedDays}`}
                detail={`Tracked days in ${windowKey.toUpperCase()}`}
                tone={analytics.dataState === 'ready' ? 'success' : 'warning'}
              />
              <InsightMetric
                eyebrow="Signals"
                value={`${activeSignalCount}`}
                detail={activeSignalCount > 0 ? 'Need review' : 'No acute flags'}
                tone={activeSignalCount > 0 ? 'warning' : 'success'}
              />
            </Box>

            <Stack
              spacing={1.4}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 4,
                p: 2,
                backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.38),
              }}
            >
              <Typography variant="overline" color="primary.light">
                Window
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {analyticsRollingWindowKeys.map((key) => (
                  <Button
                    key={key}
                    variant={windowKey === key ? 'contained' : 'outlined'}
                    color={windowKey === key ? 'primary' : 'inherit'}
                    size="small"
                    onClick={() => onWindowKeyChange(key)}
                  >
                    {key.toUpperCase()}
                  </Button>
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Change the history window.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </SurfaceCard>

      <Stack spacing={2.5} sx={{ display: { xs: 'flex', lg: 'none' } }}>
        <ReadinessPaceCard readiness={readiness} focusedDomain={focusedDomain} />
        <RiskPanel warnings={analytics.warnings} operationalSignals={readiness.operationalSignals} limit={3} />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5} sx={{ minWidth: 0, order: 1 }}>
          <SurfaceCard
            eyebrow="Primary signals"
            title="Pace, score, and output"
            description="The fastest read on whether the plan is moving."
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)' },
                }}
              >
                <ChartCard
                  eyebrow="Target"
                  title="Projected readiness curve"
                  description="Progress toward the target date."
                  tone="gold"
                  state={analytics.readinessCurve.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <CurveChart data={analytics.readinessCurve} tone="gold" />
                </ChartCard>
                <ChartCard
                  eyebrow="Score"
                  title="Daily score rhythm"
                  description="Projected score with earned-score markers."
                  tone="gold"
                  state={analytics.scoreTrend.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <MiniTrendChart data={analytics.scoreTrend} tone="gold" secondaryLabel="earned score" />
                </ChartCard>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', xl: 'minmax(280px, 0.85fr) minmax(0, 1.15fr)' },
                }}
              >
                <ChartCard
                  eyebrow="Output"
                  title="Deep work throughput"
                  description="Deep blocks alongside prep-hour markers."
                  tone="ember"
                  state={analytics.deepWorkTrend.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <MiniTrendChart data={analytics.deepWorkTrend} tone="ember" secondaryLabel="prep hours" />
                </ChartCard>
                <ChartCard
                  eyebrow="Prep"
                  title="Prep hours by topic"
                  description="Topic effort inside the selected window."
                  tone="ember"
                  state={analytics.prepTopicHours.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                >
                  <DistributionBars
                    data={analytics.prepTopicHours.map((entry) => ({
                      key: entry.key,
                      label: `${entry.label} - ${entry.domain}`,
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
            eyebrow="Explanations"
            title="What may be driving the pattern"
            description="Context for the main trend."
          >
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <ChartCard
                eyebrow="Sleep"
                title="Sleep vs performance"
                description="Useful only after both sleep-met and sleep-missed days exist."
                tone="gold"
                state={sleepComparisonReady ? (isStale ? 'stale' : 'ready') : 'insufficientData'}
                emptyTitle="Need both sleep states"
                emptyDescription="The current history is still too one-sided for this comparison."
              >
                <ComparisonBars
                  data={analytics.sleepPerformanceCorrelation}
                  tone="gold"
                  primaryLabel="prep"
                  secondaryLabel="score"
                />
              </ChartCard>
              <ChartCard
                eyebrow="Context"
                title="WFO vs WFH"
                description="Execution quality across the two workday shapes."
                tone="ember"
                state={analytics.wfoWfhComparison.length < 2 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
              >
                <ComparisonBars
                  data={analytics.wfoWfhComparison}
                  tone="ember"
                  primaryLabel="score"
                  secondaryLabel="deep"
                />
              </ChartCard>
              <ChartCard
                eyebrow="Timing"
                title="Block reliability"
                description="Where planned blocks tend to land or drift."
                tone="critical"
                state={analytics.timeWindowPerformance.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
              >
                <ComparisonBars
                  data={analytics.timeWindowPerformance}
                  tone="critical"
                  primaryLabel="% complete"
                  secondaryLabel="% skipped"
                />
              </ChartCard>
              <ChartCard
                eyebrow="Balance"
                title="Prep domain attention"
                description="Prep hours across focus domains."
                tone="steel"
                state={analytics.prepDomainBalance.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
              >
                <DistributionBars data={analytics.prepDomainBalance} tone="steel" valueLabel="hours" />
              </ChartCard>
              <ChartCard
                eyebrow="Recovery"
                title="Workout vs productivity"
                description="A correlation read, not a causal claim."
                tone="success"
                state={analytics.workoutProductivityCorrelation.length < 2 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
              >
                <ComparisonBars
                  data={analytics.workoutProductivityCorrelation}
                  tone="success"
                  primaryLabel="prep"
                  secondaryLabel="score"
                />
              </ChartCard>
              <ChartCard
                eyebrow="Density"
                title="Completion heatmap"
                description="A compact view of strong runs and dead zones."
                tone="ember"
                state={
                  analytics.completionHeatmap.every((cell) => cell.intensity === 0)
                    ? 'insufficientData'
                    : isStale
                      ? 'stale'
                      : 'ready'
                }
              >
                <HeatmapCalendar cells={analytics.completionHeatmap} tone="ember" />
              </ChartCard>
            </Box>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Readiness map"
            title="Coverage and confidence"
            description="Where prep is strong or thin."
          >
            <DomainReadinessGrid readiness={readiness} />
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Continuity"
            title="Streaks and missions"
            description="Consistency and active focus areas."
          >
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) minmax(320px, 0.95fr)' },
              }}
            >
              <ChartCard
                eyebrow="Streak"
                title="Execution streak calendar"
                description="Recent continuity at a glance."
                tone="gold"
                state={
                  analytics.streakCalendar.cells.every((cell) => cell.status === 'none')
                    ? 'insufficientData'
                    : isStale
                      ? 'stale'
                      : 'ready'
                }
              >
                <Stack spacing={1.5}>
                  <HeatmapCalendar cells={analytics.streakCalendar.cells} tone="gold" />
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`Current ${analytics.streakCalendar.currentStreak}`} size="small" />
                    <Chip label={`Longest ${analytics.streakCalendar.longestStreak}`} size="small" />
                  </Stack>
                  <StreakSummaryList streaks={analytics.streaks} />
                </Stack>
              </ChartCard>

              <ChartCard
                eyebrow="Missions"
                title="Weekly missions"
                description="Only shown when history supports them."
                tone="critical"
                state={analytics.missions.length === 0 ? 'insufficientData' : isStale ? 'stale' : 'ready'}
                emptyTitle="No mission locked yet"
                emptyDescription="Forge waits for enough evidence before naming a mission."
              >
                <Stack spacing={1.5}>
                  {analytics.missions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </Stack>
              </ChartCard>
            </Box>
          </SurfaceCard>
        </Stack>

        <Stack spacing={2.5} sx={{ minWidth: 0, order: 2 }}>
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <ReadinessPaceCard readiness={readiness} focusedDomain={focusedDomain} />
          </Box>
          <MomentumCard analytics={analytics} />
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <RiskPanel warnings={analytics.warnings} operationalSignals={readiness.operationalSignals} />
          </Box>
          <PatternPanel insights={analytics.insights} />
          <RecoveryBoundary readiness={readiness} />
        </Stack>
      </Box>
    </Stack>
  )
}

function InsightMetric({ eyebrow, value, detail, tone = 'neutral' }: InsightMetricProps) {
  const toneColor =
    tone === 'success'
      ? forgeTokens.palette.accent.success
      : tone === 'warning'
        ? forgeTokens.palette.accent.warning
        : forgeTokens.palette.accent.steel

  return (
    <Stack
      spacing={0.8}
      sx={{
        minHeight: { xs: 116, md: 132 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        p: { xs: 1.6, md: 2 },
        background: `linear-gradient(180deg, ${alpha(forgeTokens.palette.background.panel, 0.96)} 0%, ${alpha(forgeTokens.palette.background.surface, 0.96)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInline: 0,
          insetBlockStart: 0,
          height: 2,
          background: `linear-gradient(90deg, ${alpha(toneColor, 0.9)} 0%, ${alpha(toneColor, 0)} 100%)`,
        },
      }}
    >
      <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '0.18em' }}>
        {eyebrow}
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: '1.35rem', md: '1.55rem' } }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
        {detail}
      </Typography>
    </Stack>
  )
}

function ReadinessPaceCard({
  readiness,
  focusedDomain,
}: {
  readiness: ReadinessWorkspace
  focusedDomain: ReadinessWorkspace['focusedDomains'][number] | undefined
}) {
  const snapshot = readiness.readinessSnapshot
  const paceTone = snapshot.paceSnapshot.paceLevel === 'behind' ? 'warning' : 'primary'

  return (
    <SurfaceCard
      eyebrow="Readiness pace"
      title={cleanCopy(snapshot.pressureLabel)}
      description={cleanCopy(snapshot.paceSnapshot.paceLabel)}
      action={<TimelineRoundedIcon color={paceTone} />}
    >
      <Stack spacing={1.6}>
        <LinearProgress
          variant="determinate"
          value={Math.min(snapshot.paceSnapshot.coveragePercent, 100)}
          color={snapshot.paceSnapshot.paceLevel === 'behind' ? 'warning' : 'success'}
          sx={{ height: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' }}
        />
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          }}
        >
          <SmallFact label="Target" value={snapshot.targetDate} />
          <SmallFact label="Left" value={`${snapshot.daysRemaining}d`} />
          <SmallFact label="Coverage" value={`${snapshot.paceSnapshot.coveragePercent}%`} />
          <SmallFact label="Required" value={`${snapshot.paceSnapshot.requiredTopicsPerWeek}/wk`} />
        </Box>
        {focusedDomain ? (
          <Typography variant="body2" color="text.secondary">
            Current focus: {focusedDomain.label} is {focusedDomain.readinessLevel}.
          </Typography>
        ) : null}
      </Stack>
    </SurfaceCard>
  )
}

function MomentumCard({ analytics }: { analytics: CommandCenterWorkspace }) {
  return (
    <SurfaceCard
      eyebrow="Momentum"
      title={analytics.momentum.label}
      description={cleanCopy(analytics.momentum.explanation)}
      action={<AutoGraphRoundedIcon color="primary" />}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="h2" sx={{ fontSize: '2.35rem' }}>
            {analytics.momentum.score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /100
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={analytics.momentum.score}
          color={analytics.momentum.score >= 70 ? 'success' : analytics.momentum.score > 0 ? 'primary' : 'warning'}
          sx={{ height: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' }}
        />
      </Stack>
    </SurfaceCard>
  )
}

function RiskPanel({
  warnings,
  operationalSignals,
  limit = 4,
}: {
  warnings: CommandCenterWarning[]
  operationalSignals: ReadinessWorkspace['operationalSignals']
  limit?: number
}) {
  const hasSignals = warnings.length > 0 || operationalSignals.length > 0
  const warningLimit = Math.min(warnings.length, Math.ceil(limit / 2))
  const visibleWarnings = warnings.slice(0, warningLimit)
  const visibleOperationalSignals = operationalSignals.slice(0, Math.max(limit - visibleWarnings.length, 0))
  const visibleCount = visibleWarnings.length + visibleOperationalSignals.length
  const hiddenCount = warnings.length + operationalSignals.length - visibleCount

  return (
    <SurfaceCard
      eyebrow="Risks"
      title={hasSignals ? 'Needs attention' : 'No acute flags'}
      description="The few items worth reviewing."
      action={<WarningAmberRoundedIcon color={hasSignals ? 'warning' : 'success'} />}
    >
      <Stack spacing={1.25}>
        {hasSignals ? (
          <>
            {visibleWarnings.map((warning) => (
              <WarningSummary key={warning.id} warning={warning} />
            ))}
            {visibleOperationalSignals.map((signal) => (
              <OperationalSignalCard
                key={signal.id}
                title={signal.title}
                detail={signal.detail}
                tone={signal.tone}
                badge={signal.badge}
              />
            ))}
            {hiddenCount > 0 ? (
              <Typography variant="body2" color="text.secondary">
                Showing top {visibleCount} of {visibleCount + hiddenCount}.
              </Typography>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Nothing urgent"
            description="No warning-level signals in this window."
            tone="success"
            compact
          />
        )}
      </Stack>
    </SurfaceCard>
  )
}

function WarningSummary({ warning }: { warning: CommandCenterWarning }) {
  const toneColor =
    warning.severity === 'critical'
      ? forgeTokens.palette.accent.critical
      : warning.severity === 'warning'
        ? forgeTokens.palette.accent.warning
        : forgeTokens.palette.accent.steel

  return (
    <Stack
      spacing={0.85}
      sx={{
        border: '1px solid',
        borderColor: alpha(toneColor, 0.36),
        borderRadius: 3,
        p: 1.75,
        backgroundColor: alpha(toneColor, 0.08),
      }}
    >
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
        <Typography variant="subtitle2">{warning.title}</Typography>
        <Chip label={warning.confidence} size="small" sx={{ color: toneColor }} />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {cleanCopy(warning.detail)}
      </Typography>
    </Stack>
  )
}

function PatternPanel({ insights }: { insights: CommandCenterInsight[] }) {
  return (
    <SurfaceCard
      eyebrow="Patterns"
      title={insights.length > 0 ? 'Emerging reads' : 'Need more history'}
      description="Plain reads from recent history."
    >
      <Stack spacing={1.25}>
        {insights.length > 0 ? (
          insights.map((insight) => <InsightSummary key={insight.id} insight={insight} />)
        ) : (
          <EmptyState
            title="No reliable read yet"
            description="Forge will add patterns after more tracked days accumulate."
            tone="info"
            compact
          />
        )}
      </Stack>
    </SurfaceCard>
  )
}

function InsightSummary({ insight }: { insight: CommandCenterInsight }) {
  return (
    <Stack
      spacing={0.85}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 1.75,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.42),
      }}
    >
      <Typography variant="subtitle2">{insight.title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {cleanCopy(insight.summary)}
      </Typography>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        <Chip label={insight.confidence} size="small" />
        {insight.supportingEvidence.slice(0, 2).map((item) => (
          <Chip key={item} label={item} size="small" />
        ))}
      </Stack>
    </Stack>
  )
}

function DomainReadinessGrid({ readiness }: { readiness: ReadinessWorkspace }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
      }}
    >
      {readiness.readinessSnapshot.domainStates.map((domain) => (
        <Stack
          key={domain.domain}
          spacing={1}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 1.75,
            backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.34),
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
            <Typography variant="subtitle2">{domain.label}</Typography>
            <Chip label={domain.readinessLevel} size="small" />
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gap: 0.75,
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            }}
          >
            <SmallFact label="Topics" value={`${domain.touchedTopicCount}/${domain.totalTopicCount}`} />
            <SmallFact label="Strong" value={`${domain.highConfidenceCount}`} />
            <SmallFact label="Hours" value={`${domain.hoursSpent.toFixed(1)}h`} />
          </Box>
        </Stack>
      ))}
    </Box>
  )
}

function RecoveryBoundary({ readiness }: { readiness: ReadinessWorkspace }) {
  const connectedProviders = readiness.healthIntegration.providers.filter((provider) => provider.supportedSignalCount > 0)

  return (
    <SurfaceCard
      eyebrow="Recovery data"
      title="Provider status"
      description={readiness.healthIntegration.statusSummaryLabel}
    >
      <Stack spacing={1}>
        {connectedProviders.length > 0 ? (
          connectedProviders.slice(0, 2).map((provider) => (
            <Typography key={provider.provider} variant="body2" color="text.secondary">
              {provider.displayName}: {provider.unavailableLabel}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Health signals are not included until a real provider is connected.
          </Typography>
        )}
      </Stack>
    </SurfaceCard>
  )
}

function SmallFact({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.35}>
      <Typography variant="caption" color="primary.light">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  )
}

function getStatusChip(data: CommandCenterWorkspace): { label: string; color: 'default' | 'success' | 'warning' } {
  if (data.dataState === 'empty') {
    return { label: 'Needs history', color: 'warning' }
  }

  if (data.dataState === 'limited') {
    return { label: 'Directional', color: 'default' }
  }

  return { label: 'Current', color: 'success' }
}

function cleanCopy(copy: string) {
  return copy
    .replaceAll('Command Center', 'Insights')
    .replaceAll('command center', 'insights')
    .replaceAll('operating tier', 'momentum read')
    .replaceAll('Operating tier', 'Momentum read')
    .replaceAll('Intervention', 'Review')
    .replaceAll('intervention', 'review')
    .replaceAll('Pressure', 'Load')
    .replaceAll('pressure', 'load')
    .replaceAll('Immediate review is warranted', 'Review needed now')
}
