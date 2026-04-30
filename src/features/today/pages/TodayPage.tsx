import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { useEffect, useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { StatusBadge } from '@/components/status/StatusBadge'
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
import type { BlockStatus, DayMode, EnergyStatus, SleepStatus } from '@/domain/common/types'

export function TodayPage() {
  const { data, error, isError, isLoading, refetch } = useTodayWorkspace()
  const setDayMode = useUiStore((state) => state.setDayMode)
  const setWarState = useUiStore((state) => state.setWarState)
  const currentDayMode = useUiStore((state) => state.dayMode)
  const updateDayModeMutation = useUpdateDayMode()
  const updateBlockNoteMutation = useUpdateBlockNote()
  const updateBlockStatusMutation = useUpdateBlockStatus()
  const updateDailySignalsMutation = useUpdateDailySignals()
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [dismissedFallbackKey, setDismissedFallbackKey] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setDayMode(data.dayInstance.dayMode)
      setWarState(data.scorePreview.warState)
    }
  }, [data, setDayMode, setWarState])

  if (isLoading || !data) {
    if (isError) {
      return (
        <SurfaceCard title="Today could not load" description={getWorkspaceErrorMessage(error)}>
          <Stack spacing={2} alignItems="flex-start">
            <Alert severity="warning">Reconnect or retry when Firestore is reachable.</Alert>
            <Button variant="contained" onClick={() => void refetch()}>
              Retry
            </Button>
          </Stack>
        </SurfaceCard>
      )
    }

    return (
      <SurfaceCard title="Loading today" description="Restoring your day plan.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const {
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
  const activeMode = dayModeDetails[currentDayMode]
  const fallbackKey = fallbackSuggestion
    ? getFallbackKey(dayInstance.date, fallbackSuggestion.suggestedDayMode, fallbackSuggestion.explanation)
    : null
  const showFallbackSuggestion = fallbackSuggestion && fallbackKey !== dismissedFallbackKey
  const blockStatusDisabled = updateBlockStatusMutation.isPending || updateBlockStatusMutation.isCloudWriteUnavailable
  const blockNoteDisabled = updateBlockNoteMutation.isPending || updateBlockNoteMutation.isCloudWriteUnavailable
  const dailySignalsDisabled = updateDailySignalsMutation.isPending || updateDailySignalsMutation.isCloudWriteUnavailable
  const dayModeDisabled = updateDayModeMutation.isPending || updateDayModeMutation.isCloudWriteUnavailable

  function handleRevealRecommendation() {
    setShowRecommendation(true)
  }

  return (
    <Stack spacing={3} sx={{ pb: { xs: 11, md: 4 } }}>
      <SurfaceCard
        variant="hero"
        contentSx={{
          background: 'transparent',
        }}
      >
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: 'column', xl: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', xl: 'flex-end' }}
          >
            <Stack spacing={0.9} maxWidth={860}>
              <Typography
                variant="overline"
                color="primary.main"
                sx={{ fontSize: '0.62rem', letterSpacing: '0.12em', fontWeight: 700 }}
              >
                Now
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  lineHeight: 0.92,
                  letterSpacing: '-0.06em',
                }}
              >
                {currentBlock?.title ?? dayInstance.focusLabel}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 780 }}>
                {weekdayLabel}, {dateLabel}. {currentBlock?.detail ?? dayInstance.label}.
              </Typography>
            </Stack>

            <Stack spacing={1} sx={{ width: { xs: '100%', xl: 'auto' } }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <StatusBadge label={scorePreview.label} tone={scorePreview.warState} />
                <Chip label={`${scorePreview.projectedScore}/100`} size="small" variant="outlined" />
                <Chip
                  label={currentBlock ? 'Live block' : 'Next action'}
                  size="small"
                  variant="outlined"
                  color={currentBlock ? 'success' : 'default'}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
                <Button
                  variant="contained"
                  startIcon={<KeyboardDoubleArrowRightRoundedIcon />}
                  onClick={handleRevealRecommendation}
                  sx={{ minWidth: { sm: 220 } }}
                >
                  {showRecommendation ? 'Refresh recommendation' : 'What should I do now?'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AccessTimeRoundedIcon />}
                  disabled={!currentBlock || blockStatusDisabled}
                  onClick={() => {
                    if (currentBlock) {
                      updateBlockStatusMutation.mutate({
                        date: dayInstance.date,
                        blockId: currentBlock.id,
                        status: 'completed',
                      })
                    }
                  }}
                  sx={{ minWidth: { sm: 220 } }}
                >
                  Mark current block complete
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <ActionSummary label="Window" value={currentBlock?.startTime ?? 'Flexible'} />
            <ActionSummary label="Mode" value={activeMode.label.replace(' Mode', '')} />
            <ActionSummary
              label="Primary pressure"
              value={topPriorities.length > 0 ? topPriorities[0].title : 'Protect continuity'}
            />
          </Box>
        </Stack>
      </SurfaceCard>

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2, lg: 2.5 },
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.55fr) 340px',
          },
          alignItems: 'start',
        }}
      >
        <Stack
          spacing={2.5}
          sx={{
            gridColumn: { xs: 1, lg: 1 },
          }}
        >
          <SurfaceCard
            variant="quiet"
            eyebrow="Next move"
            title={showRecommendation ? recommendation.actionLabel : 'Need the next move?'}
            description={
              showRecommendation
                ? recommendation.rationale
                : 'Ask Forge for the smallest useful action when the day gets fuzzy.'
            }
            action={
              <Chip
                label={showRecommendation ? `${capitalize(recommendation.urgency)} priority` : 'On demand'}
                color={
                  showRecommendation
                    ? recommendation.urgency === 'critical'
                      ? 'error'
                      : recommendation.urgency === 'high'
                        ? 'warning'
                        : 'default'
                    : 'default'
                }
                size="small"
                variant="outlined"
              />
            }
          >
            <Stack spacing={1.25}>
              {showRecommendation ? (
                <>
                  {recommendation.alternativePath ? (
                    <Typography variant="body2" color="text.secondary">
                      Alternative path: {recommendation.alternativePath}
                    </Typography>
                  ) : null}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Ask Forge for the next recoverable move when the day loses shape or the current block finishes early.
                </Typography>
              )}
            </Stack>
          </SurfaceCard>

          {showFallbackSuggestion ? (
            <SurfaceCard
              variant="plain"
              contentSx={{ p: 0 }}
            >
              <FallbackModeSuggestionCard
                suggestion={fallbackSuggestion}
                currentModeLabel={activeMode.label}
                disabled={dayModeDisabled}
                onApply={(dayMode) => updateDayModeMutation.mutate({ date: dayInstance.date, dayMode })}
                onDismiss={() => {
                  if (fallbackKey) {
                    setDismissedFallbackKey(fallbackKey)
                  }
                }}
              />
            </SurfaceCard>
          ) : null}

          <SurfaceCard
            eyebrow="Agenda"
            title="Today timeline"
            description="Work one block at a time. Restore only what still matters."
          >
            <Stack spacing={1}>
              {dayInstance.blocks.map((block) => {
                const isCurrentBlock = currentBlock?.id === block.id

                return (
                  <Box
                    key={block.id}
                    sx={(theme) => {
                      const blockTone =
                        block.status === 'completed'
                          ? theme.palette.success.main
                          : block.status === 'planned'
                            ? theme.palette.primary.main
                            : theme.palette.warning.main

                      return {
                        border: '1px solid',
                        borderColor: isCurrentBlock
                          ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.34 : 0.28)
                          : 'divider',
                        borderRadius: 4,
                        p: { xs: 1.4, md: 1.65 },
                        background: isCurrentBlock
                          ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.05 : 0.07)
                          : alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.42 : 0.22),
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          insetInlineStart: 16,
                          insetBlockStart: 20,
                          width: 8,
                          height: 8,
                          borderRadius: '999px',
                          backgroundColor: blockTone,
                        },
                      }
                    }}
                  >
                    <Stack spacing={1.1}>
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1.25,
                          gridTemplateColumns: { xs: '1fr', md: '92px minmax(0, 1fr)' },
                          alignItems: 'start',
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{ pl: { xs: 2.2, md: 1.8 }, pt: 0.15, letterSpacing: '0.08em' }}
                        >
                          {block.startTime ??
                            (block.durationMinutes ? `${block.durationMinutes}m` : 'Flexible')}
                        </Typography>

                        <Stack spacing={0.8}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={0.9}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            useFlexGap
                            flexWrap="wrap"
                          >
                            <Typography variant="h4">{block.title}</Typography>
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
                      </Box>

                      {block.status === 'planned' ? (
                        <Stack spacing={1.25}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                            <Button
                              size="small"
                              variant="contained"
                              disabled={blockStatusDisabled}
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
                              disabled={blockStatusDisabled}
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
                              disabled={blockStatusDisabled}
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
                            disabled={blockNoteDisabled}
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
                              ? 'Complete.'
                              : block.status === 'moved'
                                ? 'Moved later.'
                                : 'Skipped.'}
                          </Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={blockStatusDisabled}
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
                            disabled={blockNoteDisabled}
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
        <Stack spacing={2} sx={{ gridColumn: { xs: 1, lg: 2 } }}>
          <SurfaceCard
            variant="quiet"
            eyebrow="Context"
            title="Signals"
            description="Keep only the support signals that can still change the day."
          >
            <Stack spacing={1.75}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: '1fr' },
                }}
              >
                <SupportDataRow label="Sleep" value={sleepLabel(sleepStatus)} detail="Guides fallback mode" />
                <SupportDataRow label="Energy" value={energyLabel(energyStatus)} detail="Guides next action" />
                <SupportDataRow label="Workout" value={workoutState.label} detail={`Status: ${workoutState.status}`} />
                <SupportDataRow
                  label="Target"
                  value={`${readinessSnapshot.daysRemaining} days`}
                  detail={readinessSnapshot.pressureLabel}
                />
              </Box>

              <Stack spacing={1.5}>
                <SignalToggleGroup<SleepStatus>
                  label="Sleep"
                  value={sleepStatus}
                  disabled={dailySignalsDisabled}
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
                  disabled={dailySignalsDisabled}
                  options={energyStatusOptions}
                  onSelect={(value) =>
                    updateDailySignalsMutation.mutate({
                      date: dayInstance.date,
                      energyStatus: value,
                    })
                  }
                />
              </Stack>
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            variant="quiet"
            eyebrow="Day mode"
            title={activeMode.label.replace(' Mode', '')}
            description="Adjust only if today needs it."
            action={<StatusBadge label={activeMode.label} tone={currentDayMode} />}
          >
            <Stack spacing={1.5}>
              {updateDayModeMutation.isError ? (
                <Typography variant="body2" color="error.light">
                  Could not save the mode change. Try again.
                </Typography>
              ) : null}
              <DayModeSelector
                activeDayMode={currentDayMode}
                disabled={dayModeDisabled}
                onSelect={(dayMode) => updateDayModeMutation.mutate({ date: dayInstance.date, dayMode })}
              />
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            variant="quiet"
            eyebrow="Protection"
            title={topPriorities.length > 0 ? topPriorities[0].title : 'No urgent risk'}
            description={
              topPriorities.length > 0
                ? `${topPriorities.length} priority block${topPriorities.length === 1 ? '' : 's'} still need protection.`
                : 'Nothing is asking for extra protection right now.'
            }
          >
            <Stack spacing={1.25}>
              {operationalSignals.length > 0 ? (
                operationalSignals.slice(0, 2).map((signal) => (
                  <OperationalSignalCard
                    key={signal.id}
                    title={signal.title}
                    detail={signal.detail}
                    tone={signal.tone}
                    badge={signal.badge}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No protection alert is active right now.
                </Typography>
              )}
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            variant="quiet"
            eyebrow="Calendar"
            title="Outside commitments"
            description="Only the external pressure that bends today's shape."
            action={<Chip label={calendarSummary.severity} size="small" variant="outlined" />}
          >
            <Stack spacing={1.25}>
              {calendarSummary.constrainedWindows.length > 0 ? (
                calendarSummary.constrainedWindows.slice(0, 3).map((window) => (
                  <Typography key={`${window.startsAt}-${window.endsAt}`} variant="body2" color="text.secondary">
                    {window.reason}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No external calendar collision is shaping today's plan.
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
            variant="quiet"
            eyebrow="Prep"
            title={
              focusedPrepDomains.length > 0
                ? focusedPrepDomains.map((domain) => domain.label).join(', ')
                : 'No focused domain yet'
            }
            description="Current prep emphasis for today."
          >
            <Stack spacing={1.25}>
              {dayInstance.expectationSummary.map((expectation) => (
                <Typography key={expectation} variant="body2" color="text.secondary">
                  {expectation}
                </Typography>
              ))}
            </Stack>
          </SurfaceCard>
        </Stack>
      </Box>
    </Stack>
  )
}

function getWorkspaceErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Forge could not load this workspace.'
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
      <Typography variant="caption" color="primary.main" sx={{ letterSpacing: '0.08em' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  )
}

function ActionSummary({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      spacing={0.35}
      sx={(theme) => ({
        flex: 1,
        minWidth: { xs: '100%', sm: 0 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        px: 1.5,
        py: 1.2,
        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.42 : 0.22),
      })}
    >
      <Typography variant="caption" color="primary.main" sx={{ letterSpacing: '0.08em' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
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

function getFallbackKey(date: string, suggestedDayMode: DayMode, explanation: string) {
  return `${date}:${suggestedDayMode}:${explanation}`
}
