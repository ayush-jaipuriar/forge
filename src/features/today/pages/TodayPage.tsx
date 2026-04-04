import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { useEffect, useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
import { SectionHeader } from '@/components/common/SectionHeader'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { useUiStore } from '@/app/store/uiStore'
import { formatCalendarTimestamp, getCalendarStatusTone } from '@/domain/calendar/presentation'
import { BlockNoteComposer } from '@/features/today/components/BlockNoteComposer'
import { DayModeSelector } from '@/features/today/components/DayModeSelector'
import { FallbackModeSuggestionCard } from '@/features/today/components/FallbackModeSuggestionCard'
import { SignalToggleGroup } from '@/features/today/components/SignalToggleGroup'
import { useTodayWorkspace } from '@/features/today/hooks/useTodayWorkspace'
import { useUpdateBlockNote } from '@/features/today/hooks/useUpdateBlockNote'
import { useUpdateBlockStatus } from '@/features/today/hooks/useUpdateBlockStatus'
import { useUpdateDailySignals } from '@/features/today/hooks/useUpdateDailySignals'
import { useUpdateDayMode } from '@/features/today/hooks/useUpdateDayMode'
import type { BlockStatus, DayMode, EnergyStatus, SleepStatus, SyncStatus } from '@/domain/common/types'

export function TodayPage() {
  const { data, isLoading } = useTodayWorkspace()
  const setDayMode = useUiStore((state) => state.setDayMode)
  const setWarState = useUiStore((state) => state.setWarState)
  const currentDayMode = useUiStore((state) => state.dayMode)
  const syncStatus = useUiStore((state) => state.syncStatus)
  const updateDayModeMutation = useUpdateDayMode()
  const updateBlockNoteMutation = useUpdateBlockNote()
  const updateBlockStatusMutation = useUpdateBlockStatus()
  const updateDailySignalsMutation = useUpdateDailySignals()
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [dismissedFallbackKey, setDismissedFallbackKey] = useState<string | null>(null)
  const [recommendationHistory, setRecommendationHistory] = useState<
    Array<{
      timestamp: string
      actionLabel: string
      explanation: string
      urgency: string
    }>
  >([])

  useEffect(() => {
    if (data) {
      setDayMode(data.dayInstance.dayMode)
      setWarState(data.scorePreview.warState)
    }
  }, [data, setDayMode, setWarState])

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading today's operating plan" description="Forge is restoring the locally cached day instance.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const {
    calendarEvents,
    calendarMirrors,
    calendarSummary,
    calendarSyncState,
    currentBlock,
    dateLabel,
    dayInstance,
    energyStatus,
    fallbackSuggestion,
    focusedPrepDomains,
    operationalSignals,
    recommendation,
    readinessSnapshot,
    scorePreview,
    sleepStatus,
    topPriorities,
    weekdayLabel,
    workoutState,
  } = data
  const calendarTone = getCalendarStatusTone({
    connectionStatus: calendarSyncState.connectionStatus,
    externalSyncStatus: calendarSyncState.externalEventSyncStatus,
    mirrorSyncStatus: calendarSyncState.mirrorSyncStatus,
    collisionSeverity: calendarSummary.severity,
  })
  const activeMode = dayModeDetails[currentDayMode]
  const fallbackKey = fallbackSuggestion
    ? getFallbackKey(dayInstance.date, fallbackSuggestion.suggestedDayMode, fallbackSuggestion.explanation)
    : null
  const showFallbackSuggestion = fallbackSuggestion && fallbackKey !== dismissedFallbackKey
  const modeFeedback = getModeFeedback({
    dayMode: currentDayMode,
    syncStatus,
    isPending: updateDayModeMutation.isPending,
    isError: updateDayModeMutation.isError,
    errorMessage: updateDayModeMutation.error instanceof Error ? updateDayModeMutation.error.message : null,
  })

  function handleRevealRecommendation() {
    setShowRecommendation(true)
    setRecommendationHistory((current) => {
      const nextEntry = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLabel: recommendation.actionLabel,
        explanation: recommendation.explanation,
        urgency: recommendation.urgency,
      }

      if (current[0]?.actionLabel === nextEntry.actionLabel && current[0]?.explanation === nextEntry.explanation) {
        return current
      }

      return [nextEntry, ...current].slice(0, 4)
    })
  }

  return (
    <Stack spacing={3}>
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at top right, rgba(212, 111, 60, 0.14), transparent 34%), linear-gradient(180deg, rgba(21, 27, 38, 0.98) 0%, rgba(12, 16, 24, 0.98) 100%)',
        }}
      >
        <SectionHeader
          eyebrow="Today"
          title="Run the day with clarity."
          description={`${weekdayLabel}, ${dateLabel}. ${dayInstance.label} focused on ${dayInstance.focusLabel.toLowerCase()}.`}
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="contained"
                startIcon={<KeyboardDoubleArrowRightRoundedIcon />}
                onClick={handleRevealRecommendation}
              >
                {showRecommendation ? 'Refresh recommendation' : 'What should I do now?'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<AccessTimeRoundedIcon />}
                disabled={!currentBlock || updateBlockStatusMutation.isPending}
                onClick={() => {
                  if (currentBlock) {
                    updateBlockStatusMutation.mutate({
                      date: dayInstance.date,
                      blockId: currentBlock.id,
                      status: 'completed',
                    })
                  }
                }}
              >
                Mark current block complete
              </Button>
            </Stack>
          }
        />
      </SurfaceCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 340px',
            xl: '280px minmax(0, 1.15fr) 360px',
          },
          alignItems: 'start',
        }}
      >
        <Stack
          spacing={2.5}
          sx={{
            order: { xs: 3, lg: 2, xl: 1 },
            gridColumn: { lg: 2, xl: 1 },
          }}
        >
          <SurfaceCard
            eyebrow="Execution Context"
            title={dayInstance.label}
            description="Support signals for the current day."
          >
            <Stack spacing={1.5}>
              <SupportDataRow label="Day Type" value={dayInstance.dayType} detail="Routine engine source" />
              <SupportDataRow
                label="Workout Posture"
                value={workoutState.label}
                detail={`Current state: ${workoutState.status}`}
              />
              <SupportDataRow
                label="Target Pressure"
                value={`${readinessSnapshot.daysRemaining} days`}
                detail={readinessSnapshot.pressureLabel}
              />
              <SupportDataRow
                label="Focused Domains"
                value={
                  focusedPrepDomains.length > 0
                    ? focusedPrepDomains.map((domain) => domain.label).join(', ')
                    : 'No focused domain yet'
                }
                detail="Current prep emphasis"
              />
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Quick Signals"
            title="Log sleep and energy fast."
            description="These inputs directly influence recommendation and score pressure."
          >
            <Stack spacing={2}>
              <SignalToggleGroup<SleepStatus>
                label="Sleep"
                value={sleepStatus}
                disabled={updateDailySignalsMutation.isPending}
                options={sleepStatusOptions}
                onSelect={(value) =>
                  updateDailySignalsMutation.mutate({
                    date: dayInstance.date,
                    sleepStatus: value,
                  })
                }
              />
              <SignalToggleGroup<EnergyStatus>
                label="Energy"
                value={energyStatus}
                disabled={updateDailySignalsMutation.isPending}
                options={energyStatusOptions}
                onSelect={(value) =>
                  updateDailySignalsMutation.mutate({
                    date: dayInstance.date,
                    energyStatus: value,
                  })
                }
              />
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Mode Override"
            title={activeMode.label}
            description="Adjust posture without changing the seeded routine."
            action={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <StatusBadge label={activeMode.label} tone={currentDayMode} />
                <SyncIndicator status={syncStatus} />
              </Stack>
            }
          >
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                {activeMode.detail}
              </Typography>
              <Typography
                variant="body2"
                color={updateDayModeMutation.isError ? 'error.light' : 'text.secondary'}
              >
                {modeFeedback.title} {modeFeedback.detail}
              </Typography>
              <DayModeSelector
                activeDayMode={currentDayMode}
                disabled={updateDayModeMutation.isPending}
                onSelect={(dayMode) => updateDayModeMutation.mutate({ date: dayInstance.date, dayMode })}
              />
            </Stack>
          </SurfaceCard>

          {recommendationHistory.length > 0 ? (
            <SurfaceCard
              eyebrow="Recommendation History"
              title="Recent explanation shifts"
              description="This creates a lightweight memory of how the recommendation layer is adapting as the day changes."
            >
              <Stack spacing={1.25}>
                {recommendationHistory.map((item) => (
                  <Stack key={`${item.timestamp}-${item.actionLabel}`} spacing={0.35}>
                    <Typography variant="subtitle2" color="primary.light">
                      {item.timestamp} · {item.actionLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.explanation}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </SurfaceCard>
          ) : null}
        </Stack>

        <Stack
          spacing={2.5}
          sx={{
            order: { xs: 1, lg: 1, xl: 2 },
            gridColumn: { lg: 1, xl: 2 },
          }}
        >
          <SurfaceCard
            eyebrow="Current Execution"
            title={currentBlock?.title ?? 'No active block'}
            description={
              currentBlock?.detail ??
              'No block matched the current time, so Forge is showing the strongest available execution context instead.'
            }
            contentSx={{
              background:
                'radial-gradient(circle at top right, rgba(240, 179, 122, 0.12), transparent 30%), linear-gradient(180deg, rgba(28, 36, 49, 0.98) 0%, rgba(17, 22, 32, 0.98) 100%)',
            }}
            action={
              <Chip
                label={currentBlock ? 'Live block' : 'Awaiting next block'}
                size="small"
                sx={{
                  color: currentBlock ? 'primary.light' : 'text.secondary',
                }}
              />
            }
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'flex-end' }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="overline" color="primary.light">
                    Current Mission
                  </Typography>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.2rem', md: '3rem' },
                      maxWidth: 760,
                    }}
                  >
                    {currentBlock?.title ?? dayInstance.focusLabel}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <StatusBadge label={scorePreview.label} tone={scorePreview.warState} />
                  <Chip label={dayInstance.label} size="small" />
                </Stack>
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 900 }}>
                {currentBlock?.detail ??
                  'Forge is between timed blocks right now, so the execution surface is biasing toward the day focus and the next recoverable action.'}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                <CompactMetric
                  label="Projected Score"
                  value={`${scorePreview.projectedScore}/100`}
                  detail={`${scorePreview.earnedScore} earned so far`}
                />
                <CompactMetric
                  label="Current Block"
                  value={currentBlock?.startTime ?? 'Flexible'}
                  detail={currentBlock?.endTime ? `Ends ${currentBlock.endTime}` : 'No timed block matched'}
                />
                <CompactMetric
                  label="Top Pressure"
                  value={topPriorities.length > 0 ? topPriorities[0].title : 'No live priority'}
                  detail={`${topPriorities.length} live priority blocks remain`}
                />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                {topPriorities.slice(0, 3).map((block) => (
                  <Chip
                    key={block.id}
                    icon={<AutoGraphRoundedIcon fontSize="small" />}
                    label={block.title}
                    size="small"
                  />
                ))}
              </Stack>
            </Stack>
          </SurfaceCard>

          {showRecommendation ? (
            <SurfaceCard
              eyebrow="Recommendation"
              title={recommendation.actionLabel}
              description={recommendation.rationale}
              action={
                <Chip
                  label={`${recommendation.urgency.toUpperCase()} priority`}
                  color={
                    recommendation.urgency === 'critical'
                      ? 'error'
                      : recommendation.urgency === 'high'
                        ? 'warning'
                        : 'default'
                  }
                  size="small"
                />
              }
            >
              <Stack spacing={1}>
                {recommendation.alternativePath ? (
                  <Typography variant="body2" color="text.secondary">
                    Alternative: {recommendation.alternativePath}
                  </Typography>
                ) : null}
                <Typography variant="body2" color="text.secondary">
                  Why this rule fired: {recommendation.explanation}
                </Typography>
                <Typography variant="body2" color="primary.light">
                  This rule is using score pressure, day mode, readiness pace, workout state, sleep, energy, fallback posture, and the current live block queue.
                </Typography>
              </Stack>
            </SurfaceCard>
          ) : null}

          {showFallbackSuggestion ? (
            <FallbackModeSuggestionCard
              suggestion={fallbackSuggestion}
              currentModeLabel={activeMode.label}
              disabled={updateDayModeMutation.isPending}
              onApply={(dayMode) => updateDayModeMutation.mutate({ date: dayInstance.date, dayMode })}
              onDismiss={() => {
                if (fallbackKey) {
                  setDismissedFallbackKey(fallbackKey)
                }
              }}
            />
          ) : null}

          <SurfaceCard
            eyebrow="Execution Timeline"
            title="Agenda"
            description={`This stack stays chronological and dense so the day reads like an operational timeline instead of a wall of separate cards.`}
          >
            <Stack spacing={1.5}>
              {dayInstance.blocks.map((block) => {
                const isCurrentBlock = currentBlock?.id === block.id
                const blockTone =
                  block.status === 'completed'
                    ? forgeTokens.palette.accent.success
                    : block.status === 'planned'
                      ? forgeTokens.palette.accent.ember
                      : forgeTokens.palette.accent.warning

                return (
                  <Box
                    key={block.id}
                    sx={{
                      border: '1px solid',
                      borderColor: isCurrentBlock ? forgeTokens.palette.border.accent : 'divider',
                      borderRadius: 4,
                      p: { xs: 1.75, md: 2 },
                      background: isCurrentBlock
                        ? `linear-gradient(180deg, ${alpha(forgeTokens.palette.accent.ember, 0.08)} 0%, ${alpha(forgeTokens.palette.background.panel, 0.98)} 100%)`
                        : `linear-gradient(180deg, ${alpha(forgeTokens.palette.background.panel, 0.98)} 0%, ${alpha(forgeTokens.palette.background.surface, 0.98)} 100%)`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        insetInlineStart: 0,
                        insetBlock: 0,
                        width: 2,
                        backgroundColor: blockTone,
                      },
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.25}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={{ xs: 0.75, sm: 1.5 }}
                          alignItems={{ xs: 'flex-start', sm: 'baseline' }}
                        >
                          <Typography
                            variant="caption"
                            color="primary.light"
                            sx={{ minWidth: { sm: 78 } }}
                          >
                            {block.startTime ??
                              (block.durationMinutes ? `${block.durationMinutes}m` : 'Flexible')}
                          </Typography>
                          <Stack spacing={0.35}>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={1}
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                            >
                              <Typography variant="h3">{block.title}</Typography>
                              {isCurrentBlock ? <Chip label="Current" size="small" color="warning" /> : null}
                              <Chip
                                label={blockStatusLabels[block.status]}
                                color={blockStatusTones[block.status]}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {block.detail}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      {block.status === 'planned' ? (
                        <Stack spacing={1.25}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                            <Button
                              size="small"
                              variant="contained"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: dayInstance.date,
                                  blockId: block.id,
                                  status: 'completed',
                                })
                              }
                            >
                              Mark Done
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: dayInstance.date,
                                  blockId: block.id,
                                  status: 'moved',
                                })
                              }
                            >
                              Move Later
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: dayInstance.date,
                                  blockId: block.id,
                                  status: 'skipped',
                                })
                              }
                            >
                              Skip
                            </Button>
                          </Stack>
                          <BlockNoteComposer
                            note={block.executionNote}
                            disabled={updateBlockNoteMutation.isPending}
                            onSave={(executionNote) =>
                              updateBlockNoteMutation.mutate({
                                date: dayInstance.date,
                                blockId: block.id,
                                executionNote,
                              })
                            }
                          />
                        </Stack>
                      ) : (
                        <Stack spacing={1.25}>
                          <Typography variant="body2" color="text.secondary">
                            {block.status === 'completed'
                              ? 'Logged as complete and removed from the live execution queue.'
                              : block.status === 'moved'
                                ? 'Moved later so the day can keep moving without pretending this block is dead.'
                                : 'Marked as skipped so the day can keep moving without hiding the deviation.'}
                          </Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: dayInstance.date,
                                  blockId: block.id,
                                  status: 'planned',
                                })
                              }
                            >
                              Restore
                            </Button>
                          </Stack>
                          <BlockNoteComposer
                            note={block.executionNote}
                            disabled={updateBlockNoteMutation.isPending}
                            onSave={(executionNote) =>
                              updateBlockNoteMutation.mutate({
                                date: dayInstance.date,
                                blockId: block.id,
                                executionNote,
                              })
                            }
                          />
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          </SurfaceCard>
        </Stack>

        <Stack
          spacing={2.5}
          sx={{
            order: { xs: 2, lg: 3, xl: 3 },
            gridColumn: { lg: 2, xl: 3 },
          }}
        >
          <SurfaceCard
            eyebrow="Pressure Stack"
            title="Projected score and readiness pressure"
            description="This column exists to keep pressure honest without distracting from the live execution surface."
          >
            <Stack spacing={1.5}>
              <CompactMetric
                label="War State"
                value={scorePreview.label}
                detail={`${topPriorities.length} live priority blocks remain in the current queue`}
              />
              <CompactMetric
                label="Subscores"
                value={`Prep ${scorePreview.subscores.interviewPrep} · Physical ${scorePreview.subscores.physical}`}
                detail={`Discipline ${scorePreview.subscores.discipline} · Consistency ${scorePreview.subscores.consistency}`}
              />
              <Stack spacing={1}>
                {scorePreview.breakdown.map((item) => (
                  <Stack
                    key={`${item.key}-${item.label}`}
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="primary.light">
                      {item.earned}/{item.projected}/{item.max}
                    </Typography>
                  </Stack>
                ))}
                <Typography variant="caption" color="text.secondary">
                  earned / projected / max
                </Typography>
              </Stack>
              {scorePreview.constraints.map((constraint) => (
                <Typography key={constraint} variant="body2" color="warning.main">
                  Constraint: {constraint}
                </Typography>
              ))}
            </Stack>
          </SurfaceCard>

          {operationalSignals.length > 0 ? (
            <SurfaceCard
              eyebrow="Operational Alerts"
              title="What deserves protection right now"
              description="These signals should bend the day, not merely report what already happened."
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

          <SurfaceCard
            eyebrow="Calendar Pressure"
            title="External commitments that constrain today"
            description="Forge reads your primary Google Calendar into the execution model to protect routine integrity, not replace it."
            action={
              <Chip
                icon={<CalendarMonthRoundedIcon />}
                label={`${calendarSummary.severity} · read ${calendarSyncState.externalEventSyncStatus} · mirror ${calendarSyncState.mirrorSyncStatus}`}
                size="small"
                variant="outlined"
                color={calendarTone}
              />
            }
          >
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Cached events today: {calendarEvents.length}. Mirrored major blocks today: {calendarMirrors.length}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last external sync: {formatCalendarTimestamp(calendarSyncState.lastExternalSyncAt)}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last mirror sync: {formatCalendarTimestamp(calendarSyncState.lastMirrorSyncAt)}.
              </Typography>
              {calendarSummary.constrainedWindows.length > 0 ? (
                calendarSummary.constrainedWindows.slice(0, 3).map((window) => (
                  <Typography key={`${window.startsAt}-${window.endsAt}`} variant="body2" color="text.secondary">
                    {window.reason}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No external calendar collisions are currently constraining the timed blocks in today&apos;s plan.
                </Typography>
              )}
              {calendarSyncState.lastMirrorSyncError ? (
                <Typography variant="body2" color="warning.light">
                  Mirror sync issue: {calendarSyncState.lastMirrorSyncError}
                </Typography>
              ) : null}
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Support Layer"
            title="Readiness and expectation summary"
            description="This keeps the physiological and expectation context visible without letting it take over the page."
          >
            <Stack spacing={1.25}>
              <SupportDataRow label="Sleep Signal" value={sleepLabel(sleepStatus)} detail="Current logged sleep posture" />
              <SupportDataRow label="Energy Signal" value={energyLabel(energyStatus)} detail="Current logged energy posture" />
              <SupportDataRow label="Workout State" value={workoutState.label} detail={`Status: ${workoutState.status}`} />
              {dayInstance.expectationSummary.map((expectation) => (
                <Stack key={expectation} direction="row" spacing={1} alignItems="center">
                  <FitnessCenterRoundedIcon color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {expectation}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SurfaceCard>
        </Stack>
      </Box>
    </Stack>
  )
}

function CompactMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Stack
      spacing={0.45}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 1.5,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.4),
      }}
    >
      <Typography variant="overline" color="primary.light">
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontSize: '0.96rem' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  )
}

