import type { DayType, ReadinessLevel, WarState, Weekday } from '@/domain/common/types'
import type { PrepDomainKey } from '@/domain/prep/types'

export const ANALYTICS_SNAPSHOT_VERSION = 1

export const analyticsRollingWindowKeys = ['7d', '14d', '30d', '90d'] as const
export type AnalyticsRollingWindowKey = (typeof analyticsRollingWindowKeys)[number]

export const analyticsTimeBands = ['morning', 'midday', 'afternoon', 'evening', 'night'] as const
export type AnalyticsTimeBand = (typeof analyticsTimeBands)[number]

export const analyticsInsightRuleKeys = [
  'sleep-vs-prep-quality',
  'gym-vs-mental-performance',
  'topic-neglect',
  'weekend-utilization',
  'most-missed-time-window',
  'best-performing-time-window',
  'streak-break-causes',
  'pace-prediction',
  'habit-correlation-high-score-days',
  'wfo-vs-wfh-difference',
  'deep-block-completion-trend',
  'readiness-progression-pace',
  'behind-target-warning',
  'low-energy-success-pattern',
] as const
export type AnalyticsInsightRuleKey = (typeof analyticsInsightRuleKeys)[number]

export const streakCategories = ['execution', 'deepWork', 'prep', 'workout', 'sleep', 'logging'] as const
export type StreakCategory = (typeof streakCategories)[number]

export const weeklyMissionKinds = [
  'deep-work-consistency',
  'sleep-recovery',
  'workout-consistency',
  'topic-neglect-recovery',
  'weekend-utilization',
  'wfo-continuity',
] as const
export type WeeklyMissionKind = (typeof weeklyMissionKinds)[number]

export type AnalyticsSnapshotGranularity = 'daily' | 'weekly' | 'rolling'
export type AnalyticsWindowReference = 'daily' | 'weekly' | AnalyticsRollingWindowKey
export type AnalyticsInsightSeverity = 'info' | 'warning' | 'critical'
export type AnalyticsProjectionStatus = 'insufficientData' | 'onTrack' | 'atRisk' | 'slipping' | 'critical'
export type ProjectionConfidenceLevel = 'low' | 'medium' | 'high'
export type MomentumLevel = 'insufficientData' | 'fragile' | 'building' | 'steady' | 'surging'
export type WeeklyMissionStatus = 'planned' | 'active' | 'completed' | 'missed'
export type MissionPriority = 'high' | 'medium'
export type MissionUnit = 'days' | 'sessions' | 'hours' | 'topics' | 'percent'
export type AppCheckRolloutStatus = 'notConfigured' | 'development' | 'planned' | 'enforced'

export type AnalyticsSourceRange = {
  startDate: string
  endDate: string
  dayCount: number
}

export type AnalyticsScoreAverages = {
  master: number
  interviewPrep: number
  physical: number
  discipline: number
  consistency: number
}

export type AnalyticsSummaryMetrics = {
  trackedDays: number
  completedBlocks: number
  skippedBlocks: number
  movedBlocks: number
  completedDeepBlocks: number
  missedPrimeBlocks: number
  requiredOutputsCaptured: number
  prepHours: number
  workoutsScheduled: number
  workoutsCompleted: number
  sleepTargetMetDays: number
  lowEnergyDays: number
  survivalDays: number
  fallbackActivations: number
  scoreAverages: AnalyticsScoreAverages
}

export type AnalyticsBreakdownDatum<T extends string = string> = {
  key: T
  label: string
  value: number
  secondaryValue?: number
  percent?: number
}

export type AnalyticsBreakdowns = {
  byDayType: AnalyticsBreakdownDatum<DayType>[]
  byWeekday: AnalyticsBreakdownDatum<Weekday>[]
  byTimeBand: AnalyticsBreakdownDatum<AnalyticsTimeBand>[]
  byPrepDomain: AnalyticsBreakdownDatum<PrepDomainKey>[]
  byWarState: AnalyticsBreakdownDatum<WarState>[]
}

export type AnalyticsSnapshotBase = {
  id: string
  granularity: AnalyticsSnapshotGranularity
  snapshotVersion: number
  generatedAt: string
  sourceRange: AnalyticsSourceRange
  summaryMetrics: AnalyticsSummaryMetrics
  breakdowns: AnalyticsBreakdowns
}

export type DailyAnalyticsSnapshot = AnalyticsSnapshotBase & {
  granularity: 'daily'
  date: string
}

export type WeeklyAnalyticsSnapshot = AnalyticsSnapshotBase & {
  granularity: 'weekly'
  weekKey: string
}

export type RollingAnalyticsSnapshot = AnalyticsSnapshotBase & {
  granularity: 'rolling'
  windowKey: AnalyticsRollingWindowKey
}

export type AnalyticsSnapshot =
  | DailyAnalyticsSnapshot
  | WeeklyAnalyticsSnapshot
  | RollingAnalyticsSnapshot

export type AnalyticsProjectionPoint = {
  date: string
  readinessPercent: number
  projectedScore: number
}

