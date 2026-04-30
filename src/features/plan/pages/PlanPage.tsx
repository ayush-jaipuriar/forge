import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { useUiStore } from '@/app/store/uiStore'
import { OperationalSignalCard } from '@/components/common/OperationalSignalCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { formatCalendarTimestamp, getCalendarStatusTone } from '@/domain/calendar/presentation'
import { dayTypeLabels, getAllowedScheduleBlockTransitions } from '@/domain/schedule/overrideRules'
import { prepDomainLabels } from '@/domain/prep/selectors'
import type { PrepDomainKey } from '@/domain/prep/types'
import type { getPrepWorkspace } from '@/services/prep/prepPersistenceService'
import type { getOrCreateWeeklyWorkspace } from '@/services/routine/routinePersistenceService'
import { usePrepWorkspace } from '@/features/prep/hooks/usePrepWorkspace'
import { useUpdatePrepTopicProgress } from '@/features/prep/hooks/useUpdatePrepTopicProgress'
import { useWeeklyWorkspace } from '@/features/schedule/hooks/useWeeklyWorkspace'
import { useUpdateDayTypeOverride } from '@/features/schedule/hooks/useUpdateDayTypeOverride'
import { useUpdateBlockStatus } from '@/features/today/hooks/useUpdateBlockStatus'
import { useUpdateDayMode } from '@/features/today/hooks/useUpdateDayMode'

type WeeklyWorkspace = Awaited<ReturnType<typeof getOrCreateWeeklyWorkspace>>
type PlanDay = WeeklyWorkspace['days'][number]
type PlanBlock = PlanDay['blocks'][number]
type PrepWorkspace = Awaited<ReturnType<typeof getPrepWorkspace>>
type PrepTopic = PrepWorkspace['topicsByDomain'][PrepDomainKey][number]

