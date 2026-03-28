import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import type {
  AnalyticsInsight,
  MomentumSnapshot,
  StreakEntry,
  WeeklyMission,
} from '@/domain/analytics/types'
import type { DisciplinePosture } from '@/domain/analytics/gamification'
import type { PrepDomainSummary } from '@/domain/prep/selectors'
import type { DayInstance } from '@/domain/routine/types'
import { deriveAnalyticsInterpretation } from '@/services/analytics/analyticsInterpretationService'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'
import type { ReadinessSnapshot } from '@/domain/readiness/types'
import type { DayScorePreview } from '@/domain/scoring/types'

export type OperationalSignalTone = 'critical' | 'warning' | 'info' | 'positive'

export type OperationalSignal = {
  id: string
  title: string
  detail: string
  tone: OperationalSignalTone
  badge?: string
}

export type OperationalAnalyticsSummary = {
  generatedAt: string
  coachSummary: {
    title: string
    summary: string
    severity: 'info' | 'warning' | 'critical'
  }
  projection: ReturnType<typeof generateAnalyticsSnapshotBundle>['projection']
  topWarnings: AnalyticsInsight[]
  infoInsights: AnalyticsInsight[]
  momentum: MomentumSnapshot
  posture: DisciplinePosture
  streaks: StreakEntry[]
  missions: WeeklyMission[]
}

export async function getOperationalAnalyticsSummary(anchorDate = new Date()): Promise<OperationalAnalyticsSummary> {
  const settings = await localSettingsRepository.getDefault()
  const dayInstances = await localDayInstanceRepository.listAll()
  const bundle = generateAnalyticsSnapshotBundle({
    dayInstances,
    settings,
    anchorDate,
  })
  const { snapshot, insightEvaluation, gamification } = deriveAnalyticsInterpretation({
    bundle,
    windowKey: '30d',
    anchorDateKey: bundle.projection.lastEvaluatedDate,
  })

  return {
    generatedAt: snapshot.generatedAt,
    coachSummary: insightEvaluation.coachSummary,
    projection: bundle.projection,
    topWarnings: insightEvaluation.insights.filter((insight) => insight.severity !== 'info').slice(0, 4),
    infoInsights: insightEvaluation.insights.filter((insight) => insight.severity === 'info').slice(0, 4),
    momentum: gamification.streakSnapshot.momentum,
    posture: gamification.posture,
    streaks: gamification.streakSnapshot.activeStreaks,
    missions: gamification.missions,
  }
}

export function buildTodayOperationalSignals({
  summary,
  dayInstance,
  currentBlock,
  scorePreview,
}: {
  summary: OperationalAnalyticsSummary
  dayInstance: DayInstance
  currentBlock: DayInstance['blocks'][number] | null
  scorePreview: DayScorePreview
}): OperationalSignal[] {
  const signals: OperationalSignal[] = []
  const executionStreak = summary.streaks.find((entry) => entry.category === 'execution')
  const deepWorkStreak = summary.streaks.find((entry) => entry.category === 'deepWork')
  const primaryMission = summary.missions[0]

  if (summary.projection.status === 'critical' || summary.projection.status === 'slipping') {
    signals.push({
      id: 'today-behind-target',
      title: 'You are behind the current pace',
      detail: primaryMission
        ? `${summary.projection.statusLabel} The highest-value weekly pressure right now is: ${primaryMission.title.toLowerCase()}.`
        : summary.projection.summary,
      tone: summary.projection.status === 'critical' ? 'critical' : 'warning',
      badge: summary.projection.status === 'critical' ? 'Target Risk' : 'Pace Slip',
    })
  }

  if (currentBlock?.kind === 'deepWork' || dayInstance.dayType === 'wfhHighOutput' || dayInstance.dayType === 'weekendDeepWork') {
    signals.push({
      id: 'today-protect-window',
      title: 'Protect this window',
      detail:
        (deepWorkStreak?.current ?? 0) > 0
          ? `A deep-work streak of ${deepWorkStreak?.current} day(s) is live. Letting the current prime block drift would reset that continuity.`
          : 'This is still a high-leverage landing window even without a live streak. Treat it like the day’s keystone block.',
      tone: 'warning',
      badge: 'Prime Block',
    })
  }

  if (primaryMission) {
    signals.push({
      id: `today-mission-${primaryMission.id}`,
      title: primaryMission.title,
      detail: `${primaryMission.description} Progress ${primaryMission.progress}/${primaryMission.target} ${primaryMission.unit}.`,
      tone: primaryMission.priority === 'high' ? 'warning' : 'info',
      badge: primaryMission.priority === 'high' ? 'High Priority Mission' : 'Weekly Mission',
    })
  }

  if (scorePreview.warState === 'critical' && (executionStreak?.current ?? 0) > 0) {
    signals.push({
      id: 'today-streak-break-risk',
      title: 'Streak-break risk is active',
      detail: `Execution continuity is at ${executionStreak?.current} day(s), but today is already in a critical war state. Protect the minimum strong-day threshold before optimizing anything else.`,
      tone: 'critical',
      badge: 'Continuity Risk',
    })
  }

  return dedupeSignals(signals).slice(0, 3)
}

