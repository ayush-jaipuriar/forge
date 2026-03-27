import { useState } from 'react'
import { Button, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material'
import { MetricTile } from '@/components/common/MetricTile'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { usePhysicalWorkspace } from '@/features/physical/hooks/usePhysicalWorkspace'
import { useUpdateWorkoutLog } from '@/features/physical/hooks/useUpdateWorkoutLog'
import { useUpdateDailySignals } from '@/features/today/hooks/useUpdateDailySignals'

const sleepDurationOptions = [6, 7, 7.5, 8, 8.5, 9]

export function PhysicalPage() {
  const { data, isLoading } = usePhysicalWorkspace()
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

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Physical"
        title="Physical execution is part of the score."
        description={`Today's ${data.dayInstance.label} now carries a persisted workout state and manual sleep duration instead of staying as static schedule copy.`}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Workout Status" value={activeWorkout.status} detail={activeWorkout.label} tone={activeWorkout.status === 'done' ? 'success' : 'neutral'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Sleep Duration" value={data.sleepDurationHours != null ? `${data.sleepDurationHours}h` : 'Not logged'} detail={`Target: ${data.sleepTargetHours}h`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Sleep Target" value={data.sleepStatus === 'unknown' ? 'Pending' : data.sleepStatus === 'met' ? 'Met' : 'Missed'} detail="Derived automatically from manual duration entry." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Completion Trend" value={`${data.weeklyWorkoutSummary.doneCount} done`} detail={`${data.weeklyWorkoutSummary.skippedCount} skipped · ${data.weeklyWorkoutSummary.rescheduledCount} rescheduled`} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SurfaceCard
            eyebrow="Workout"
            title={activeWorkout.label}
            description="Phase 1 keeps workout logging lightweight: status, quick note, and miss reason all stay in one operational record."
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  size="small"
                  variant={activeWorkout.status === 'done' ? 'contained' : 'outlined'}
                  disabled={updateWorkoutMutation.isPending}
                  onClick={() =>
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
                >
                  Mark Done
                </Button>
                <Button
                  size="small"
                  variant={activeWorkout.status === 'skipped' ? 'contained' : 'outlined'}
                  disabled={updateWorkoutMutation.isPending}
                  onClick={() =>
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
                >
                  Skip
                </Button>
                <Button
                  size="small"
                  variant={activeWorkout.status === 'rescheduled' ? 'contained' : 'outlined'}
                  disabled={updateWorkoutMutation.isPending}
                  onClick={() =>
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
                >
                  Reschedule
                </Button>
                <Button
                  size="small"
                  variant={activeWorkout.status === (data.scheduledWorkout?.status ?? 'optional') ? 'contained' : 'outlined'}
                  disabled={updateWorkoutMutation.isPending}
                  onClick={() =>
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
                >
                  Reset
                </Button>
              </Stack>

              <TextField
                label="Workout note / miss reason"
                multiline
                minRows={2}
                value={activeWorkoutNoteDraft}
                onChange={(event) => setWorkoutNoteDraft(event.target.value)}
                helperText="Keep this short: why it moved, what got skipped, or what adjustment was made."
              />
            </Stack>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SurfaceCard
            eyebrow="Sleep"
            title="Manual sleep logging with target derivation"
            description="Phase 1 keeps this fast. Duration is the primary input and target-met status is derived instead of being logged separately."
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {sleepDurationOptions.map((hours) => (
                  <Button
                    key={hours}
                    size="small"
                    variant={data.sleepDurationHours === hours ? 'contained' : 'outlined'}
                    disabled={updateSignalsMutation.isPending}
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
                  disabled={updateSignalsMutation.isPending}
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
        </Grid>
      </Grid>

      <SurfaceCard
        eyebrow="Weekly Training Shape"
        title={`${data.weeklyWorkoutSummary.scheduledCount} scheduled sessions + ${data.weeklyWorkoutSummary.optionalCount} optional windows`}
        description="This stays lightweight in V1: the important thing is whether planned physical execution actually happened and how often it slipped."
      >
        <Stack spacing={1}>
          {data.weeklyWorkoutSummary.labels.map((label) => (
            <Typography key={label} variant="body2" color="text.secondary">
              {label}
            </Typography>
          ))}
        </Stack>
      </SurfaceCard>
    </Stack>
  )
}