export function PlanPage() {
  const [searchParams] = useSearchParams()
  const {
    data: weekWorkspace,
    error: weekError,
    isError: isWeekError,
    isLoading: isWeekLoading,
    refetch: refetchWeek,
  } = useWeeklyWorkspace()
  const {
    data: prepWorkspace,
    error: prepError,
    isError: isPrepError,
    isLoading: isPrepLoading,
    refetch: refetchPrep,
  } = usePrepWorkspace()
  const syncStatus = useUiStore((state) => state.syncStatus)
  const updateDayTypeOverrideMutation = useUpdateDayTypeOverride()
  const updateDayModeMutation = useUpdateDayMode()
  const updateBlockStatusMutation = useUpdateBlockStatus()
  const updateTopicMutation = useUpdatePrepTopicProgress()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<PrepDomainKey | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const requestedFocus = searchParams.get('view') === 'prep' ? 'prep' : 'week'

  if (isWeekLoading || isPrepLoading || !weekWorkspace || !prepWorkspace) {
    if (isWeekError || isPrepError) {
      return (
        <SurfaceCard
          title="Plan could not load"
          description={getWorkspaceErrorMessage(weekError ?? prepError)}
        >
          <Stack spacing={2} alignItems="flex-start">
            <Alert severity="warning">Reconnect or retry when Firestore is reachable.</Alert>
            <Button
              variant="contained"
              onClick={() => {
                void refetchWeek()
                void refetchPrep()
              }}
            >
              Retry
            </Button>
          </Stack>
        </SurfaceCard>
      )
    }

    return (
      <SurfaceCard title="Loading plan" description="Restoring your week.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const { calendar, days: weekInstances, globalSignals } = weekWorkspace
  const resolvedSelectedDate =
    selectedDate && weekInstances.some((day) => day.date === selectedDate) ? selectedDate : weekInstances[0]?.date ?? null
  const selectedDay = weekInstances.find((day) => day.date === resolvedSelectedDate) ?? weekInstances[0]
  const calendarTone = getCalendarStatusTone({
    connectionStatus: calendar.connectionStatus,
    externalSyncStatus: calendar.syncState?.externalEventSyncStatus ?? 'idle',
    mirrorSyncStatus: calendar.syncState?.mirrorSyncStatus ?? 'idle',
    collisionSeverity: selectedDay?.calendarSummary?.severity,
  })
  const overrideCount = weekInstances.filter((day) => day.isDayTypeOverridden || day.dayMode !== 'normal').length
  const plannedBlockCount = weekInstances.reduce(
    (count, day) => count + day.blocks.filter((block) => block.status === 'planned').length,
    0,
  )
  const activeDomain = selectedDomain ?? prepWorkspace.focusedDomains[0]?.domain ?? prepWorkspace.domainSummaries[0]?.domain ?? 'dsa'
  const activeTopics = prepWorkspace.topicsByDomain[activeDomain] ?? []
  const activeTopic = activeTopics.find((topic) => topic.id === selectedTopicId) ?? activeTopics[0]
  const activeSummary = prepWorkspace.domainSummaries.find((domain) => domain.domain === activeDomain) ?? prepWorkspace.domainSummaries[0]
  const weakestDomain = getWeakestPrepDomain(prepWorkspace)
  const totalTouchedTopics = prepWorkspace.domainSummaries.reduce((sum, domain) => sum + domain.touchedTopicCount, 0)
  const totalTrackedHours = prepWorkspace.domainSummaries.reduce((sum, domain) => sum + domain.hoursSpent, 0)
  const prepFocusLabel = prepWorkspace.focusedDomains[0]?.label ?? weakestDomain?.label ?? activeSummary?.label ?? 'Prep'
  const dayMutationDisabled =
    updateDayTypeOverrideMutation.isPending ||
    updateDayModeMutation.isPending ||
    updateDayTypeOverrideMutation.isCloudWriteUnavailable ||
    updateDayModeMutation.isCloudWriteUnavailable
  const blockMutationDisabled = updateBlockStatusMutation.isPending || updateBlockStatusMutation.isCloudWriteUnavailable
  const prepMutationDisabled = updateTopicMutation.isPending || updateTopicMutation.isCloudWriteUnavailable

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }} data-plan-focus={requestedFocus}>
      <SurfaceCard
        variant="hero"
        contentSx={{
          background: 'transparent',
          p: { xs: 2.5, md: 3.25 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.25, lg: 3 },
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' },
            alignItems: 'center',
          }}
        >
          <SectionHeader
            eyebrow="Plan"
            title="Shape the week."
            description="Choose the day, keep the load honest, and let prep stay in view without taking over."
          />

          <Stack
            spacing={1.25}
            sx={(theme) => ({
              border: '1px solid',
              borderColor: alpha(theme.palette.text.secondary, theme.palette.mode === 'light' ? 0.12 : 0.1),
              borderRadius: 2.5,
              p: { xs: 1.5, md: 1.75 },
              backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.44 : 0.22),
            })}
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
              <SyncIndicator status={syncStatus} />
              <Chip
                icon={<CalendarMonthRoundedIcon />}
                label={`${calendar.constrainedDayCount} constrained`}
                size="small"
                color={calendarTone}
                variant="outlined"
              />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))', lg: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <PlanMetric label="Day" value={selectedDay?.weekdayLabel ?? 'Today'} detail={selectedDay?.label ?? 'No day loaded'} compact />
              <PlanMetric label="Open" value={`${plannedBlockCount}`} detail={`${overrideCount} adjusted`} compact />
              <PlanMetric label="Prep" value={prepFocusLabel} detail={`${totalTouchedTopics}/${prepWorkspace.totalTopicCount} touched`} compact />
              <PlanMetric
                label="Calendar"
                value={calendar.connectionStatus === 'connected' ? 'Connected' : 'Not connected'}
                detail={`${calendar.constrainedDayCount} constrained`}
                compact
              />
            </Box>
          </Stack>
        </Box>
      </SurfaceCard>

      <SurfaceCard variant="quiet" eyebrow="Week rhythm" title="Choose a day." description="Scan the week first, then tune only the day that needs attention.">
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1, md: 1.1 },
            gridTemplateColumns: {
              xs: 'repeat(7, minmax(142px, 1fr))',
              lg: 'repeat(7, minmax(0, 1fr))',
            },
            overflowX: { xs: 'auto', lg: 'visible' },
            pb: { xs: 0.75, lg: 0 },
          }}
        >
          {weekInstances.map((day) => (
            <WeekDayButton
              key={day.id}
              day={day}
              isSelected={selectedDay?.date === day.date}
              onSelect={() => setSelectedDate(day.date)}
            />
          ))}
        </Box>
      </SurfaceCard>

      {selectedDay ? (
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.25, lg: 2.5 },
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.32fr) minmax(310px, 0.68fr)' },
            alignItems: 'start',
          }}
        >
          <Stack spacing={{ xs: 2.25, md: 2.5 }}>
            <SelectedDayPanel
              day={selectedDay}
              isDayMutationPending={dayMutationDisabled}
              onDayTypeChange={(dayType) => {
                if (dayType !== selectedDay.dayType) {
                  updateDayTypeOverrideMutation.mutate({
                    date: selectedDay.date,
                    dayType,
                  })
                }
              }}
              onDayModeChange={(dayMode) => {
                if (dayMode !== selectedDay.dayMode) {
                  updateDayModeMutation.mutate({
                    date: selectedDay.date,
                    dayMode,
                  })
                }
              }}
            />

            <SurfaceCard variant="quiet" eyebrow="Blocks" title={`${selectedDay.weekdayLabel} agenda`}>
              <Stack spacing={1.1}>
                {selectedDay.blocks.map((block) => (
                  <PlanBlockRow
                    key={block.id}
                    block={block}
                    isPending={blockMutationDisabled}
                    onChangeStatus={(status) =>
                      updateBlockStatusMutation.mutate({
                        date: selectedDay.date,
                        blockId: block.id,
                        status,
                      })
                    }
                  />
                ))}
              </Stack>
            </SurfaceCard>
          </Stack>

          <Stack spacing={{ xs: 2.25, md: 2.5 }}>
            <PrepPressurePanel
              workspace={prepWorkspace}
              activeDomain={activeDomain}
              activeTopic={activeTopic}
              activeSummary={activeSummary}
              weakestDomainLabel={weakestDomain?.label ?? 'Pending'}
              totalTrackedHours={totalTrackedHours}
              isPending={prepMutationDisabled}
              onSelectDomain={(domain) => {
                setSelectedDomain(domain)
                setSelectedTopicId(prepWorkspace.topicsByDomain[domain]?.[0]?.id ?? null)
              }}
              onSelectTopic={setSelectedTopicId}
              onUpdateTopic={(topic, patch) =>
                updateTopicMutation.mutate({
                  topicId: topic.id,
                  patch,
                })
              }
            />

            <PlanPressurePanel day={selectedDay} globalSignals={globalSignals} />

            <CalendarConstraintPanel
              day={selectedDay}
              constrainedDayCount={calendar.constrainedDayCount}
              connectionStatus={calendar.connectionStatus === 'connected' ? 'Connected' : 'Not connected'}
              lastSyncLabel={formatCalendarTimestamp(calendar.syncState?.lastExternalSyncAt, 'Not synced')}
              tone={calendarTone}
            />
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}

function getWorkspaceErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Forge could not load this workspace.'
}

function PlanMetric({
  label,
  value,
  detail,
  compact = false,
}: {
  label: string
  value: string
  detail: string
  compact?: boolean
}) {
  return (
    <Stack
      spacing={0.3}
      sx={(theme) => ({
        border: '1px solid',
        borderColor: alpha(theme.palette.text.secondary, theme.palette.mode === 'light' ? 0.12 : 0.09),
        borderRadius: 2,
        p: compact ? 1.1 : 1.35,
        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.44 : 0.18),
      })}
    >
      <Typography variant="overline" color="primary.light">
        {label}
      </Typography>
      <Typography variant={compact ? 'subtitle2' : 'h3'}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  )
}

function WeekDayButton({
  day,
  isSelected,
  onSelect,
}: {
  day: PlanDay
  isSelected: boolean
  onSelect: () => void
}) {
  const openBlocks = day.blocks.filter((block) => block.status === 'planned').length
  const overlapCount = day.calendarSummary?.overlappingEventCount ?? 0

  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      sx={(theme) => ({
        minHeight: { xs: 138, lg: 150 },
        textAlign: 'left',
        border: '1px solid',
        borderColor: isSelected ? alpha(theme.palette.primary.main, 0.72) : alpha(theme.palette.text.secondary, theme.palette.mode === 'light' ? 0.12 : 0.1),
        borderRadius: 2.25,
        p: 1.25,
        background: isSelected
          ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.075 : 0.085)
          : alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.48 : 0.26),
        color: 'text.primary',
        cursor: 'pointer',
        transition: 'border-color 160ms ease, transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.5),
          transform: 'translateY(-1px)',
        },
        '&:focus-visible': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.22)}`,
        },
      })}
    >
      <Stack spacing={1} height="100%" justifyContent="space-between">
        <Stack spacing={0.45}>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
            <Typography variant="overline" color="primary.light">
              {day.weekdayLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {day.dateLabel}
            </Typography>
          </Stack>
          <Typography variant="subtitle2">{day.label}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', xl: 'block' } }}>
            {day.focusLabel}
          </Typography>
        </Stack>

        <Stack spacing={0.55}>
          <Stack direction="row" spacing={0.65} useFlexGap flexWrap="wrap">
            <StatusBadge label={scheduleModeLabels[day.dayMode]} tone={day.dayMode} />
            {day.isDayTypeOverridden ? <Chip label="Override" size="small" color="warning" variant="outlined" /> : null}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {openBlocks} open · {overlapCount} overlap{overlapCount === 1 ? '' : 's'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

function SelectedDayPanel({
  day,
  isDayMutationPending,
  onDayTypeChange,
  onDayModeChange,
}: {
  day: PlanDay
  isDayMutationPending: boolean
  onDayTypeChange: (dayType: PlanDay['dayType']) => void
  onDayModeChange: (dayMode: PlanDay['dayMode']) => void
}) {
  const openBlocks = day.blocks.filter((block) => block.status === 'planned').length

  return (
    <SurfaceCard
      variant="hero"
      eyebrow="Selected day"
      title={`${day.weekdayLabel} · ${day.label}`}
      description={day.focusLabel}
      action={
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <StatusBadge label={scheduleModeLabels[day.dayMode]} tone={day.dayMode} />
          <Chip
            icon={<EventRepeatRoundedIcon />}
            label={day.isDayTypeOverridden ? 'Override' : 'Seeded'}
            size="small"
            color={day.isDayTypeOverridden ? 'warning' : 'default'}
            variant="outlined"
          />
        </Stack>
      }
    >
      <Stack spacing={2.1}>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
          }}
        >
          <PlanMetric label="Day type" value={dayTypeLabels[day.dayType]} detail={`Base: ${dayTypeLabels[day.baseDayType]}`} compact />
          <PlanMetric label="Blocks" value={`${openBlocks}/${day.blocks.length}`} detail="Open planned work" compact />
          <PlanMetric
            label="Calendar"
            value={
              day.calendarSummary?.severity && day.calendarSummary.severity !== 'none'
                ? `${day.calendarSummary.overlappingEventCount} overlap${day.calendarSummary.overlappingEventCount === 1 ? '' : 's'}`
                : 'Clear'
            }
            detail="Calendar load"
            compact
          />
          <PlanMetric label="Mode" value={scheduleModeLabels[day.dayMode]} detail="Fallback posture" compact />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
        <Stack spacing={1}>
          <Typography variant="overline" color="primary.light">
            Day type
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" role="group" aria-label="Allowed day types">
            {day.allowedDayTypes.map((option) => (
              <Button
                key={option.value}
                size="small"
                variant={option.value === day.dayType ? 'contained' : 'outlined'}
                disabled={isDayMutationPending}
                aria-pressed={option.value === day.dayType}
                onClick={() => onDayTypeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline" color="primary.light">
            Day mode
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" role="group" aria-label="Day mode">
            {(['normal', 'lowEnergy', 'survival'] as const).map((mode) => (
              <Button
                key={mode}
                size="small"
                variant={day.dayMode === mode ? 'contained' : 'outlined'}
                disabled={isDayMutationPending}
                aria-pressed={day.dayMode === mode}
                onClick={() => onDayModeChange(mode)}
              >
                {scheduleModeLabels[mode]}
              </Button>
            ))}
          </Stack>
        </Stack>
        </Box>
      </Stack>
    </SurfaceCard>
  )
}

function PlanBlockRow({
  block,
  isPending,
  onChangeStatus,
}: {
  block: PlanBlock
  isPending: boolean
  onChangeStatus: (status: PlanBlock['status']) => void
}) {
  const allowedTransitions = getAllowedScheduleBlockTransitions(block.status)

  return (
    <Box
      sx={(theme) => ({
        border: '1px solid',
        borderColor: block.status === 'planned' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.text.secondary, 0.1),
        borderRadius: 2.25,
        p: { xs: 1.35, md: 1.45 },
        backgroundColor:
          block.status === 'planned'
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.045 : 0.032)
            : alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.44 : 0.28),
      })}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.35}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Stack spacing={0.35} minWidth={0}>
          <Typography variant="caption" color="primary.light">
            {block.startTime ?? (block.durationMinutes ? `${block.durationMinutes}m` : 'Flexible')}
          </Typography>
          <Typography variant="subtitle2">{block.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {block.detail}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          <Chip label={scheduleBlockStatusLabels[block.status]} size="small" variant="outlined" />
          {allowedTransitions.includes('completed') ? (
            <Button size="small" variant="contained" disabled={isPending} onClick={() => onChangeStatus('completed')}>
              Done
            </Button>
          ) : null}
          {allowedTransitions.includes('moved') ? (
            <Button size="small" variant="outlined" disabled={isPending} onClick={() => onChangeStatus('moved')}>
              Move
            </Button>
          ) : null}
          {allowedTransitions.includes('skipped') ? (
            <Button size="small" variant="outlined" disabled={isPending} onClick={() => onChangeStatus('skipped')}>
              Skip
            </Button>
          ) : null}
          {allowedTransitions.includes('planned') ? (
            <Button size="small" variant="outlined" disabled={isPending} onClick={() => onChangeStatus('planned')}>
              Restore
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  )
}

function PrepPressurePanel({
  workspace,
  activeDomain,
  activeTopic,
  activeSummary,
  weakestDomainLabel,
  totalTrackedHours,
  isPending,
  onSelectDomain,
  onSelectTopic,
  onUpdateTopic,
}: {
  workspace: PrepWorkspace
  activeDomain: PrepDomainKey
  activeTopic?: PrepTopic
  activeSummary?: PrepWorkspace['domainSummaries'][number]
  weakestDomainLabel: string
  totalTrackedHours: number
  isPending: boolean
  onSelectDomain: (domain: PrepDomainKey) => void
  onSelectTopic: (topicId: string) => void
  onUpdateTopic: (topic: PrepTopic, patch: Partial<Pick<PrepTopic, 'confidence' | 'exposureState' | 'revisionCount' | 'solvedCount' | 'exposureCount' | 'hoursSpent'>>) => void
}) {
  return (
    <SurfaceCard
      variant="quiet"
      eyebrow="Prep"
      title="Prep focus"
      description={`${activeSummary?.label ?? prepDomainLabels[activeDomain]} · ${activeSummary?.readinessLevel ?? 'building'} · weakest: ${weakestDomainLabel}`}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))', lg: '1fr' },
          }}
        >
          <PlanMetric
            label="Coverage"
            value={`${activeSummary?.touchedTopicCount ?? 0}/${activeSummary?.topicCount ?? 0}`}
            detail="Topics touched"
            compact
          />
          <PlanMetric label="Confidence" value={`${activeSummary?.highConfidenceCount ?? 0}`} detail="High-confidence topics" compact />
          <PlanMetric label="Effort" value={`${totalTrackedHours.toFixed(1)}h`} detail="Tracked prep time" compact />
        </Box>

        <Stack spacing={1}>
          <Typography variant="overline" color="primary.light">
            Domains
          </Typography>
          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
            {workspace.domainSummaries.map((domain) => (
              <Chip
                key={domain.domain}
                label={`${domain.label} ${domain.highConfidenceCount}/${domain.topicCount}`}
                color={domain.domain === activeDomain ? 'primary' : 'default'}
                variant={domain.domain === activeDomain ? 'filled' : 'outlined'}
                onClick={() => onSelectDomain(domain.domain)}
              />
            ))}
          </Stack>
        </Stack>

        {activeTopic ? (
          <Stack spacing={1.4}>
            <Stack spacing={0.35}>
              <Typography variant="overline" color="primary.light">
                Next topic
              </Typography>
              <Typography variant="subtitle2">{activeTopic.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTopic.group} · {activeTopic.readinessLevel}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
              {(workspace.topicsByDomain[activeDomain] ?? []).slice(0, 6).map((topic) => (
                <Chip
                  key={topic.id}
                  label={topic.title}
                  size="small"
                  color={topic.id === activeTopic.id ? 'primary' : 'default'}
                  variant={topic.id === activeTopic.id ? 'filled' : 'outlined'}
                  onClick={() => onSelectTopic(topic.id)}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {(['low', 'medium', 'high'] as const).map((confidence) => (
                <Button
                  key={confidence}
                  size="small"
                  variant={activeTopic.confidence === confidence ? 'contained' : 'outlined'}
                  disabled={isPending}
                  onClick={() => onUpdateTopic(activeTopic, { confidence })}
                >
                  {confidenceLabels[confidence]}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                disabled={isPending}
                onClick={() => onUpdateTopic(activeTopic, { revisionCount: activeTopic.revisionCount + 1 })}
              >
                + Revision
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={isPending}
                onClick={() => onUpdateTopic(activeTopic, { solvedCount: activeTopic.solvedCount + 1 })}
              >
                + Solved
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={isPending}
                onClick={() => onUpdateTopic(activeTopic, { exposureCount: activeTopic.exposureCount + 1 })}
              >
                + Exposure
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </SurfaceCard>
  )
}

function PlanPressurePanel({
  day,
  globalSignals,
}: {
  day: PlanDay
  globalSignals: WeeklyWorkspace['globalSignals']
}) {
  const signals = [...globalSignals.slice(0, 2), ...day.operationalSignals.slice(0, 1)]

  return (
    <SurfaceCard variant="quiet" eyebrow="Signals" title="Planning signals">
      <Stack spacing={1}>
        {signals.length > 0 ? (
          signals.map((signal) => (
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
            No elevated planning signals right now.
          </Typography>
        )}
      </Stack>
    </SurfaceCard>
  )
}

function CalendarConstraintPanel({
  day,
  constrainedDayCount,
  connectionStatus,
  lastSyncLabel,
  tone,
}: {
  day: PlanDay
  constrainedDayCount: number
  connectionStatus: string
  lastSyncLabel: string
  tone: 'default' | 'error' | 'warning' | 'info' | 'success'
}) {
  const overlapCount = day.calendarSummary?.overlappingEventCount ?? 0
  const hasOverlap = Boolean(day.calendarSummary?.severity && day.calendarSummary.severity !== 'none')

  return (
    <SurfaceCard
      variant="quiet"
      eyebrow="Calendar"
      title="Outside commitments"
      action={<Chip icon={<EventBusyRoundedIcon />} label={connectionStatus} size="small" variant="outlined" color={tone} />}
    >
      <Stack spacing={1.25}>
        <Typography variant="body2" color="text.secondary">
          {constrainedDayCount} constrained day{constrainedDayCount === 1 ? '' : 's'} this week. Last sync: {lastSyncLabel}.
        </Typography>
        {hasOverlap ? (
          <Box
            sx={(theme) => ({
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.26),
              borderRadius: 3,
              p: 1.35,
              backgroundColor: alpha(theme.palette.warning.main, 0.06),
            })}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <WarningAmberRoundedIcon color="warning" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {overlapCount} event{overlapCount === 1 ? '' : 's'} overlap the selected day.
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No selected-day overlap.
          </Typography>
        )}
      </Stack>
    </SurfaceCard>
  )
}

function getWeakestPrepDomain(workspace: PrepWorkspace) {
  return [...workspace.domainSummaries].sort((left, right) => {
    const leftScore = left.highConfidenceCount * 3 + left.touchedTopicCount * 2 + left.hoursSpent
    const rightScore = right.highConfidenceCount * 3 + right.touchedTopicCount * 2 + right.hoursSpent

    return leftScore - rightScore
  })[0]
}

const scheduleModeLabels = {
  ideal: 'Ideal',
  normal: 'Normal',
  lowEnergy: 'Low energy',
  survival: 'Survival',
}

const scheduleBlockStatusLabels = {
  planned: 'Planned',
  completed: 'Done',
  moved: 'Moved',
  skipped: 'Skipped',
}

const confidenceLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
