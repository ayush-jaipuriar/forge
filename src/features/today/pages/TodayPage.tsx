import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { useEffect, useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
import { SectionHeader } from '@/components/common/SectionHeader'
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
  const { data, isLoading } = useTodayWorkspace()
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

  function handleRevealRecommendation() {
    setShowRecommendation(true)
  }

  return (
    <Stack spacing={3}>
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at top right, rgba(212, 111, 60, 0.12), transparent 32%), linear-gradient(180deg, rgba(21, 27, 38, 0.98) 0%, rgba(12, 16, 24, 0.98) 100%)',
        }}
      >
        <SectionHeader
          eyebrow="Today"
          title={currentBlock?.title ?? dayInstance.focusLabel}
          description={`${weekdayLabel}, ${dateLabel}. ${currentBlock?.detail ?? dayInstance.label}.`}
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
            eyebrow="Now"
            title={currentBlock?.title ?? 'No active block'}
            description={
              currentBlock?.detail ??
              'Use the day focus until the next block starts.'
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
                    Now
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
                  <Chip label={`${scorePreview.projectedScore}/100`} size="small" variant="outlined" />
                </Stack>
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 900 }}>
                {currentBlock?.detail ??
                  'You are between timed blocks. Keep the day moving with the next recoverable action.'}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <ActionSummary label="Block" value={currentBlock?.startTime ?? 'Flexible'} />
                <ActionSummary
                  label="Main risk"
                  value={topPriorities.length > 0 ? topPriorities[0].title : 'No live priority'}
                />
                <ActionSummary label="Mode" value={activeMode.label.replace(' Mode', '')} />
              </Stack>
            </Stack>
          </SurfaceCard>

          {showRecommendation ? (
            <SurfaceCard
              eyebrow="Next"
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
              <Stack spacing={1.25}>
                {recommendation.alternativePath ? (
                  <Typography variant="body2" color="text.secondary">
                    Alternative: {recommendation.alternativePath}
                  </Typography>
                ) : null}
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
            eyebrow="Agenda"
            title="Agenda"
            description="Finish one block at a time."
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
                              ? 'Complete.'
                              : block.status === 'moved'
                                ? 'Moved later.'
                                : 'Skipped.'}
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
        <Stack spacing={2.5} sx={{ gridColumn: { xs: 1, lg: 2 } }}>
          <SurfaceCard
            eyebrow="Context"
            title="Signals"
            description="Only what can change today."
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.25,
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
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Day Mode"
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
                disabled={updateDayModeMutation.isPending}
                onSelect={(dayMode) => updateDayModeMutation.mutate({ date: dayInstance.date, dayMode })}
              />
            </Stack>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Main Risk"
            title={topPriorities.length > 0 ? topPriorities[0].title : 'No urgent risk'}
            description={`${topPriorities.length} priority blocks remain.`}
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
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            alignItems: 'start',
            gridColumn: '1 / -1',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          <SurfaceCard
            eyebrow="Calendar"
            title="Outside commitments"
            description="Shown only when it changes the plan."
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
        </Box>
      </Box>
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

function ActionSummary({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      spacing={0.35}
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: 0 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        px: 1.5,
        py: 1.25,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.36),
      }}
    >
      <Typography variant="caption" color="primary.light">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
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

function getFallbackKey(date: string, suggestedDayMode: DayMode, explanation: string) {
  return `${date}:${suggestedDayMode}:${explanation}`
}