export function buildReadinessOperationalSignals({
  summary,
  readinessSnapshot,
  domainSummaries,
}: {
  summary: OperationalAnalyticsSummary
  readinessSnapshot: ReadinessSnapshot
  domainSummaries: PrepDomainSummary[]
}): OperationalSignal[] {
  const signals: OperationalSignal[] = []
  const weakestDomain = [...domainSummaries].sort((left, right) => left.hoursSpent - right.hoursSpent)[0]
  const topicNeglectWarning = summary.topWarnings.find((warning) => warning.ruleKey === 'topic-neglect')

  if (summary.projection.status !== 'onTrack' || ['critical', 'behind'].includes(readinessSnapshot.pressureLevel)) {
    signals.push({
      id: 'readiness-pace-risk',
      title: 'Readiness pace needs intervention',
      detail: `${summary.projection.summary} ${readinessSnapshot.paceSnapshot.paceLabel}`,
      tone: summary.projection.status === 'critical' ? 'critical' : 'warning',
      badge: summary.projection.status === 'critical' ? 'Critical Pace' : 'Pace Risk',
    })
  }

  if (topicNeglectWarning && weakestDomain) {
    signals.push({
      id: 'readiness-domain-neglect',
      title: 'Readiness breadth is narrowing',
      detail: `${topicNeglectWarning.summary} The weakest currently logged domain is ${weakestDomain.label.toLowerCase()} at ${weakestDomain.hoursSpent.toFixed(1)}h.`,
      tone: 'warning',
      badge: 'Coverage Gap',
    })
  }

  signals.push({
    id: 'readiness-momentum-posture',
    title: summary.posture.label,
    detail: `${summary.posture.detail} Momentum currently reads ${summary.momentum.score}/100.`,
    tone:
      summary.momentum.level === 'surging'
        ? 'positive'
        : summary.momentum.level === 'fragile'
          ? 'warning'
          : 'info',
    badge: 'Operating Posture',
  })

  if (summary.missions[0]) {
    signals.push({
      id: `readiness-mission-${summary.missions[0].id}`,
      title: summary.missions[0].title,
      detail: summary.missions[0].rationale,
      tone: summary.missions[0].priority === 'high' ? 'warning' : 'info',
      badge: 'Weekly Pressure',
    })
  }

  return dedupeSignals(signals).slice(0, 4)
}

export function buildScheduleOperationalSignals({
  summary,
  weekDays,
}: {
  summary: OperationalAnalyticsSummary
  weekDays: Array<{ date: string; dayType: string; weekday: string; dayMode: string }>
}): {
  globalSignals: OperationalSignal[]
  daySignalsByDate: Record<string, OperationalSignal[]>
} {
  const globalSignals: OperationalSignal[] = []
  const daySignalsByDate: Record<string, OperationalSignal[]> = {}
  const missionKinds = new Set(summary.missions.map((mission) => mission.kind))

  if (summary.projection.status === 'critical' || summary.projection.status === 'slipping') {
    globalSignals.push({
      id: 'schedule-pace-risk',
      title: 'This week has real planning pressure',
      detail: `${summary.projection.summary} Use the week view to protect the high-leverage days instead of spreading effort evenly.`,
      tone: summary.projection.status === 'critical' ? 'critical' : 'warning',
      badge: 'Pace Pressure',
    })
  }

  if (missionKinds.has('weekend-utilization')) {
    globalSignals.push({
      id: 'schedule-weekend-pressure',
      title: 'Weekend leverage matters this week',
      detail: 'The current mission stack is counting on the weekend to do real readiness work, not just catch-up admin.',
      tone: 'warning',
      badge: 'Weekend Pressure',
    })
  }

  for (const day of weekDays) {
    const signals: OperationalSignal[] = []

    if (missionKinds.has('deep-work-consistency') && ['wfhHighOutput', 'weekendDeepWork'].includes(day.dayType)) {
      signals.push({
        id: `${day.date}-deep-work`,
        title: 'High-leverage landing day',
        detail: 'This day matters for the current deep-work consistency mission.',
        tone: 'warning',
        badge: 'Protect',
      })
    }

    if (missionKinds.has('wfo-continuity') && day.dayType === 'wfoContinuity') {
      signals.push({
        id: `${day.date}-wfo`,
        title: 'Continuity test day',
        detail: 'WFH strength is not enough this week unless WFO continuity also holds.',
        tone: 'warning',
        badge: 'WFO Pressure',
      })
    }

    if (missionKinds.has('weekend-utilization') && ['saturday', 'sunday'].includes(day.weekday)) {
      signals.push({
        id: `${day.date}-weekend`,
        title: 'Weekend must stay operational',
        detail: 'This day is carrying explicit weekend-utilization pressure in the current mission stack.',
        tone: 'warning',
        badge: 'Weekend',
      })
    }

    if (day.dayMode === 'lowEnergy' || day.dayMode === 'survival') {
      signals.push({
        id: `${day.date}-fallback`,
        title: 'Fallback already active',
        detail: 'Plan around the reduced posture honestly instead of assuming this date can carry normal output.',
        tone: 'info',
        badge: 'Reduced Mode',
      })
    }

    daySignalsByDate[day.date] = dedupeSignals(signals).slice(0, 2)
  }

  return {
    globalSignals: dedupeSignals(globalSignals).slice(0, 3),
    daySignalsByDate,
  }
}

function dedupeSignals(signals: OperationalSignal[]) {
  const seen = new Set<string>()

  return signals.filter((signal) => {
    if (seen.has(signal.id)) {
      return false
    }

    seen.add(signal.id)
    return true
  })
}
