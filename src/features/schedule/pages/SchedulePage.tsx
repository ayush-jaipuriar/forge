import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import { Button, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material'
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
  const { data: weekInstances, isLoading } = useWeeklyWorkspace()
  const syncStatus = useUiStore((state) => state.syncStatus)
  const updateDayTypeOverrideMutation = useUpdateDayTypeOverride()
  const updateDayModeMutation = useUpdateDayMode()
  const updateBlockStatusMutation = useUpdateBlockStatus()

  if (isLoading || !weekInstances) {
    return (
      <SurfaceCard title="Loading weekly routine" description="Forge is restoring the locally cached week view.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Schedule"
        title="Weekly routine with controlled operational overrides."
        description="This view exposes allowed day reclassification, fallback activation, and block-level operational actions without turning the seeded routine into an editor."
        action={<SyncIndicator status={syncStatus} />}
      />
      <SurfaceCard
        eyebrow="Calendar Mirror"
        title="Future calendar status placeholder"
        description="Phase 1 keeps calendar work out of the critical path, but the Schedule screen now reserves space for that future mirror so we do not design ourselves into a corner."
        action={<Chip icon={<CalendarMonthRoundedIcon />} label="Not Connected Yet" variant="outlined" size="small" />}
      >
        <Typography variant="body2" color="text.secondary">
          When calendar scaffolding becomes real, this area should show whether outside commitments are mirrored into the operational week without letting external events rewrite the routine itself.
        </Typography>
      </SurfaceCard>
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
