import { useState } from 'react'
import { Button, Chip, CircularProgress, Divider, Grid, Stack, TextField, Typography } from '@mui/material'
import { MetricTile } from '@/components/common/MetricTile'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { prepDomainLabels } from '@/domain/prep/selectors'
import type { PrepDomainKey } from '@/domain/prep/types'
import { usePrepWorkspace } from '@/features/prep/hooks/usePrepWorkspace'
import { useUpdatePrepTopicProgress } from '@/features/prep/hooks/useUpdatePrepTopicProgress'

const exposureOptions = [
  { value: 'notStarted', label: 'Not Started' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'retention', label: 'Retention' },
  { value: 'confident', label: 'Confident' },
] as const

const confidenceOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const

type PrepPageProps = {
  embedded?: boolean
}

export function PrepPage({ embedded = false }: PrepPageProps) {
  const { data, isLoading } = usePrepWorkspace()
  const updateTopicMutation = useUpdatePrepTopicProgress()
  const [selectedDomain, setSelectedDomain] = useState<PrepDomainKey | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  if (isLoading || !data) {
    return (
      <SurfaceCard title="Loading prep workspace" description="Forge is restoring persisted prep progress and topic readiness.">
        <Stack alignItems="center" py={2}>
          <CircularProgress color="primary" />
        </Stack>
      </SurfaceCard>
    )
  }

  const activeDomain = selectedDomain ?? data.focusedDomains[0]?.domain ?? data.domainSummaries[0]?.domain ?? 'dsa'
  const activeTopics = data.topicsByDomain[activeDomain]
  const activeTopic = activeTopics.find((topic) => topic.id === selectedTopicId) ?? activeTopics[0]
  const activeSummary = data.domainSummaries.find((domain) => domain.domain === activeDomain) ?? data.domainSummaries[0]
  const focusedDomainLabels = data.focusedDomains.map((domain) => domain.label)
  const activeNoteDraft = selectedTopicId === activeTopic?.id ? noteDraft : (activeTopic?.notes ?? '')

  const sortedDomains = [...data.domainSummaries].sort((left, right) => {
    const leftScore = left.highConfidenceCount * 3 + left.touchedTopicCount * 2 + left.hoursSpent
    const rightScore = right.highConfidenceCount * 3 + right.touchedTopicCount * 2 + right.hoursSpent
    return rightScore - leftScore
  })
  const strongestDomain = sortedDomains[0]
  const weakestDomain = sortedDomains[sortedDomains.length - 1]
  const totalTrackedHours = data.domainSummaries.reduce((sum, domain) => sum + domain.hoursSpent, 0)
  const touchedTopicCount = data.domainSummaries.reduce((sum, domain) => sum + domain.touchedTopicCount, 0)

  return (
    <Stack spacing={3}>
      {!embedded ? (
        <SectionHeader
          eyebrow="Prep"
          title="Prep health should read like progress, not admin."
          description={`${data.dayLabel} focus stays visible with the active domain, weakest surface, and next topic adjustment.`}
        />
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Focus Domains" value={`${data.focusedDomains.length}`} detail={focusedDomainLabels.length > 0 ? focusedDomainLabels.join(', ') : 'No high-priority domain pressure is inferred today.'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Coverage" value={`${touchedTopicCount}/${data.totalTopicCount}`} detail="Topics touched with real exposure, notes, or logged reps." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Strongest Domain" value={strongestDomain?.label ?? 'Pending'} detail={strongestDomain ? `${strongestDomain.highConfidenceCount} high-confidence topics · ${strongestDomain.hoursSpent.toFixed(1)}h logged` : 'No domain signal yet.'} tone="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricTile eyebrow="Weakest Domain" value={weakestDomain?.label ?? 'Pending'} detail={weakestDomain ? `${weakestDomain.touchedTopicCount}/${weakestDomain.topicCount} touched · ${weakestDomain.hoursSpent.toFixed(1)}h logged` : 'No weak spot detected yet.'} tone="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 3 }}>
          <SurfaceCard
            eyebrow="Domain Pressure"
            title="Prep map"
            description="Move between domains without losing the readiness balance."
          >
            <Stack spacing={1.1}>
              {data.domainSummaries.map((domain) => {
                const isActive = domain.domain === activeDomain
                return (
                  <Button
                    key={domain.domain}
                    variant={isActive ? 'contained' : 'outlined'}
                    onClick={() => {
                      setSelectedDomain(domain.domain)
                      setSelectedTopicId(data.topicsByDomain[domain.domain][0]?.id ?? null)
                      setNoteDraft(data.topicsByDomain[domain.domain][0]?.notes ?? '')
                    }}
                    sx={{ justifyContent: 'space-between', px: 1.5, py: 1.15 }}
                  >
                    <Stack width="100%" direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                      <Stack spacing={0.2} alignItems="flex-start">
                        <Typography variant="body2" color="inherit">
                          {domain.label}
                        </Typography>
                        <Typography variant="caption" color="inherit">
                          {domain.readinessLevel}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="inherit">
                        {domain.highConfidenceCount}/{domain.topicCount}
                      </Typography>
                    </Stack>
                  </Button>
                )
              })}
            </Stack>

            <Divider flexItem />

            <Stack spacing={1}>
              <Typography variant="overline" color="primary.light">
                Today&apos;s emphasis
              </Typography>
              {data.focusedDomains.length > 0 ? (
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  {data.focusedDomains.map((domain) => (
                    <Chip key={domain.domain} label={`${domain.label} · ${domain.readinessLevel}`} size="small" variant="outlined" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Today&apos;s generated plan is not pushing one prep domain unusually hard right now.
                </Typography>
              )}
            </Stack>

            <Stack spacing={0.75}>
              <Typography variant="overline" color="primary.light">
                Logged effort
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalTrackedHours.toFixed(1)}h total across the seeded prep map.
              </Typography>
            </Stack>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SurfaceCard
            eyebrow="Active Domain"
            title={prepDomainLabels[activeDomain]}
            description="Current readiness, effort, and the next topic adjustment for the selected domain."
          >
            <Stack spacing={2.25}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricTile eyebrow="Touched" value={`${activeSummary?.touchedTopicCount ?? 0}/${activeSummary?.topicCount ?? 0}`} detail="Topics with real activity or exposure." />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricTile eyebrow="High Confidence" value={`${activeSummary?.highConfidenceCount ?? 0}`} detail={`Readiness: ${activeSummary?.readinessLevel ?? 'unknown'}`} tone="success" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MetricTile eyebrow="Hours Logged" value={`${(activeSummary?.hoursSpent ?? 0).toFixed(1)}h`} detail={activeSummary?.primaryGroups.join(', ') || 'Seeded topic groups'} />
                </Grid>
              </Grid>

              <Stack spacing={1}>
                <Typography variant="overline" color="primary.light">
                  Topic roster
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pick the next topic to update. The selected topic will stay live in the right-side action panel.
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {activeTopics.map((topic) => {
                    const isSelected = topic.id === activeTopic?.id
                    return (
                      <Chip
                        key={topic.id}
                        label={`${topic.title} · ${topic.readinessLevel}`}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        onClick={() => {
                          setSelectedTopicId(topic.id)
                          setNoteDraft(topic.notes ?? '')
                        }}
                      />
                    )
                  })}
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="overline" color="primary.light">
                  Domain reading
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeSummary?.label} currently reads {activeSummary?.readinessLevel}. The goal here is not to over-model prep, but to keep coverage, confidence, and effort honest enough that Readiness can react to them later.
                </Typography>
              </Stack>
            </Stack>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          {activeTopic ? (
            <SurfaceCard
              eyebrow="Topic Action"
              title={activeTopic.title}
              description={`${activeTopic.group} · current readiness ${activeTopic.readinessLevel}. Keep the topic state current here.`}
            >
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="primary.light">
                    Confidence
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {confidenceOptions.map((option) => (
                      <Button
                        key={option.value}
                        size="small"
                        variant={activeTopic.confidence === option.value ? 'contained' : 'outlined'}
                        disabled={updateTopicMutation.isPending}
                        onClick={() =>
                          updateTopicMutation.mutate({
                            topicId: activeTopic.id,
                            patch: { confidence: option.value },
                          })
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="overline" color="primary.light">
                    Exposure State
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {exposureOptions.map((option) => (
                      <Button
                        key={option.value}
                        size="small"
                        variant={activeTopic.exposureState === option.value ? 'contained' : 'outlined'}
                        disabled={updateTopicMutation.isPending}
                        onClick={() =>
                          updateTopicMutation.mutate({
                            topicId: activeTopic.id,
                            patch: { exposureState: option.value },
                          })
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <MetricTile eyebrow="Revisions" value={`${activeTopic.revisionCount}`} detail="Cheap iteration count." />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <MetricTile eyebrow="Solved" value={`${activeTopic.solvedCount}`} detail="Useful where reps fit." />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <MetricTile eyebrow="Hours" value={`${activeTopic.hoursSpent.toFixed(1)}h`} detail="Rough effort only." />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={updateTopicMutation.isPending}
                    onClick={() =>
                      updateTopicMutation.mutate({
                        topicId: activeTopic.id,
                        patch: { revisionCount: activeTopic.revisionCount + 1 },
                      })
                    }
                  >
                    + Revision
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={updateTopicMutation.isPending}
                    onClick={() =>
                      updateTopicMutation.mutate({
                        topicId: activeTopic.id,
                        patch: { solvedCount: activeTopic.solvedCount + 1 },
                      })
                    }
                  >
                    + Solved
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={updateTopicMutation.isPending}
                    onClick={() =>
                      updateTopicMutation.mutate({
                        topicId: activeTopic.id,
                        patch: { exposureCount: activeTopic.exposureCount + 1 },
                      })
                    }
                  >
                    + Exposure
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={updateTopicMutation.isPending}
                    onClick={() =>
                      updateTopicMutation.mutate({
                        topicId: activeTopic.id,
                        patch: { hoursSpent: activeTopic.hoursSpent + 0.5 },
                      })
                    }
                  >
                    + 0.5h
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  <TextField
                    label="Notes"
                    multiline
                    minRows={3}
                    value={activeNoteDraft}
                    onChange={(event) => {
                      setSelectedTopicId(activeTopic.id)
                      setNoteDraft(event.target.value)
                    }}
                    helperText="Keep this sparse: blind spots, interview-specific edges, or next reps."
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={updateTopicMutation.isPending || activeNoteDraft.trim() === (activeTopic.notes ?? '').trim()}
                      onClick={() =>
                        updateTopicMutation.mutate({
                          topicId: activeTopic.id,
                          patch: { notes: activeNoteDraft.trim() || undefined },
                        })
                      }
                    >
                      Save Note
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedTopicId(activeTopic.id)
                        setNoteDraft(activeTopic.notes ?? '')
                      }}
                    >
                      Reset
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </SurfaceCard>
          ) : null}
        </Grid>
      </Grid>

      <SurfaceCard
        eyebrow="Domain Roster"
        title="How the seeded map is actually moving"
        description="This stays intentionally lightweight. Forge only needs enough structure to show where prep is advancing, stalling, or lagging behind the target."
      >
        <Stack spacing={1.4} divider={<Divider flexItem />}>
          {data.domainSummaries.map((domain) => (
            <Stack
              key={domain.domain}
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Stack spacing={0.3}>
                <Typography variant="h3">{domain.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {domain.primaryGroups.join(', ')}
                </Typography>
              </Stack>
              <Grid container spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
                {[
                  { eyebrow: 'Readiness', value: domain.readinessLevel, detail: `${domain.highConfidenceCount} high-confidence topics` },
                  { eyebrow: 'Coverage', value: `${domain.touchedTopicCount}/${domain.topicCount}`, detail: 'Topics touched' },
                  { eyebrow: 'Effort', value: `${domain.hoursSpent.toFixed(1)}h`, detail: 'Logged effort' },
                ].map((metric) => (
                  <Grid key={`${domain.domain}-${metric.eyebrow}`} size={{ xs: 12, sm: 4 }}>
                    <MetricTile eyebrow={metric.eyebrow} value={metric.value} detail={metric.detail} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>
      </SurfaceCard>
    </Stack>
  )
}
