import type { ReadinessLevel } from '@/domain/common/types'
import { prepDomainLabels } from '@/domain/prep/selectors'
import type { PrepDomainSummary } from '@/domain/prep/selectors'
import type { PrepTopicSeed } from '@/domain/prep/types'
import type { ReadinessSnapshot } from '@/domain/readiness/types'

const FORGE_TARGET_DATE = '2026-05-31'

export function calculateReadinessSnapshot({
  date,
  focusedDomains,
  topics,
}: {
  date: string
  focusedDomains: PrepDomainSummary[]
  topics: PrepTopicSeed[]
}): ReadinessSnapshot {
  const daysRemaining = getDaysRemaining(date, FORGE_TARGET_DATE)
  const pressureLevel = getPressureLevel(daysRemaining)

  return {
    targetDate: FORGE_TARGET_DATE,
    daysRemaining,
    pressureLabel: getPressureLabel(pressureLevel),
    pressureLevel,
    focusedDomains: focusedDomains.map((domain) => ({
      domain: domain.domain,
      label: domain.label,
      readinessLevel: getDomainReadinessLevel(domain.domain, topics),
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

function getDomainReadinessLevel(domain: keyof typeof prepDomainLabels, topics: PrepTopicSeed[]) {
  const domainTopics = topics.filter((topic) => topic.domain === domain)
  const levelScores: Record<ReadinessLevel, number> = {
    critical: 0,
    behind: 1,
    building: 2,
    onTrack: 3,
  }
  const averageScore =
    domainTopics.reduce((sum, topic) => sum + levelScores[topic.readinessLevel], 0) / Math.max(domainTopics.length, 1)

  if (averageScore < 0.75) {
    return 'critical'
  }

  if (averageScore < 1.5) {
    return 'behind'
  }

  if (averageScore < 2.5) {
    return 'building'
  }

  return 'onTrack'
}
