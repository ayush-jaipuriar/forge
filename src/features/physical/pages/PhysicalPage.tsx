import { useState } from 'react'
import { Alert, Button, CircularProgress, Divider, Grid, Stack, TextField, Typography } from '@mui/material'
import { MetricTile } from '@/components/common/MetricTile'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { usePlatformWorkspace } from '@/features/platform/hooks/usePlatformWorkspace'
import { usePhysicalWorkspace } from '@/features/physical/hooks/usePhysicalWorkspace'
import { useUpdateWorkoutLog } from '@/features/physical/hooks/useUpdateWorkoutLog'
import { useUpdateDailySignals } from '@/features/today/hooks/useUpdateDailySignals'

const sleepDurationOptions = [6, 7, 7.5, 8, 8.5, 9]

export function PhysicalPage() {
  const { data, isLoading } = usePhysicalWorkspace()
  const platformWorkspace = usePlatformWorkspace()
  const updateWorkoutMutation = useUpdateWorkoutLog()
  const updateSignalsMutation = useUpdateDailySignals()
  const [workoutNoteDraft, setWorkoutNoteDraft] = useState<string | null>(null)

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading physical workspace" description="Forge is restoring workout state and sleep logging for the day.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const activeWorkout = data.workout
  const persistedWorkoutNote = activeWorkout.note ?? activeWorkout.missReason ?? ''
  const activeWorkoutNoteDraft = workoutNoteDraft ?? persistedWorkoutNote
  const healthWorkspace = data.healthIntegration
  const workoutMutationDisabled = updateWorkoutMutation.isPending || updateWorkoutMutation.isCloudWriteUnavailable
  const signalsMutationDisabled = updateSignalsMutation.isPending || updateSignalsMutation.isCloudWriteUnavailable

  const executionSummary =
    activeWorkout.status === 'done'
      ? {
          title: 'Training is already accounted for today.',
          detail: 'Use the note field only if the session changed materially from plan.',
        }
      : activeWorkout.status === 'skipped'
        ? {
            title: 'Physical execution slipped today.',
            detail: 'Capture the miss reason cleanly so the week reads honestly later.',
          }
        : activeWorkout.status === 'rescheduled'
          ? {
              title: 'Training moved but still counts as live.',
              detail: 'Keep the note short so the change is easy to read later.',
            }
          : {
              title: 'Physical execution is still open today.',
              detail: 'The key question is whether training happened and whether sleep support is already visible enough to trust the day.',
            }

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Physical"
        title="Physical support should stay tied to execution."
        description={`${data.dayInstance.label} keeps workout state, sleep logging, and weekly training shape in one place.`}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Workout Status" value={activeWorkout.status} detail={activeWorkout.label} tone={activeWorkout.status === 'done' ? 'success' : activeWorkout.status === 'skipped' ? 'warning' : 'neutral'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Sleep Duration" value={data.sleepDurationHours != null ? `${data.sleepDurationHours}h` : 'Not logged'} detail={`Target: ${data.sleepTargetHours}h`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Sleep Target" value={data.sleepStatus === 'unknown' ? 'Pending' : data.sleepStatus === 'met' ? 'Met' : 'Missed'} detail="Derived from manual duration entry." tone={data.sleepStatus === 'met' ? 'success' : data.sleepStatus === 'missed' ? 'warning' : 'neutral'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Weekly Shape" value={`${data.weeklyWorkoutSummary.doneCount} done`} detail={`${data.weeklyWorkoutSummary.skippedCount} skipped · ${data.weeklyWorkoutSummary.rescheduledCount} rescheduled`} />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, xl: 7 }}>
          <SurfaceCard
            eyebrow="Daily Training Console"
            title={executionSummary.title}
            description={executionSummary.detail}
          >
            <Stack spacing={2.25}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricTile eyebrow="Scheduled Window" value={data.dayInstance.wakeWindow ?? 'Open'} detail="Day structure anchor from the generated plan." />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricTile eyebrow="Workout Plan" value={activeWorkout.label} detail={`Current state: ${activeWorkout.status}`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricTile eyebrow="Recovery Posture" value={data.sleepStatus === 'met' ? 'Supported' : data.sleepStatus === 'missed' ? 'Exposed' : 'Unknown'} detail="This stays intentionally simple in the current phase." tone={data.sleepStatus === 'met' ? 'success' : data.sleepStatus === 'missed' ? 'warning' : 'neutral'} />
                </Grid>
              </Grid>

              <Stack spacing={1}>
                <Typography variant="overline" color="primary.light">
                  Workout state
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" role="group" aria-label="Workout state">
                  <Button
                    size="small"
                    variant={activeWorkout.status === 'done' ? 'contained' : 'outlined'}
                    disabled={workoutMutationDisabled}
                    aria-pressed={activeWorkout.status === 'done'}
                    onClick={() => {
                      if (activeWorkout.status !== 'done') {
                        updateWorkoutMutation.mutate({
                          date: data.dateKey,
                          patch: {
                            ...activeWorkout,
                            status: 'done',
                            note: activeWorkoutNoteDraft.trim() || undefined,
                            missReason: undefined,
                          },
                        })
                      }
                    }}
                  >
                    Mark Done
                  </Button>
                  <Button
                    size="small"
                    variant={activeWorkout.status === 'skipped' ? 'contained' : 'outlined'}
                    disabled={workoutMutationDisabled}
                    aria-pressed={activeWorkout.status === 'skipped'}
                    onClick={() => {
                      if (activeWorkout.status !== 'skipped') {
                        updateWorkoutMutation.mutate({
                          date: data.dateKey,
                          patch: {
                            ...activeWorkout,
                            status: 'skipped',
                            note: undefined,
                            missReason: activeWorkoutNoteDraft.trim() || 'Skipped without a recorded reason.',
                          },
                        })
                      }
                    }}
                  >
                    Skip
                  </Button>
                  <Button
                    size="small"
                    variant={activeWorkout.status === 'rescheduled' ? 'contained' : 'outlined'}
                    disabled={workoutMutationDisabled}
                    aria-pressed={activeWorkout.status === 'rescheduled'}
                    onClick={() => {
                      if (activeWorkout.status !== 'rescheduled') {
                        updateWorkoutMutation.mutate({
                          date: data.dateKey,
                          patch: {
                            ...activeWorkout,
                            status: 'rescheduled',
                            note: activeWorkoutNoteDraft.trim() || 'Rescheduled to a different slot.',
                            missReason: undefined,
                          },
                        })
                      }
                    }}
                  >
                    Reschedule
                  </Button>
                  <Button
                    size="small"
                    variant={activeWorkout.status === (data.scheduledWorkout?.status ?? 'optional') ? 'contained' : 'outlined'}
                    disabled={workoutMutationDisabled}
                    aria-pressed={activeWorkout.status === (data.scheduledWorkout?.status ?? 'optional')}
                    onClick={() => {
                      if (activeWorkout.status !== (data.scheduledWorkout?.status ?? 'optional')) {
                        updateWorkoutMutation.mutate({
                          date: data.dateKey,
                          patch: {
                            date: data.dateKey,
                            workoutType: activeWorkout.workoutType,
                            label: activeWorkout.label,
                            status: data.scheduledWorkout?.status ?? 'optional',
                            note: undefined,
                            missReason: undefined,
                          },
                        })
                      }
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>

              <TextField
                label="Workout note / miss reason"
                multiline
                minRows={3}
                value={activeWorkoutNoteDraft}
                onChange={(event) => setWorkoutNoteDraft(event.target.value)}
                helperText="Keep this short: what changed, what slipped, or what was adjusted."
              />
            </Stack>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, xl: 5 }}>
          <Stack spacing={2} height="100%">
            <SurfaceCard
              eyebrow="Sleep Support"
              title="Manual sleep signal"
              description="Sleep stays fast to log because the goal is support quality, not tracker detail."
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {sleepDurationOptions.map((hours) => (
                    <Button
                      key={hours}
                      size="small"
                      variant={data.sleepDurationHours === hours ? 'contained' : 'outlined'}
                      disabled={signalsMutationDisabled}
                      onClick={() =>
                        updateSignalsMutation.mutate({
                          date: data.dateKey,
                          sleepDurationHours: hours,
                        })
                      }
                    >
                      {hours}h
                    </Button>
                  ))}
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={signalsMutationDisabled}
                    onClick={() =>
                      updateSignalsMutation.mutate({
                        date: data.dateKey,
                        sleepDurationHours: null,
                        sleepStatus: 'unknown',
                      })
                    }
                  >
                    Clear
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Wake target: {data.dayInstance.wakeWindow ?? 'Not specified'} · Sleep target: {data.dayInstance.sleepWindow ?? 'Not specified'}
                </Typography>
                <Typography variant="body2" color="primary.light">
                  Derived status: {data.sleepStatus === 'unknown' ? 'Not logged yet' : data.sleepStatus === 'met' ? 'Target met' : 'Target missed'}
                </Typography>
              </Stack>
            </SurfaceCard>

            <SurfaceCard
              eyebrow="Weekly Training Shape"
              title={`${data.weeklyWorkoutSummary.scheduledCount} scheduled sessions + ${data.weeklyWorkoutSummary.optionalCount} optional windows`}
              description="A quick read on whether physical execution is supporting the larger routine."
            >
              <Stack spacing={1.1} divider={<Divider flexItem />}>
                {data.weeklyWorkoutSummary.labels.map((label) => (
                  <Typography key={label} variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                ))}
              </Stack>
            </SurfaceCard>
          </Stack>
        </Grid>
      </Grid>

      <SurfaceCard
        eyebrow="Health Provider Integration"
        title="Recovery and sleep provider path"
        description="Provider work is planned and future-facing."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={1.1}>
              <Typography variant="body2" color="text.secondary">
                {healthWorkspace.statusSummaryLabel}
              </Typography>
              {healthWorkspace.providers.slice(0, 2).map((provider) => (
                <Typography key={provider.provider} variant="body2" color="text.secondary">
                  {provider.displayName}: {provider.unavailableLabel} · {provider.supportedSignalCount} signals planned
                </Typography>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Alert severity="info" variant="outlined">
              {platformWorkspace.runtime === 'nativeShell'
                ? 'The native shell exists, but automated sleep and recovery ingestion still needs real provider bridges and native permission work. Sleep duration remains manual until those bridges land.'
                : 'Sleep duration stays manual in the current phase. When Apple Health or Google Health Connect lands later, those signals can appear here without pretending they already exist today.'}
            </Alert>
          </Grid>
        </Grid>
      </SurfaceCard>
    </Stack>
  )
}
