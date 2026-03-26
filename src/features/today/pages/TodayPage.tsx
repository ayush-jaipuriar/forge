import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { useEffect } from 'react'
import { Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { MetricTile } from '@/components/common/MetricTile'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { useUiStore } from '@/app/store/uiStore'
import { DayModeSelector } from '@/features/today/components/DayModeSelector'
import { useTodayWorkspace } from '@/features/today/hooks/useTodayWorkspace'
import { useUpdateDayMode } from '@/features/today/hooks/useUpdateDayMode'
import type { DayMode, SyncStatus } from '@/domain/common/types'

export function TodayPage() {
  const { data, isLoading } = useTodayWorkspace()
  const setDayMode = useUiStore((state) => state.setDayMode)
  const currentDayMode = useUiStore((state) => state.dayMode)
  const syncStatus = useUiStore((state) => state.syncStatus)
  const updateDayModeMutation = useUpdateDayMode()

  useEffect(() => {
    if (data) {
      setDayMode(data.dayInstance.dayMode)
    }
  }, [data, setDayMode])

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading today's operating plan" description="Forge is restoring the locally cached day instance.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const { currentBlock, dateLabel, dayInstance, scheduledWorkout, topPriorities, weekdayLabel } = data
  const activeMode = dayModeDetails[currentDayMode]
  const modeFeedback = getModeFeedback({
    dayMode: currentDayMode,
    syncStatus,
    isPending: updateDayModeMutation.isPending,
    isError: updateDayModeMutation.isError,
    errorMessage: updateDayModeMutation.error instanceof Error ? updateDayModeMutation.error.message : null,
  })

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
              <Button variant="contained" startIcon={<KeyboardDoubleArrowRightRoundedIcon />}>
                What should I do now?
              </Button>
              <Button variant="outlined" startIcon={<AccessTimeRoundedIcon />}>
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
          <MetricTile eyebrow="Current Block" value={currentBlock?.title ?? 'No active block'} detail={currentBlock?.detail ?? 'No block matched the current time.'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="Workout"
            value={scheduledWorkout?.label ?? 'Recovery / Flex'}
            detail="Physical execution is read from the seeded workout schedule."
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Priority Count" value={`${topPriorities.length} live`} detail="Deep work, required-output blocks, and workout windows are prioritized first." />
        </Grid>
      </Grid>

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
                    <Typography variant="h3">{block.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {block.detail}
                    </Typography>
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
