import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { useEffect } from 'react'
import { Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { MetricTile } from '@/components/common/MetricTile'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { useUiStore } from '@/app/store/uiStore'
import { DayModeSelector } from '@/features/today/components/DayModeSelector'
import { useTodayWorkspace } from '@/features/today/hooks/useTodayWorkspace'
import { useUpdateDayMode } from '@/features/today/hooks/useUpdateDayMode'

export function TodayPage() {
  const { data, isLoading } = useTodayWorkspace()
  const setDayMode = useUiStore((state) => state.setDayMode)
  const currentDayMode = useUiStore((state) => state.dayMode)
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
      >
        <DayModeSelector
          activeDayMode={currentDayMode}
          disabled={updateDayModeMutation.isPending}
          onSelect={(dayMode) => updateDayModeMutation.mutate({ date: dayInstance.date, dayMode })}
        />
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
