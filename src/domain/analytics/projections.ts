import type { ReadinessSnapshot } from '@/domain/readiness/types'
import type { AnalyticsDayFact } from '@/domain/analytics/facts'
import type { ProjectionConfidenceLevel, ReadinessProjectionSnapshot } from '@/domain/analytics/types'
import { ANALYTICS_SNAPSHOT_VERSION } from '@/domain/analytics/types'

const TARGET_READINESS_PERCENT = 85

export function buildReadinessProjectionSnapshot({
  facts,
  readinessSnapshot,
  anchorDate,
}: {
  facts: AnalyticsDayFact[]
  readinessSnapshot: ReadinessSnapshot
  anchorDate: string
}): ReadinessProjectionSnapshot {
  const generatedAt = new Date().toISOString()
  const confidence = getProjectionConfidence(facts.length)
  const currentReadinessPercent = getCurrentReadinessPercent(readinessSnapshot)

  if (facts.length < 5) {
    return {
      id: 'default',
      snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
      generatedAt,
      targetDate: readinessSnapshot.targetDate,
      lastEvaluatedDate: anchorDate,
      status: 'insufficientData',
      statusLabel: 'Need more tracked days before projection becomes trustworthy.',
      confidence,
      currentReadinessLevel: getReadinessLevelForPercent(currentReadinessPercent),
      projectedReadinessLevel: getReadinessLevelForPercent(currentReadinessPercent),
      currentReadinessPercent,
      projectedReadinessPercent: currentReadinessPercent,
      estimatedReadyDate: null,
      targetSlipDays: 0,
      weeklyReadinessVelocity: 0,
      requiredWeeklyVelocity: getRequiredWeeklyVelocity(currentReadinessPercent, readinessSnapshot.daysRemaining),
      summary: 'Forge needs a larger behavior window before projecting readiness pace honestly.',
      risks: ['Analytics history is still too shallow for a reliable readiness projection.'],
      curve: [],
    }
  }

  const weeklyReadinessVelocity = getWeeklyReadinessVelocity(facts)
  const requiredWeeklyVelocity = getRequiredWeeklyVelocity(currentReadinessPercent, readinessSnapshot.daysRemaining)
  const estimatedReadyDate = getEstimatedReadyDate(anchorDate, currentReadinessPercent, weeklyReadinessVelocity)
  const projectedReadinessPercent = getProjectedReadinessPercent(
    currentReadinessPercent,
    weeklyReadinessVelocity,
    readinessSnapshot.daysRemaining,
  )
  const targetSlipDays = estimatedReadyDate ? getDayDifference(readinessSnapshot.targetDate, estimatedReadyDate) : 0
  const status = getProjectionStatus({
    targetSlipDays,
    projectedReadinessPercent,
    requiredWeeklyVelocity,
    weeklyReadinessVelocity,
  })

  return {
    id: 'default',
    snapshotVersion: ANALYTICS_SNAPSHOT_VERSION,
    generatedAt,
    targetDate: readinessSnapshot.targetDate,
    lastEvaluatedDate: anchorDate,
    status,
    statusLabel: getProjectionStatusLabel(status),
    confidence,
    currentReadinessLevel: getReadinessLevelForPercent(currentReadinessPercent),
    projectedReadinessLevel: getReadinessLevelForPercent(projectedReadinessPercent),
    currentReadinessPercent,
    projectedReadinessPercent,
    estimatedReadyDate,
    targetSlipDays: Math.max(0, targetSlipDays),
    weeklyReadinessVelocity,
    requiredWeeklyVelocity,
    summary: getProjectionSummary({
      projectedReadinessPercent,
      targetSlipDays,
      weeklyReadinessVelocity,
      requiredWeeklyVelocity,
    }),
    risks: getProjectionRisks({
      facts,
      targetSlipDays,
      weeklyReadinessVelocity,
      requiredWeeklyVelocity,
    }),
    curve: buildProjectionCurve({
      anchorDate,
      currentReadinessPercent,
      weeklyReadinessVelocity,
      daysRemaining: readinessSnapshot.daysRemaining,
      factSample: facts,
    }),
  }
}

