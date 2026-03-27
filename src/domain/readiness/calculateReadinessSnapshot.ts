import type { ReadinessLevel } from '@/domain/common/types'
import { getPrepDomainSummaries } from '@/domain/prep/selectors'
import type { PrepDomainSummary } from '@/domain/prep/selectors'
import type { PrepTopicRecord, PrepTopicSeed } from '@/domain/prep/types'
import type { ReadinessSnapshot } from '@/domain/readiness/types'

const FORGE_TARGET_DATE = '2026-05-31'

export function calculateReadinessSnapshot({
  date,
  focusedDomains,
  topics,
}: {
  date: string
  focusedDomains: PrepDomainSummary[]
  topics: Array<PrepTopicSeed | PrepTopicRecord>
}): ReadinessSnapshot {
  const daysRemaining = getDaysRemaining(date, FORGE_TARGET_DATE)
  const pressureLevel = getPressureLevel(daysRemaining)
  const domainStates = getPrepDomainSummaries(topics).map((domain) => ({
    domain: domain.domain,
    label: domain.label,
    readinessLevel: domain.readinessLevel,
    touchedTopicCount: domain.touchedTopicCount,
    totalTopicCount: domain.topicCount,
    highConfidenceCount: domain.highConfidenceCount,
    hoursSpent: Number(domain.hoursSpent.toFixed(1)),
  }))

  return {
    targetDate: FORGE_TARGET_DATE,
    daysRemaining,
    pressureLabel: getPressureLabel(pressureLevel),
    pressureLevel,
    paceSnapshot: getPaceSnapshot(daysRemaining, domainStates),
    domainStates,
    focusedDomains: focusedDomains.map((domain) => ({
      domain: domain.domain,
      label: domain.label,
      readinessLevel: domainStates.find((state) => state.domain === domain.domain)?.readinessLevel ?? 'building',
    })),
  }
}

function getDaysRemaining(date: string, targetDate: string) {
  const start = new Date(`${date}T00:00:00`).getTime()
  const end = new Date(`${targetDate}T00:00:00`).getTime()

  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
}

function getPressureLevel(daysRemaining: number): ReadinessLevel {
  if (daysRemaining <= 21) {
    return 'critical'
  }

  if (daysRemaining <= 45) {
    return 'behind'
  }

  if (daysRemaining <= 75) {
    return 'building'
  }

  return 'onTrack'
}

function getPressureLabel(level: ReadinessLevel) {
  switch (level) {
    case 'critical':
      return 'Target pressure is critical.'
    case 'behind':
      return 'Target pressure is rising.'
    case 'building':
      return 'Readiness window is active.'
    case 'onTrack':
      return 'Target pace is manageable.'
    default:
      return 'Readiness window is active.'
  }
}

function getPaceSnapshot(
  daysRemaining: number,
  domainStates: ReadinessSnapshot['domainStates'],
): ReadinessSnapshot['paceSnapshot'] {
  const touchedTopicCount = domainStates.reduce((sum, domain) => sum + domain.touchedTopicCount, 0)
  const totalTopicCount = domainStates.reduce((sum, domain) => sum + domain.totalTopicCount, 0)
  const highConfidenceTopicCount = domainStates.reduce((sum, domain) => sum + domain.highConfidenceCount, 0)
  const untouchedTopics = Math.max(0, totalTopicCount - touchedTopicCount)
  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7))
  const requiredTopicsPerWeek = Math.ceil(untouchedTopics / weeksRemaining)
  const coveragePercent = Math.round((touchedTopicCount / Math.max(totalTopicCount, 1)) * 100)
  const paceLevel =
    requiredTopicsPerWeek > 10 ? 'critical' : requiredTopicsPerWeek > 6 ? 'behind' : requiredTopicsPerWeek > 3 ? 'building' : 'onTrack'

  return {
    touchedTopicCount,
    totalTopicCount,
    highConfidenceTopicCount,
    coveragePercent,
    requiredTopicsPerWeek,
    paceLevel,
    paceLabel: getPaceLabel(paceLevel, requiredTopicsPerWeek),
  }
}

function getPaceLabel(level: ReadinessLevel, requiredTopicsPerWeek: number) {
  switch (level) {
    case 'critical':
      return `Coverage pace is critical. You still need roughly ${requiredTopicsPerWeek} untouched topics per week.`
    case 'behind':
      return `Coverage pace is behind. You still need roughly ${requiredTopicsPerWeek} untouched topics per week.`
    case 'building':
      return `Coverage pace is building, but the remaining load is still around ${requiredTopicsPerWeek} topics per week.`
    case 'onTrack':
      return `Coverage pace is manageable at roughly ${requiredTopicsPerWeek} untouched topics per week.`
    default:
      return `Coverage pace implies roughly ${requiredTopicsPerWeek} untouched topics per week.`
  }
}
