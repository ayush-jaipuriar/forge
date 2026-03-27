import { Fragment, useState } from 'react'
import { Button, Chip, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material'
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

export function PrepPage() {
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
  const focusedDomainLabels = data.focusedDomains.map((domain) => domain.label)
  const activeNoteDraft = selectedTopicId === activeTopic?.id ? noteDraft : (activeTopic?.notes ?? '')

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Prep"
        title="Structured readiness, now with real progress state."
        description={`${data.totalTopicCount} seeded topics are now backed by persisted confidence and exposure signals. ${data.dayLabel} focus stays visible so prep work remains tied to execution reality.`}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile eyebrow="Total Topics" value={`${data.totalTopicCount}`} detail="Seeded taxonomy scope across all prep domains." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="Focused Domains"
            value={`${data.focusedDomains.length}`}
            detail={focusedDomainLabels.length > 0 ? focusedDomainLabels.join(', ') : 'No strong day-linked prep domain inferred.'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            eyebrow="Selected Domain"
            value={prepDomainLabels[activeDomain]}
            detail="Use the drill-down below to update confidence, coverage, and notes."
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SurfaceCard
            eyebrow="Domain Navigation"
            title="Top-level domains"
            description="This stays taxonomy-first so progress updates never become a random list of disconnected notes."
          >
            <Stack spacing={1.25}>
              {data.domainSummaries.map((domain) => (
                <Button
                  key={domain.domain}
                  variant={domain.domain === activeDomain ? 'contained' : 'outlined'}
                      onClick={() => {
                        setSelectedDomain(domain.domain)
                        setSelectedTopicId(data.topicsByDomain[domain.domain][0]?.id ?? null)
                        setNoteDraft(data.topicsByDomain[domain.domain][0]?.notes ?? '')
                  }}
                  sx={{ justifyContent: 'space-between', px: 1.5 }}
                >
                  <Stack width="100%" direction="row" justifyContent="space-between" spacing={2}>
                    <Typography>{domain.label}</Typography>
                    <Typography color="inherit">{domain.highConfidenceCount}/{domain.topicCount}</Typography>
                  </Stack>
                </Button>
              ))}
            </Stack>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <SurfaceCard
            eyebrow="Domain Snapshot"
            title={prepDomainLabels[activeDomain]}
            description="Readiness contribution here is still simple in Phase 1, but it is now derived from persisted prep progress instead of static seed assumptions."
          >
            <Stack spacing={2}>
              <Grid container spacing={2}>
                {data.domainSummaries
                  .filter((domain) => domain.domain === activeDomain)
                  .map((domain) => (
                    <Fragment key={domain.domain}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MetricTile eyebrow="Touched" value={`${domain.touchedTopicCount}/${domain.topicCount}`} detail="Topics with real activity or exposure." />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MetricTile eyebrow="High Confidence" value={`${domain.highConfidenceCount}`} detail={`Readiness: ${domain.readinessLevel}`} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MetricTile eyebrow="Hours Logged" value={`${domain.hoursSpent.toFixed(1)}h`} detail={domain.primaryGroups.join(', ')} />
                      </Grid>
                    </Fragment>
                  ))}
              </Grid>

              <Stack spacing={1}>
                <Typography variant="overline" color="primary.light">
                  Topic Drill-Down
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {activeTopics.map((topic) => (
                    <Chip
                      key={topic.id}
                      label={topic.title}
                      color={topic.id === activeTopic?.id ? 'primary' : 'default'}
                      variant={topic.id === activeTopic?.id ? 'filled' : 'outlined'}
                      onClick={() => {
                        setSelectedTopicId(topic.id)
                        setNoteDraft(topic.notes ?? '')
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </SurfaceCard>
        </Grid>
      </Grid>

      {activeTopic ? (
        <SurfaceCard
          eyebrow="Topic Detail"
          title={activeTopic.title}
          description={`${activeTopic.group} · readiness currently reads ${activeTopic.readinessLevel}.`}
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
                        patch: {
                          confidence: option.value,
                        },
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
                        patch: {
                          exposureState: option.value,
                        },
                      })
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MetricTile eyebrow="Revision Count" value={`${activeTopic.revisionCount}`} detail="Quick increments keep this cheap to maintain." />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MetricTile eyebrow="Solved Count" value={`${activeTopic.solvedCount}`} detail="Useful where the topic naturally maps to problem reps." />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MetricTile eyebrow="Hours Spent" value={`${activeTopic.hoursSpent.toFixed(1)}h`} detail="A rough effort signal, not a timesheet." />
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
                minRows={2}
                value={activeNoteDraft}
                onChange={(event) => {
                  setSelectedTopicId(activeTopic.id)
                  setNoteDraft(event.target.value)
                }}
                helperText="Use notes sparingly for interview-specific edges, blind spots, or next reps."
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
    </Stack>
  )
}