function getCurrentReadinessPercent(readinessSnapshot: ReadinessSnapshot) {
  const coveragePercent = readinessSnapshot.paceSnapshot.coveragePercent
  const highConfidenceRatio =
    readinessSnapshot.paceSnapshot.totalTopicCount === 0
      ? 0
      : (readinessSnapshot.paceSnapshot.highConfidenceTopicCount / readinessSnapshot.paceSnapshot.totalTopicCount) * 100

  return round(Math.min(100, coveragePercent * 0.65 + highConfidenceRatio * 0.35))
}

function getProjectionConfidence(trackedDays: number): ProjectionConfidenceLevel {
  if (trackedDays >= 21) {
    return 'high'
  }

  if (trackedDays >= 10) {
    return 'medium'
  }

  return 'low'
}

function getWeeklyReadinessVelocity(facts: AnalyticsDayFact[]) {
  const trackedDays = Math.max(1, facts.length)
  const prepHoursPerWeek = (facts.reduce((sum, fact) => sum + fact.prepMinutes, 0) / 60 / trackedDays) * 7
  const deepBlocksPerWeek = (facts.reduce((sum, fact) => sum + fact.completedDeepBlocks, 0) / trackedDays) * 7
  const sleepMetRate = facts.filter((fact) => fact.sleepStatus === 'met').length / trackedDays
  const scoreRate = facts.reduce((sum, fact) => sum + fact.interviewPrepScore, 0) / trackedDays

  return round(Math.min(12, prepHoursPerWeek * 0.35 + deepBlocksPerWeek * 1.2 + sleepMetRate * 2 + scoreRate * 0.08))
}

function getRequiredWeeklyVelocity(currentReadinessPercent: number, daysRemaining: number) {
  if (daysRemaining <= 0) {
    return TARGET_READINESS_PERCENT <= currentReadinessPercent ? 0 : TARGET_READINESS_PERCENT - currentReadinessPercent
  }

  return round(Math.max(0, ((TARGET_READINESS_PERCENT - currentReadinessPercent) / daysRemaining) * 7))
}

function getProjectedReadinessPercent(currentReadinessPercent: number, weeklyVelocity: number, daysRemaining: number) {
  return round(Math.min(100, currentReadinessPercent + weeklyVelocity * (daysRemaining / 7)))
}

function getEstimatedReadyDate(anchorDate: string, currentReadinessPercent: number, weeklyVelocity: number) {
  if (currentReadinessPercent >= TARGET_READINESS_PERCENT) {
    return anchorDate
  }

  if (weeklyVelocity <= 0) {
    return null
  }

  const weeksNeeded = Math.ceil((TARGET_READINESS_PERCENT - currentReadinessPercent) / weeklyVelocity)
  return addDays(anchorDate, weeksNeeded * 7)
}

function getProjectionStatus({
  targetSlipDays,
  projectedReadinessPercent,
  requiredWeeklyVelocity,
  weeklyReadinessVelocity,
}: {
  targetSlipDays: number
  projectedReadinessPercent: number
  requiredWeeklyVelocity: number
  weeklyReadinessVelocity: number
}) {
  if (targetSlipDays > 28) {
    return 'critical'
  }

  if (targetSlipDays > 7 || weeklyReadinessVelocity < requiredWeeklyVelocity) {
    return 'slipping'
  }

  if (projectedReadinessPercent < TARGET_READINESS_PERCENT) {
    return 'atRisk'
  }

  return 'onTrack'
}