function SupportDataRow({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Stack spacing={0.25}>
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

function sleepLabel(status: SleepStatus) {
  switch (status) {
    case 'met':
      return 'Target met'
    case 'missed':
      return 'Target missed'
    case 'unknown':
    default:
      return 'Not logged yet'
  }
}

function energyLabel(status: EnergyStatus) {
  switch (status) {
    case 'high':
      return 'High'
    case 'normal':
      return 'Normal'
    case 'low':
      return 'Low'
    case 'unknown':
    default:
      return 'Not logged yet'
  }
}

const blockStatusLabels: Record<BlockStatus, string> = {
  planned: 'Planned',
  completed: 'Completed',
  skipped: 'Skipped',
  moved: 'Moved',
}

const blockStatusTones: Record<BlockStatus, 'default' | 'success' | 'warning'> = {
  planned: 'default',
  completed: 'success',
  skipped: 'warning',
  moved: 'warning',
}

const sleepStatusOptions: Array<{ value: SleepStatus; label: string }> = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'met', label: 'Target Met' },
  { value: 'missed', label: 'Target Missed' },
]

const energyStatusOptions: Array<{ value: EnergyStatus; label: string }> = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]

const dayModeDetails: Record<DayMode, { label: string; detail: string }> = {
  ideal: {
    label: 'Ideal Mode',
    detail: 'Carry the full high-output expectation and preserve the original shape of the day.',
  },
  normal: {
    label: 'Normal Mode',
    detail: 'Run the base plan without adding extra load or cutting important blocks.',
  },
  lowEnergy: {
    label: 'Low Energy Mode',
    detail: 'Reduce cognitive load, keep momentum, and protect the most meaningful outputs.',
  },
  survival: {
    label: 'Survival Mode',
    detail: 'Protect continuity with the minimum viable execution standard for the day.',
  },
}

