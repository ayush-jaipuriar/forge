import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { forgeTokens } from '@/app/theme/tokens'
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
  const { data: weekWorkspace, isLoading: isWeekLoading } = useWeeklyWorkspace()
  const { data: prepWorkspace, isLoading: isPrepLoading } = usePrepWorkspace()
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
    return (
      <SurfaceCard title="Loading plan" description="Restoring the week, selected-day state, and prep pressure.">
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

  return (
    <Stack spacing={3} data-plan-focus={requestedFocus}>
      <SurfaceCard
        contentSx={{
          background:
            'radial-gradient(circle at 88% 12%, rgba(212, 111, 60, 0.13), transparent 28%), linear-gradient(180deg, rgba(18, 23, 33, 0.98) 0%, rgba(11, 15, 23, 0.98) 100%)',
        }}
      >
        <Stack spacing={2.25}>
          <SectionHeader
            eyebrow="Plan"
            title="Shape the week."
            description="Pick the day, protect the blocks, and keep prep pressure visible."
            action={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <SyncIndicator status={syncStatus} />
                <Chip
                  icon={<CalendarMonthRoundedIcon />}
                  label={`${calendar.constrainedDayCount} constrained`}
                  size="small"
                  color={calendarTone}
                  variant="outlined"
                />
              </Stack>
            }
          />

          <Box
            sx={{
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            }}
          >
            <PlanMetric label="Selected day" value={selectedDay?.weekdayLabel ?? 'Today'} detail={selectedDay?.label ?? 'No day loaded'} />
            <PlanMetric label="Open blocks" value={`${plannedBlockCount}`} detail={`${overrideCount} override${overrideCount === 1 ? '' : 's'} active`} />
            <PlanMetric label="Prep focus" value={prepFocusLabel} detail={`${totalTouchedTopics}/${prepWorkspace.totalTopicCount} topics touched`} />
            <PlanMetric
              label="Calendar"
              value={calendar.connectionStatus === 'connected' ? 'Connected' : 'Not connected'}
              detail={`${calendar.constrainedDayCount} day${calendar.constrainedDayCount === 1 ? '' : 's'} under pressure`}
            />
          </Box>
        </Stack>
      </SurfaceCard>

      <SurfaceCard eyebrow="Week" title="Choose the day to tune." description="The board stays high-level so planning remains fast.">
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: {
              xs: 'repeat(7, minmax(184px, 1fr))',
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
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.22fr) minmax(320px, 0.78fr)' },
            alignItems: 'start',
          }}
        >
          <Stack spacing={2.5}>
            <SelectedDayPanel
              day={selectedDay}
              isDayMutationPending={updateDayTypeOverrideMutation.isPending || updateDayModeMutation.isPending}
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

            <SurfaceCard eyebrow="Blocks" title={`${selectedDay.weekdayLabel} agenda`}>
              <Stack spacing={1.1}>
                {selectedDay.blocks.map((block) => (
                  <PlanBlockRow
                    key={block.id}
                    block={block}
                    isPending={updateBlockStatusMutation.isPending}
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

          <Stack spacing={2.5}>
            <PrepPressurePanel
              workspace={prepWorkspace}
              activeDomain={activeDomain}
              activeTopic={activeTopic}
              activeSummary={activeSummary}
              weakestDomainLabel={weakestDomain?.label ?? 'Pending'}
              totalTrackedHours={totalTrackedHours}
              isPending={updateTopicMutation.isPending}
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

function PlanMetric({
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
      spacing={0.45}
      sx={{
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.12),
        borderRadius: 3,
        p: 1.55,
        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.2),
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
      sx={{
        minHeight: 188,
        textAlign: 'left',
        border: '1px solid',
        borderColor: isSelected ? forgeTokens.palette.border.accent : alpha(forgeTokens.palette.text.secondary, 0.12),
        borderRadius: 3,
        p: 1.45,
        background: isSelected
          ? `linear-gradient(180deg, ${alpha(forgeTokens.palette.accent.ember, 0.1)} 0%, ${alpha(forgeTokens.palette.background.panel, 0.98)} 100%)`
          : `linear-gradient(180deg, ${alpha(forgeTokens.palette.background.panel, 0.96)} 0%, ${alpha(forgeTokens.palette.background.surface, 0.96)} 100%)`,
        color: 'text.primary',
        cursor: 'pointer',
        transition: 'border-color 160ms ease, transform 160ms ease, background-color 160ms ease',
        '&:hover': {
          borderColor: alpha(forgeTokens.palette.accent.ember, 0.5),
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack spacing={1.2} height="100%" justifyContent="space-between">
        <Stack spacing={0.55}>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
            <Typography variant="overline" color="primary.light">
              {day.weekdayLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {day.dateLabel}
            </Typography>
          </Stack>
          <Typography variant="subtitle2">{day.label}</Typography>
          <Typography variant="body2" color="text.secondary">
            {day.focusLabel}
          </Typography>
        </Stack>

        <Stack spacing={0.8}>
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
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
          }}
        >
          <PlanMetric label="Day type" value={dayTypeLabels[day.dayType]} detail={`Base: ${dayTypeLabels[day.baseDayType]}`} />
          <PlanMetric label="Blocks" value={`${openBlocks}/${day.blocks.length}`} detail="Open planned work" />
          <PlanMetric
            label="Calendar"
            value={
              day.calendarSummary?.severity && day.calendarSummary.severity !== 'none'
                ? `${day.calendarSummary.overlappingEventCount} overlap${day.calendarSummary.overlappingEventCount === 1 ? '' : 's'}`
                : 'Clear'
            }
            detail="Planning constraint"
          />
          <PlanMetric label="Mode" value={scheduleModeLabels[day.dayMode]} detail="Fallback posture" />
        </Box>

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
      sx={{
        border: '1px solid',
        borderColor: block.status === 'planned' ? alpha(forgeTokens.palette.accent.ember, 0.32) : alpha(forgeTokens.palette.text.secondary, 0.12),
        borderRadius: 3,
        p: 1.5,
        backgroundColor:
          block.status === 'planned' ? alpha(forgeTokens.palette.accent.ember, 0.045) : alpha(forgeTokens.palette.background.panel, 0.72),
      }}
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
      eyebrow="Prep pressure"
      title="Prep pressure"
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
          />
          <PlanMetric label="Confidence" value={`${activeSummary?.highConfidenceCount ?? 0}`} detail="High-confidence topics" />
          <PlanMetric label="Effort" value={`${totalTrackedHours.toFixed(1)}h`} detail="Tracked prep time" />
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
    <SurfaceCard eyebrow="Signals" title="Planning pressure">
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
            sx={{
              border: '1px solid',
              borderColor: alpha(forgeTokens.palette.accent.warning, 0.26),
              borderRadius: 3,
              p: 1.35,
              backgroundColor: alpha(forgeTokens.palette.accent.warning, 0.06),
            }}
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