function getProjectionStatusLabel(status: ReadinessProjectionSnapshot['status']) {
  switch (status) {
    case 'critical':
      return 'Projection shows a meaningful target slip.'
    case 'slipping':
      return 'Projection suggests the current pace is slipping.'
    case 'atRisk':
      return 'Projection is close, but still at risk.'
    case 'onTrack':
      return 'Projection supports the current target.'
    case 'insufficientData':
    default:
      return 'Projection needs more data.'
  }
}

function getProjectionSummary({
  projectedReadinessPercent,
  targetSlipDays,
  weeklyReadinessVelocity,
  requiredWeeklyVelocity,
}: {
  projectedReadinessPercent: number
  targetSlipDays: number
  weeklyReadinessVelocity: number
  requiredWeeklyVelocity: number
}) {
  if (targetSlipDays > 0) {
    return `At the current pace, readiness slips by roughly ${targetSlipDays} day(s). Weekly readiness velocity is ${weeklyReadinessVelocity}, while the target requires ${requiredWeeklyVelocity}.`
  }

  return `Projected readiness reaches ${projectedReadinessPercent}% by the target window. Weekly readiness velocity is ${weeklyReadinessVelocity} against a required pace of ${requiredWeeklyVelocity}.`
}

function getProjectionRisks({
  facts,
  targetSlipDays,
  weeklyReadinessVelocity,
  requiredWeeklyVelocity,
}: {
  facts: AnalyticsDayFact[]
  targetSlipDays: number
  weeklyReadinessVelocity: number
  requiredWeeklyVelocity: number
}) {
  const risks: string[] = []

  if (targetSlipDays > 0) {
    risks.push(`Current pace slips the target by roughly ${targetSlipDays} day(s).`)
  }

  if (weeklyReadinessVelocity < requiredWeeklyVelocity) {
    risks.push('Weekly readiness velocity is below the current target requirement.')
  }

  const missedPrimeRate = facts.filter((fact) => fact.missedPrimeBlock).length / Math.max(1, facts.length)
  if (missedPrimeRate >= 0.3) {
    risks.push('Prime execution miss rate is high enough to distort projection confidence.')
  }

  const sleepMissRate = facts.filter((fact) => fact.sleepStatus === 'missed').length / Math.max(1, facts.length)
  if (sleepMissRate >= 0.4) {
    risks.push('Sleep misses are frequent enough to threaten sustained readiness growth.')
  }

  return risks
}

function buildProjectionCurve({
  anchorDate,
  currentReadinessPercent,
  weeklyReadinessVelocity,
  daysRemaining,
  factSample,
}: {
  anchorDate: string
  currentReadinessPercent: number
  weeklyReadinessVelocity: number
  daysRemaining: number
  factSample: AnalyticsDayFact[]
}) {
  const points = Math.max(1, Math.min(8, Math.ceil(daysRemaining / 7)))
  const averageProjectedScore = round(
    factSample.length === 0 ? 0 : factSample.reduce((sum, fact) => sum + fact.projectedScore, 0) / factSample.length,
  )

  return Array.from({ length: points }, (_, index) => {
    const daysAhead = index * 7
    return {
      date: addDays(anchorDate, daysAhead),
      readinessPercent: round(Math.min(100, currentReadinessPercent + weeklyReadinessVelocity * index)),
      projectedScore: averageProjectedScore,
    }
  })
}

function getReadinessLevelForPercent(percent: number): ReadinessSnapshot['pressureLevel'] {
  if (percent < 30) {
    return 'critical'
  }

  if (percent < 55) {
    return 'behind'
  }

  if (percent < 80) {
    return 'building'
  }

  return 'onTrack'
}

function addDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setDate(date.getDate() + amount)

  return date.toISOString().slice(0, 10)
}

function getDayDifference(targetDate: string, actualDate: string) {
  const target = new Date(`${targetDate}T00:00:00`).getTime()
  const actual = new Date(`${actualDate}T00:00:00`).getTime()

  return Math.ceil((actual - target) / (1000 * 60 * 60 * 24))
}

function round(value: number) {
  return Number(value.toFixed(1))
}
