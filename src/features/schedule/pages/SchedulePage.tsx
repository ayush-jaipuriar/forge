import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import { Button, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { useUiStore } from '@/app/store/uiStore'
import { getAllowedScheduleBlockTransitions, dayTypeLabels } from '@/domain/schedule/overrideRules'
import { useUpdateDayMode } from '@/features/today/hooks/useUpdateDayMode'
import { useUpdateBlockStatus } from '@/features/today/hooks/useUpdateBlockStatus'
import { useWeeklyWorkspace } from '@/features/schedule/hooks/useWeeklyWorkspace'
import { useUpdateDayTypeOverride } from '@/features/schedule/hooks/useUpdateDayTypeOverride'

export function SchedulePage() {
  const { data: weekWorkspace, isLoading } = useWeeklyWorkspace()
  const syncStatus = useUiStore((state) => state.syncStatus)
  const updateDayTypeOverrideMutation = useUpdateDayTypeOverride()
  const updateDayModeMutation = useUpdateDayMode()
  const updateBlockStatusMutation = useUpdateBlockStatus()

  if (isLoading || !weekWorkspace) {
    return (
      <SurfaceCard title="Loading weekly routine" description="Forge is restoring the locally cached week view.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const { calendar, days: weekInstances, globalSignals } = weekWorkspace

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Schedule"
        title="Weekly routine with controlled operational overrides."
        description="This view exposes allowed day reclassification, fallback activation, and block-level operational actions without turning the seeded routine into an editor."
        action={<SyncIndicator status={syncStatus} />}
      />
      <SurfaceCard
        eyebrow="Calendar Pressure"
        title="External commitments across the operational week"
        description="Forge now reads Google Calendar pressure into the week view, but keeps the routine model in charge of what the week should be."
        action={
          <Chip
            icon={<CalendarMonthRoundedIcon />}
            label={`${calendar.connectionStatus} · ${calendar.syncState?.externalEventSyncStatus ?? 'idle'}`}
            variant="outlined"
            size="small"
            color={calendar.constrainedDayCount > 0 ? 'warning' : 'default'}
          />
        }
      >
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary">
            Constrained days this week: {calendar.constrainedDayCount}. Last external sync: {calendar.syncState?.lastExternalSyncAt ?? 'Not yet synced'}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The week view now treats outside events as pressure and collision context, not as a routine editor.
          </Typography>
        </Stack>
      </SurfaceCard>
      {globalSignals.length > 0 ? (
        <SurfaceCard
          eyebrow="Planning Pressure"
          title="What this week needs from the schedule"
          description="These are the highest-value planning signals from the analytics layer, translated into schedule language instead of dashboard language."
        >
          <Stack spacing={1.25}>
            {globalSignals.map((signal) => (
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
      <Grid container spacing={2}>
        {weekInstances.map((day) => (
          <Grid key={day.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <SurfaceCard
              eyebrow={`${day.weekdayLabel} · ${day.dateLabel}`}
              title={day.label}
              description={day.focusLabel}
              action={
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    icon={<EventRepeatRoundedIcon />}
                    label={day.isDayTypeOverridden ? 'Override Active' : 'Seeded Day Type'}
                    color={day.isDayTypeOverridden ? 'warning' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                  <StatusBadge label={scheduleModeLabels[day.dayMode]} tone={day.dayMode} />
                </Stack>
              }
            >
              <Stack spacing={2}>
                <Stack spacing={0.75}>
                  <Typography variant="body2" color="text.secondary">
                    Base day type: {dayTypeLabels[day.baseDayType]}
                  </Typography>
                  <Typography variant="body2" color="primary.light">
                    Active day type: {dayTypeLabels[day.dayType]}
                  </Typography>
                  {day.calendarSummary && day.calendarSummary.severity !== 'none' ? (
                    <Typography variant="body2" color="warning.light">
                      Calendar pressure: {day.calendarSummary.overlappingEventCount} external event{day.calendarSummary.overlappingEventCount === 1 ? '' : 's'} overlap timed blocks.
                    </Typography>
                  ) : null}
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="overline" color="primary.light">
                    Day Type Override
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {day.allowedDayTypes.map((option) => (
                      <Button
                        key={option.value}
                        size="small"
                        variant={option.value === day.dayType ? 'contained' : 'outlined'}
                        disabled={updateDayTypeOverrideMutation.isPending || option.value === day.dayType}
                        onClick={() =>
                          updateDayTypeOverrideMutation.mutate({
                            date: day.date,
                            dayType: option.value,
                          })
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Overrides are date-scoped reclassifications only. They do not edit the seeded routine templates.
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="overline" color="primary.light">
                    Fallback Activation
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button
                      size="small"
                      variant={day.dayMode === 'lowEnergy' ? 'contained' : 'outlined'}
                      disabled={updateDayModeMutation.isPending || day.dayMode === 'lowEnergy'}
                      onClick={() => updateDayModeMutation.mutate({ date: day.date, dayMode: 'lowEnergy' })}
                    >
                      Low Energy
                    </Button>
                    <Button
                      size="small"
                      variant={day.dayMode === 'survival' ? 'contained' : 'outlined'}
                      disabled={updateDayModeMutation.isPending || day.dayMode === 'survival'}
                      onClick={() => updateDayModeMutation.mutate({ date: day.date, dayMode: 'survival' })}
                    >
                      Survival
                    </Button>
                    <Button
                      size="small"
                      variant={day.dayMode === 'normal' ? 'contained' : 'outlined'}
                      disabled={updateDayModeMutation.isPending || day.dayMode === 'normal'}
                      onClick={() => updateDayModeMutation.mutate({ date: day.date, dayMode: 'normal' })}
                    >
                      Return to Normal
                    </Button>
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="overline" color="primary.light">
                    Expectations
                  </Typography>
                  {day.operationalSignals.length > 0 ? (
                    <Stack spacing={1}>
                      {day.operationalSignals.map((signal) => (
                        <OperationalSignalCard
                          key={signal.id}
                          title={signal.title}
                          detail={signal.detail}
                          tone={signal.tone}
                          badge={signal.badge}
                        />
                      ))}
                    </Stack>
                  ) : null}
                  {day.expectationSummary.slice(0, 2).map((expectation) => (
                    <Typography key={expectation} variant="body2" color="text.secondary">
                      {expectation}
                    </Typography>
                  ))}
                </Stack>

                <Stack spacing={1.25}>
                  <Typography variant="overline" color="primary.light">
                    Major Blocks
                  </Typography>
                  {day.blocks.slice(0, 4).map((block) => {
                    const allowedTransitions = getAllowedScheduleBlockTransitions(block.status)

                    return (
                      <Stack
                        key={block.id}
                        spacing={1}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          p: 1.5,
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        }}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Typography variant="body1">{block.title}</Typography>
                          <Chip label={block.status.toUpperCase()} size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {block.detail}
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {allowedTransitions.includes('completed') ? (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: day.date,
                                  blockId: block.id,
                                  status: 'completed',
                                })
                              }
                            >
                              Done
                            </Button>
                          ) : null}
                          {allowedTransitions.includes('moved') ? (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: day.date,
                                  blockId: block.id,
                                  status: 'moved',
                                })
                              }
                            >
                              Move Later
                            </Button>
                          ) : null}
                          {allowedTransitions.includes('skipped') ? (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: day.date,
                                  blockId: block.id,
                                  status: 'skipped',
                                })
                              }
                            >
                              Skip
                            </Button>
                          ) : null}
                          {allowedTransitions.includes('planned') ? (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={updateBlockStatusMutation.isPending}
                              onClick={() =>
                                updateBlockStatusMutation.mutate({
                                  date: day.date,
                                  blockId: block.id,
                                  status: 'planned',
                                })
                              }
                            >
                              Restore
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                    )
                  })}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {day.blocks.length} total blocks in this day template
                </Typography>
              </Stack>
            </SurfaceCard>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

const scheduleModeLabels = {
  ideal: 'Ideal',
  normal: 'Normal',
  lowEnergy: 'Low Energy',
  survival: 'Survival',
}