export type ReadinessProjectionSnapshot = {
  id: 'default'
  snapshotVersion: number
  generatedAt: string
  targetDate: string
  lastEvaluatedDate: string
  status: AnalyticsProjectionStatus
  statusLabel: string
  confidence: ProjectionConfidenceLevel
  currentReadinessLevel: ReadinessLevel
  projectedReadinessLevel: ReadinessLevel
  currentReadinessPercent: number
  projectedReadinessPercent: number
  estimatedReadyDate: string | null
  targetSlipDays: number
  weeklyReadinessVelocity: number
  requiredWeeklyVelocity: number
  summary: string
  risks: string[]
  curve: AnalyticsProjectionPoint[]
}

export type AnalyticsInsightEvidence = {
  label: string
  value: string
  direction?: 'positive' | 'negative' | 'neutral'
}

export type AnalyticsInsight = {
  id: string
  ruleKey: AnalyticsInsightRuleKey
  severity: AnalyticsInsightSeverity
  confidence: ProjectionConfidenceLevel
  title: string
  summary: string
  supportingEvidence: AnalyticsInsightEvidence[]
  sourceWindow: AnalyticsWindowReference
  generatedAt: string
}

export type AnalyticsCoachSummary = {
  title: string
  summary: string
  severity: AnalyticsInsightSeverity
}

export type StreakEntry = {
  category: StreakCategory
  current: number
  longest: number
  lastBreakDate?: string
  lastBreakReason?: string
}

export type MomentumSnapshot = {
  score: number
  level: MomentumLevel
  label: string
  explanation: string
  trailingWindow: AnalyticsRollingWindowKey
}

export type StreakSnapshot = {
  id: 'default'
  snapshotVersion: number
  updatedAt: string
  activeStreaks: StreakEntry[]
  momentum: MomentumSnapshot
}

export type WeeklyMission = {
  id: string
  weekKey: string
  kind: WeeklyMissionKind
  title: string
  description: string
  rationale: string
  unit: MissionUnit
  target: number
  progress: number
  priority: MissionPriority
  status: WeeklyMissionStatus
  dueDate: string
}

export type AnalyticsMetadataSnapshot = {
  id: 'default'
  snapshotVersion: number
  lastDailySnapshotDate?: string
  lastWeeklySnapshotWeekKey?: string
  availableRollingWindows: AnalyticsRollingWindowKey[]
  latestProjectionGeneratedAt?: string
  appCheckStatus: AppCheckRolloutStatus
  functionsEnabled: boolean
  updatedAt: string
}

export function createEmptyAnalyticsSummaryMetrics(): AnalyticsSummaryMetrics {
  return {
    trackedDays: 0,
    completedBlocks: 0,
    skippedBlocks: 0,
    movedBlocks: 0,
    completedDeepBlocks: 0,
    missedPrimeBlocks: 0,
    requiredOutputsCaptured: 0,
    prepHours: 0,
    workoutsScheduled: 0,
    workoutsCompleted: 0,
    sleepTargetMetDays: 0,
    lowEnergyDays: 0,
    survivalDays: 0,
    fallbackActivations: 0,
    scoreAverages: {
      master: 0,
      interviewPrep: 0,
      physical: 0,
      discipline: 0,
      consistency: 0,
    },
  }
}

export function createEmptyAnalyticsBreakdowns(): AnalyticsBreakdowns {
  return {
    byDayType: [],
    byWeekday: [],
    byTimeBand: [],
    byPrepDomain: [],
    byWarState: [],
  }
}

export function createDefaultProjectionSnapshot(
  targetDate: string,
  evaluatedDate: string,
): ReadinessProjectionSnapshot {
  return {
    id: 'default',
    snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
    generatedAt: new Date().toISOString(),
    targetDate,
    lastEvaluatedDate: evaluatedDate,
    status: 'insufficientData',
    statusLabel: 'Not enough longitudinal data yet.',
    confidence: 'low',
    currentReadinessLevel: 'building',
    projectedReadinessLevel: 'building',
    currentReadinessPercent: 0,
    projectedReadinessPercent: 0,
    estimatedReadyDate: null,
    targetSlipDays: 0,
    weeklyReadinessVelocity: 0,
    requiredWeeklyVelocity: 0,
    summary: 'Forge needs a larger observation window before pace projection becomes trustworthy.',
    risks: [],
    curve: [],
  }
}

export function createDefaultStreakSnapshot(referenceDate: string): StreakSnapshot {
  return {
    id: 'default',
    snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
    updatedAt: referenceDate,
    activeStreaks: streakCategories.map((category) => ({
      category,
      current: 0,
      longest: 0,
    })),
    momentum: {
      score: 0,
      level: 'insufficientData',
      label: 'Momentum needs more data.',
      explanation: 'Forge needs a stable trailing window before momentum becomes meaningful.',
      trailingWindow: '7d',
    },
  }
}

export function createDefaultAnalyticsMetadataSnapshot(): AnalyticsMetadataSnapshot {
  return {
    id: 'default',
    snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
    availableRollingWindows: [...analyticsRollingWindowKeys],
    appCheckStatus: 'notConfigured',
    functionsEnabled: false,
    updatedAt: new Date().toISOString(),
  }
}
