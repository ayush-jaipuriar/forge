import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { useUiStore } from '@/app/store/uiStore'
import { formatCalendarTimestamp, getCalendarStatusTone } from '@/domain/calendar/presentation'
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
  const calendarTone = getCalendarStatusTone({
    connectionStatus: calendar.connectionStatus,
    externalSyncStatus: calendar.syncState?.externalEventSyncStatus ?? 'idle',
    mirrorSyncStatus: calendar.syncState?.mirrorSyncStatus ?? 'idle',
  })
  const resolvedSelectedDate =
    selectedDate && weekInstances.some((day) => day.date === selectedDate) ? selectedDate : weekInstances[0]?.date ?? null
  const selectedDay = weekInstances.find((day) => day.date === resolvedSelectedDate) ?? weekInstances[0]
  const constrainedDayCount = weekInstances.filter((day) => day.calendarSummary?.severity && day.calendarSummary.severity !== 'none').length
  const overrideCount = weekInstances.filter((day) => day.isDayTypeOverridden || day.dayMode !== 'normal').length
  const pendingMajorBlocks = weekInstances.reduce(
    (count, day) => count + day.blocks.filter((block) => block.status === 'planned').length,
    0,
  )
  const topWeekSignals = globalSignals.slice(0, 3)

  return (
    <Stack spacing={3}>
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at top right, rgba(212, 111, 60, 0.12), transparent 30%), linear-gradient(180deg, rgba(20, 25, 36, 0.98) 0%, rgba(11, 15, 23, 0.98) 100%)',
        }}
      >
        <Stack spacing={2.25}>
          <SectionHeader
            eyebrow="Schedule"
            title="Operate the week before drift compounds."
            description="This surface keeps the seeded weekly routine intact while making pressure, overrides, and recoverable interventions visible in one planning board."
            action={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <SyncIndicator status={syncStatus} />
                <Chip
                  icon={<CalendarMonthRoundedIcon />}
                  label={`${constrainedDayCount} constrained day${constrainedDayCount === 1 ? '' : 's'}`}
                  size="small"
                  color={calendarTone}
                />
              </Stack>
            }
          />

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <ScheduleHeroMetric
              label="Week Pressure"
              value={`${topWeekSignals.length} live signal${topWeekSignals.length === 1 ? '' : 's'}`}
              detail={topWeekSignals[0]?.title ?? 'No schedule-level planning pressure right now'}
            />
            <ScheduleHeroMetric
              label="Overrides"
              value={`${overrideCount}`}
              detail={`${pendingMajorBlocks} planned major block${pendingMajorBlocks === 1 ? '' : 's'} still open this week`}
            />
            <ScheduleHeroMetric
              label="External Pressure"
              value={`${constrainedDayCount}/7`}
              detail={`Last external sync ${formatCalendarTimestamp(calendar.syncState?.lastExternalSyncAt, 'Not synced yet')}`}
            />
          </Box>
        </Stack>
      </SurfaceCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.05fr) 360px',
          },
          alignItems: 'start',
        }}
      >
        <SurfaceCard
          eyebrow="Weekly Board"
          title="See the routine as a system, not a list."
          description="Choose a day first. The board stays high-level so the week remains scannable."
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              pb: 0.5,
            }}
          >
            {weekInstances.map((day) => {
              const isSelected = selectedDay.date === day.date
              const overlapCount = day.calendarSummary?.overlappingEventCount ?? 0
              const outstandingBlocks = day.blocks.filter((block) => block.status === 'planned').length

              return (
                <Box
                  key={day.id}
                  component="button"
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  sx={{
                    flex: '0 0 248px',
                    textAlign: 'left',
                    border: '1px solid',
                    borderColor: isSelected ? forgeTokens.palette.border.accent : 'divider',
                    borderRadius: 4,
                    p: 2,
                    background: isSelected
                      ? `linear-gradient(180deg, ${alpha(forgeTokens.palette.accent.ember, 0.09)} 0%, ${alpha(forgeTokens.palette.background.panel, 0.98)} 100%)`
                      : `linear-gradient(180deg, ${alpha(forgeTokens.palette.background.panel, 0.96)} 0%, ${alpha(forgeTokens.palette.background.surface, 0.96)} 100%)`,
                    color: 'text.primary',
                    cursor: 'pointer',
                    transition: 'border-color 160ms ease, background-color 160ms ease, transform 160ms ease',
                    '&:hover': {
                      borderColor: alpha(forgeTokens.palette.accent.ember, 0.48),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack spacing={0.4}>
                      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                        <Typography variant="overline" color="primary.light">
                          {day.weekdayLabel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {day.dateLabel}
                        </Typography>
                      </Stack>
                      <Typography variant="h3">{day.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {day.focusLabel}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      <StatusBadge label={scheduleModeLabels[day.dayMode]} tone={day.dayMode} />
                      {day.isDayTypeOverridden ? (
                        <Chip label="Override active" size="small" color="warning" variant="outlined" />
                      ) : null}
                      {overlapCount > 0 ? (
                        <Chip label={`${overlapCount} overlap${overlapCount === 1 ? '' : 's'}`} size="small" color="warning" variant="outlined" />
                      ) : null}
                    </Stack>

                    <Stack spacing={0.8}>
                      {day.blocks.slice(0, 3).map((block) => (
                        <Stack
                          key={block.id}
                          spacing={0.25}
                          sx={{
                            borderLeft: '2px solid',
                            borderColor:
                              block.status === 'completed'
                                ? forgeTokens.palette.accent.success
                                : block.status === 'planned'
                                  ? forgeTokens.palette.accent.ember
                                  : forgeTokens.palette.accent.warning,
                            pl: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {block.startTime ?? (block.durationMinutes ? `${block.durationMinutes}m` : 'Flexible')}
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {block.title}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {outstandingBlocks} planned block{outstandingBlocks === 1 ? '' : 's'} · {day.blocks.length} total blocks
                    </Typography>
                  </Stack>
                </Box>
              )
            })}
          </Box>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Selected Day"
          title={`${selectedDay.weekdayLabel} · ${selectedDay.label}`}
          description={selectedDay.focusLabel}
          action={
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              <StatusBadge label={scheduleModeLabels[selectedDay.dayMode]} tone={selectedDay.dayMode} />
              <Chip
                icon={<EventRepeatRoundedIcon />}
                label={selectedDay.isDayTypeOverridden ? 'Override active' : 'Seeded day type'}
                size="small"
                color={selectedDay.isDayTypeOverridden ? 'warning' : 'default'}
                variant="outlined"
              />
            </Stack>
          }
        >
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gap: 1.25,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <ScheduleDataRow label="Base day type" value={dayTypeLabels[selectedDay.baseDayType]} detail="Seeded routine source" />
              <ScheduleDataRow label="Active day type" value={dayTypeLabels[selectedDay.dayType]} detail="Current planning classification" />
              <ScheduleDataRow
                label="Calendar pressure"
                value={
                  selectedDay.calendarSummary?.severity && selectedDay.calendarSummary.severity !== 'none'
                    ? `${selectedDay.calendarSummary.overlappingEventCount} overlap${selectedDay.calendarSummary.overlappingEventCount === 1 ? '' : 's'}`
                    : 'No live overlap'
                }
                detail="Outside commitments shape pressure, not the routine source of truth"
              />
              <ScheduleDataRow
                label="Major blocks"
                value={`${selectedDay.blocks.length}`}
                detail={`${selectedDay.blocks.filter((block) => block.status === 'planned').length} still planned`}
              />
            </Box>

            <Stack spacing={1}>
              <Typography variant="overline" color="primary.light">
                Day Type Override
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" role="group" aria-label="Allowed day types">
                {selectedDay.allowedDayTypes.map((option) => (
                  <Button
                    key={option.value}
                    size="small"
                    variant={option.value === selectedDay.dayType ? 'contained' : 'outlined'}
                    disabled={updateDayTypeOverrideMutation.isPending}
                    aria-pressed={option.value === selectedDay.dayType}
                    onClick={() => {
                      if (option.value !== selectedDay.dayType) {
                        updateDayTypeOverrideMutation.mutate({
                          date: selectedDay.date,
                          dayType: option.value,
                        })
                      }
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Overrides are date-scoped. They do not rewrite seeded templates.
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="overline" color="primary.light">
                Fallback Activation
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" role="group" aria-label="Fallback activation">
                <Button
                  size="small"
                  variant={selectedDay.dayMode === 'lowEnergy' ? 'contained' : 'outlined'}
                  disabled={updateDayModeMutation.isPending}
                  aria-pressed={selectedDay.dayMode === 'lowEnergy'}
                  onClick={() => {
                    if (selectedDay.dayMode !== 'lowEnergy') {
                      updateDayModeMutation.mutate({ date: selectedDay.date, dayMode: 'lowEnergy' })
                    }
                  }}
                >
                  Low Energy
                </Button>
                <Button
                  size="small"
                  variant={selectedDay.dayMode === 'survival' ? 'contained' : 'outlined'}
                  disabled={updateDayModeMutation.isPending}
                  aria-pressed={selectedDay.dayMode === 'survival'}
                  onClick={() => {
                    if (selectedDay.dayMode !== 'survival') {
                      updateDayModeMutation.mutate({ date: selectedDay.date, dayMode: 'survival' })
                    }
                  }}
                >
                  Survival
                </Button>
                <Button
                  size="small"
                  variant={selectedDay.dayMode === 'normal' ? 'contained' : 'outlined'}
                  disabled={updateDayModeMutation.isPending}
                  aria-pressed={selectedDay.dayMode === 'normal'}
                  onClick={() => {
                    if (selectedDay.dayMode !== 'normal') {
                      updateDayModeMutation.mutate({ date: selectedDay.date, dayMode: 'normal' })
                    }
                  }}
                >
                  Return to Normal
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </SurfaceCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: selectedDay.operationalSignals.length > 0 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
          },
          alignItems: 'start',
        }}
      >
        <SurfaceCard
          eyebrow="Planning Pressure"
          title="What this week needs from you"
          description="Schedule signals translated into planning language."
        >
          <Stack spacing={1.25}>
            {globalSignals.length > 0 ? (
              globalSignals.map((signal) => (
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
                No cross-week planning signals are elevated right now.
              </Typography>
            )}
          </Stack>
        </SurfaceCard>

        {selectedDay.operationalSignals.length > 0 ? (
          <SurfaceCard
            eyebrow="Expectation Layer"
            title="Signals worth honoring on the selected day"
            description="Use these before you edit or force block movement."
          >
            <Stack spacing={1}>
              {selectedDay.operationalSignals.map((signal) => (
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
          eyebrow="Calendar Context"
          title="Outside commitments shaping the week"
          description="Calendar pressure stays visible as a planning constraint."
          action={
            <Chip
              icon={<EventBusyRoundedIcon />}
              label={`${calendar.connectionStatus} · ${calendar.syncState?.externalEventSyncStatus ?? 'idle'}`}
              size="small"
              variant="outlined"
              color={calendarTone}
            />
          }
        >
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Constrained days this week: {calendar.constrainedDayCount}. Last external sync: {formatCalendarTimestamp(calendar.syncState?.lastExternalSyncAt)}.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last mirror sync: {formatCalendarTimestamp(calendar.syncState?.lastMirrorSyncAt)}.
            </Typography>
            {calendar.syncState?.lastMirrorSyncError ? (
              <Typography variant="body2" color="warning.light">
                Mirror sync issue: {calendar.syncState.lastMirrorSyncError}
              </Typography>
            ) : null}
            {selectedDay.calendarSummary?.severity && selectedDay.calendarSummary.severity !== 'none' ? (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: alpha(forgeTokens.palette.accent.warning, 0.24),
                  borderRadius: 4,
                  p: 1.5,
                  backgroundColor: alpha(forgeTokens.palette.accent.warning, 0.05),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningAmberRoundedIcon color="warning" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {selectedDay.calendarSummary.overlappingEventCount} external event
                    {selectedDay.calendarSummary.overlappingEventCount === 1 ? '' : 's'} overlap timed blocks on the selected day.
                  </Typography>
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </SurfaceCard>
      </Box>

      <SurfaceCard
        eyebrow="Major Blocks"
        title={`${selectedDay.weekdayLabel} execution stack`}
        description="The selected day’s blocks stay full-width so actions and state changes are easier to scan."
      >
        <Stack spacing={1.25}>
          {selectedDay.blocks.map((block) => {
            const allowedTransitions = getAllowedScheduleBlockTransitions(block.status)

            return (
              <Box
                key={block.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  p: 1.75,
                  backgroundColor: alpha(forgeTokens.palette.background.panel, 0.82),
                }}
              >
                <Stack spacing={1.1}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="primary.light">
                        {block.startTime ?? (block.durationMinutes ? `${block.durationMinutes}m` : 'Flexible')}
                      </Typography>
                      <Typography variant="body1">{block.title}</Typography>
                    </Stack>
                    <Chip label={scheduleBlockStatusLabels[block.status]} size="small" variant="outlined" />
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
                            date: selectedDay.date,
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
                            date: selectedDay.date,
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
                            date: selectedDay.date,
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
                            date: selectedDay.date,
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
              </Box>
            )
          })}
        </Stack>
      </SurfaceCard>
    </Stack>
  )
}

function ScheduleHeroMetric({
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
      spacing={0.55}
      sx={{
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.12),
        borderRadius: 4,
        p: 1.75,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.18),
      }}
    >
      <Typography variant="overline" color="primary.light">
        {label}
      </Typography>
      <Typography variant="h3">{value}</Typography>
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  )
}

function ScheduleDataRow({
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
      spacing={0.35}
      sx={{
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.1),
        borderRadius: 4,
        p: 1.5,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.12),
      }}
    >
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

const scheduleModeLabels = {
  ideal: 'Ideal',
  normal: 'Normal',
  lowEnergy: 'Low Energy',
  survival: 'Survival',
}

const scheduleBlockStatusLabels = {
  planned: 'Planned',
  completed: 'Completed',
  moved: 'Moved',
  skipped: 'Skipped',
}