function getModeFeedback({
  dayMode,
  syncStatus,
  isPending,
  isError,
  errorMessage,
}: {
  dayMode: DayMode
  syncStatus: SyncStatus
  isPending: boolean
  isError: boolean
  errorMessage: string | null
}) {
  if (isError) {
    return {
      title: 'Forge could not persist that override.',
      detail: errorMessage ?? 'The app rolled back to the last persisted mode so the visible state stays truthful.',
    }
  }

  if (isPending) {
    return {
      title: `Applying ${dayModeDetails[dayMode].label.toLowerCase()} locally now.`,
      detail: 'The shell updates first, then Today and Schedule regenerate from the persisted settings snapshot.',
    }
  }

  if (syncStatus === 'syncing') {
    return {
      title: 'Saved locally and syncing now.',
      detail: 'The override is already active in Forge while the queue flushes to Firestore in the background.',
    }
  }

  if (syncStatus === 'queued') {
    return {
      title: 'Saved locally and queued to sync.',
      detail: 'Your selected mode is already active. Forge will retry cloud sync automatically when conditions allow.',
    }
  }

  return {
    title: 'Local workspace and sync state are aligned.',
    detail: 'Today and Schedule are both reflecting the persisted mode with no outstanding sync work.',
  }
}

function getFallbackKey(date: string, suggestedDayMode: DayMode, explanation: string) {
  return `${date}:${suggestedDayMode}:${explanation}`
}
