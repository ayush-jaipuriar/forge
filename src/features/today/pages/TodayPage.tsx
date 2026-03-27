import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { useEffect, useState } from 'react'
import { Box, Button, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { MetricTile } from '@/components/common/MetricTile'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { useUiStore } from '@/app/store/uiStore'
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

  const { currentBlock, dateLabel, dayInstance, energyStatus, fallbackSuggestion, focusedPrepDomains, recommendation, readinessSnapshot, scorePreview, sleepStatus, topPriorities, weekdayLabel, workoutState } = data
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
            'radial-gradient(circle at top right, rgba(210, 162, 98, 0.12), transparent 35%), linear-gradient(180deg, rgba(18, 24, 36, 0.98) 0%, rgba(12, 16, 24, 0.98) 100%)',
        }}
      >
        <SectionHeader
          eyebrow="Today"
          title="Run the day with clarity."
          description={`${weekdayLabel}, ${dateLabel}. ${dayInstance.label} focused on ${dayInstance.focusLabel.toLowerCase()}.`}
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="Day Type"
            value={dayInstance.label}
            detail="Generated directly from the seeded routine engine."
            tone="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="Score Preview"
            value={`${scorePreview.projectedScore}/100`}
            detail={`${scorePreview.earnedScore} earned so far. ${scorePreview.label} if the remaining live work lands.`}
            tone={scorePreview.warState === 'critical' ? 'warning' : scorePreview.warState === 'dominant' ? 'success' : 'neutral'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Current Block" value={currentBlock?.title ?? 'No active block'} detail={currentBlock?.detail ?? 'No block matched the current time.'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="Workout"
            value={workoutState.label}
            detail={`Current workout state: ${workoutState.status}.`}
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="War State"
            value={scorePreview.label}
            detail={`${topPriorities.length} live priority blocks remain in the current execution queue.`}
            tone={scorePreview.warState === 'dominant' ? 'success' : scorePreview.warState === 'critical' ? 'warning' : 'neutral'}
          />
        </Grid>
      </Grid>

      {showRecommendation ? (
        <SurfaceCard
          eyebrow="Recommendation"
          title={recommendation.actionLabel}
          description={recommendation.rationale}
          action={<Chip label={`${recommendation.urgency.toUpperCase()} PRIORITY`} color={recommendation.urgency === 'critical' ? 'error' : recommendation.urgency === 'high' ? 'warning' : 'default'} size="small" />}
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
        eyebrow="Quick Signals"
        title="Log sleep and energy without breaking flow."
        description="These signals now feed both the projected score and the recommendation engine, so they should be fast to update and easy to trust."
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
        title="Adjust the execution posture, not the underlying routine."
        description="This is the first real local-first mutation flow in the app: the override is persisted to local settings immediately and the workspace is regenerated from that persisted state."
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <StatusBadge label={activeMode.label} tone={currentDayMode} />
            <SyncIndicator status={syncStatus} />
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: updateDayModeMutation.isError ? 'error.main' : 'divider',
              borderRadius: 4,
              p: 2,
              backgroundColor: updateDayModeMutation.isError ? 'rgba(211, 47, 47, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <Stack spacing={0.75}>
              <Typography variant="overline" color="primary.light">
                Current Execution Stance
              </Typography>
              <Typography variant="h3">{activeMode.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {activeMode.detail}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              borderLeft: '3px solid',
              borderColor: updateDayModeMutation.isError ? 'error.main' : 'primary.main',
              pl: 1.5,
            }}
          >
            <Typography variant="body1">{modeFeedback.title}</Typography>
            <Typography variant="body2" color={updateDayModeMutation.isError ? 'error.light' : 'text.secondary'}>
              {modeFeedback.detail}
            </Typography>
          </Box>

          <DayModeSelector
            activeDayMode={currentDayMode}
            disabled={updateDayModeMutation.isPending}
            onSelect={(dayMode) => updateDayModeMutation.mutate({ date: dayInstance.date, dayMode })}
          />
        </Stack>
      </SurfaceCard>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SurfaceCard
            eyebrow="Operational View"
            title="Agenda"
            description={`This is now generated from the seeded ${dayInstance.dayType} template rather than hardcoded page copy.`}
          >
            <Stack spacing={2}>
              {dayInstance.blocks.map((block) => (
                <Box
                  key={block.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    p: 2,
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <Typography variant="body2" color="primary.light">
                    {block.startTime ?? (block.durationMinutes ? `${block.durationMinutes}m` : 'Flexible')}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                      <Typography variant="h3">{block.title}</Typography>
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
                    {block.status === 'planned' ? (
                      <Stack spacing={1.25} pt={0.75}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
                      <Stack spacing={1.25} pt={0.75}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                            {block.status === 'completed'
                              ? 'Logged as complete and removed from the live execution queue.'
                              : block.status === 'moved'
                                ? 'Moved later so the day can keep moving without pretending this block is dead.'
                                : 'Marked as skipped so the day can keep moving without hiding the deviation.'}
                          </Typography>
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
              ))}
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <SurfaceCard
              eyebrow="Decision Layer"
              title="Top Priorities"
              description="Priority ordering is now derived from the routine engine and block metadata."
            >
              <Stack spacing={1.25}>
                {topPriorities.map((block) => (
                  <Stack key={block.id} direction="row" spacing={1} alignItems="center">
                    <AutoGraphRoundedIcon color="primary" />
                    <Typography color="text.secondary">
                      {block.title}
                      {block.requiredOutput ? ' · output required' : ''}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </SurfaceCard>
            <SurfaceCard
              eyebrow="Score Pressure"
              title="Projected score and war-state"
              description="This preview stays fair early in the day by treating still-planned work as recoverable potential, while missed prime work now applies explicit ceiling constraints so easy tasks cannot fake a strong day."
            >
              <Stack spacing={1.25}>
                {scorePreview.breakdown.map((item) => (
                  <Stack key={`${item.key}-${item.label}`} direction="row" justifyContent="space-between" spacing={2}>
                    <Typography color="text.secondary">{item.label}</Typography>
                    <Typography color="primary.light">
                      {item.earned}/{item.projected}/{item.max}
                    </Typography>
                  </Stack>
                ))}
                <Typography variant="body2" color="text.secondary">
                  Format: earned / projected / max
                </Typography>
                {scorePreview.constraints.map((constraint) => (
                  <Typography key={constraint} variant="body2" color="warning.main">
                    Constraint: {constraint}
                  </Typography>
                ))}
              </Stack>
            </SurfaceCard>
            <SurfaceCard
              eyebrow="Holistic Signals"
              title="Readiness and support inputs"
              description="Score pressure now considers more than execution alone, even before full manual logging lands."
            >
              <Stack spacing={1.25}>
                <Typography color="text.secondary">Target date: {readinessSnapshot.targetDate}</Typography>
                <Typography color="text.secondary">
                  Days remaining: {readinessSnapshot.daysRemaining} · {readinessSnapshot.pressureLabel}
                </Typography>
                <Typography color="text.secondary">
                  Sleep signal: {sleepStatus === 'unknown' ? 'Not logged yet' : sleepStatus === 'met' ? 'Target met' : 'Target missed'}
                </Typography>
                <Typography color="text.secondary">
                  Energy signal: {energyStatus === 'unknown' ? 'Not logged yet' : energyStatus === 'high' ? 'High' : energyStatus === 'normal' ? 'Normal' : 'Low'}
                </Typography>
                <Typography color="text.secondary">
                  Focused prep domains: {focusedPrepDomains.length > 0 ? focusedPrepDomains.map((domain) => domain.label).join(', ') : 'No focused prep domain inferred yet'}
                </Typography>
                <Typography color="primary.light">
                  Subscores · Prep {scorePreview.subscores.interviewPrep} · Physical {scorePreview.subscores.physical} · Discipline {scorePreview.subscores.discipline} · Consistency {scorePreview.subscores.consistency}
                </Typography>
              </Stack>
            </SurfaceCard>
            {recommendationHistory.length > 0 ? (
              <SurfaceCard
                eyebrow="Recommendation History"
                title="Recent explanation shifts"
                description="This creates a small visible memory of how the engine is adapting as the day changes."
              >
                <Stack spacing={1.25}>
                  {recommendationHistory.map((item) => (
                    <Stack key={`${item.timestamp}-${item.actionLabel}`} spacing={0.25}>
                      <Typography color="primary.light">
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
            <SurfaceCard
              eyebrow="Physical Signal"
              title="Expectation Summary"
              description="The generated day instance also carries the expectation language that scoring and guidance will consume later."
            >
              <Stack spacing={1.25}>
                {dayInstance.expectationSummary.map((expectation) => (
                  <Stack key={expectation} direction="row" spacing={1} alignItems="center">
                    <FitnessCenterRoundedIcon color="primary" />
                    <Typography color="text.secondary">{expectation}</Typography>
                  </Stack>
                ))}
              </Stack>
            </SurfaceCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
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
