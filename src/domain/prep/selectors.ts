import type { ConfidenceLevel, PrepExposureState, ReadinessLevel } from '@/domain/common/types'
import type { PrepDomainKey, PrepTopicProgressSnapshot, PrepTopicRecord, PrepTopicSeed } from '@/domain/prep/types'

export const prepDomainLabels: Record<PrepDomainKey, string> = {
  dsa: 'DSA',
  systemDesign: 'System Design',
  lld: 'LLD',
  javaBackend: 'Java / Backend',
  secondary: 'CS Fundamentals / AI',
}

export type PrepDomainSummary = {
  domain: PrepDomainKey
  label: string
  topicCount: number
  groupCount: number
  primaryGroups: string[]
  touchedTopicCount: number
  highConfidenceCount: number
  hoursSpent: number
  readinessLevel: ReadinessLevel
}

export function mergePrepTopicProgress(
  topics: PrepTopicSeed[],
  progressByTopic: Record<string, PrepTopicProgressSnapshot>,
): PrepTopicRecord[] {
  return topics.map((topic) => {
    const progress = progressByTopic[topic.id]

    return {
      ...topic,
      confidence: progress?.confidence ?? topic.defaultConfidence,
      exposureState: progress?.exposureState ?? topic.defaultExposureState,
      revisionCount: progress?.revisionCount ?? 0,
      solvedCount: progress?.solvedCount ?? 0,
      exposureCount: progress?.exposureCount ?? 0,
      hoursSpent: progress?.hoursSpent ?? 0,
      notes: progress?.notes,
      readinessLevel: getPrepTopicReadinessLevel({
        confidence: progress?.confidence ?? topic.defaultConfidence,
        exposureState: progress?.exposureState ?? topic.defaultExposureState,
        revisionCount: progress?.revisionCount ?? 0,
        solvedCount: progress?.solvedCount ?? 0,
        exposureCount: progress?.exposureCount ?? 0,
        hoursSpent: progress?.hoursSpent ?? 0,
      }),
    }
  })
}

export function getPrepDomainSummaries(topics: Array<PrepTopicSeed | PrepTopicRecord>): PrepDomainSummary[] {
  return Object.entries(prepDomainLabels).map(([domain, label]) => {
    const domainTopics = topics.filter((topic) => topic.domain === domain)
    const uniqueGroups = [...new Set(domainTopics.map((topic) => topic.group))]
    const touchedTopicCount = domainTopics.filter(isTopicTouched).length
    const highConfidenceCount = domainTopics.filter((topic) => getTopicConfidence(topic) === 'high').length
    const hoursSpent = domainTopics.reduce((sum, topic) => sum + getTopicHoursSpent(topic), 0)

    return {
      domain: domain as PrepDomainKey,
      label,
      topicCount: domainTopics.length,
      groupCount: uniqueGroups.length,
      primaryGroups: uniqueGroups.slice(0, 3),
      touchedTopicCount,
      highConfidenceCount,
      hoursSpent,
      readinessLevel: getDomainReadinessLevel(domainTopics),
    }
  })
}

export function getFocusedPrepDomains(topics: Array<PrepTopicSeed | PrepTopicRecord>, focusAreas: string[]) {
  const loweredFocusAreas = focusAreas.map((area) => area.toLowerCase())

  return getPrepDomainSummaries(topics).filter((summary) =>
    loweredFocusAreas.some(
      (focusArea) =>
        summary.label.toLowerCase().includes(focusArea) ||
        summary.primaryGroups.some((group) => group.toLowerCase().includes(focusArea)),
    ),
  )
}

export function getPrepTopicsForDomain(topics: PrepTopicRecord[], domain: PrepDomainKey) {
  return topics.filter((topic) => topic.domain === domain)
}

export function getPrepTopicReadinessLevel({
  confidence,
  exposureState,
  revisionCount,
  solvedCount,
  exposureCount,
  hoursSpent,
}: {
  confidence: ConfidenceLevel
  exposureState: PrepExposureState
  revisionCount: number
  solvedCount: number
  exposureCount: number
  hoursSpent: number
}): ReadinessLevel {
  const confidenceScore: Record<ConfidenceLevel, number> = {
    low: 0,
    medium: 1.2,
    high: 2.2,
  }
  const exposureScore: Record<PrepExposureState, number> = {
    notStarted: 0,
    introduced: 0.8,
    inProgress: 1.4,
    retention: 2,
    confident: 2.5,
  }
  const score =
    confidenceScore[confidence] +
    exposureScore[exposureState] +
    Math.min(revisionCount, 4) * 0.35 +
    Math.min(solvedCount, 5) * 0.35 +
    Math.min(exposureCount, 4) * 0.25 +
    Math.min(hoursSpent, 8) * 0.18

  if (score < 1.6) {
    return 'critical'
  }

  if (score < 3.2) {
    return 'behind'
  }

  if (score < 5.4) {
    return 'building'
  }

  return 'onTrack'
}

function getDomainReadinessLevel(topics: Array<PrepTopicSeed | PrepTopicRecord>): ReadinessLevel {
  const levelScores: Record<ReadinessLevel, number> = {
    critical: 0,
    behind: 1,
    building: 2,
    onTrack: 3,
  }
  const averageScore =
    topics.reduce((sum, topic) => sum + levelScores[topic.readinessLevel], 0) / Math.max(topics.length, 1)

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

function getTopicConfidence(topic: PrepTopicSeed | PrepTopicRecord) {
  return 'confidence' in topic ? topic.confidence : topic.defaultConfidence
}

function getTopicHoursSpent(topic: PrepTopicSeed | PrepTopicRecord) {
  return 'hoursSpent' in topic ? topic.hoursSpent : 0
}

function isTopicTouched(topic: PrepTopicSeed | PrepTopicRecord) {
  if (!('exposureState' in topic)) {
    return topic.defaultExposureState !== 'notStarted'
  }

  return (
    topic.exposureState !== 'notStarted' ||
    topic.revisionCount > 0 ||
    topic.solvedCount > 0 ||
    topic.exposureCount > 0 ||
    topic.hoursSpent > 0
  )
}
