import type { PrepDomainKey, PrepTopicSeed } from '@/domain/prep/types'

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
}

export function getPrepDomainSummaries(topics: PrepTopicSeed[]): PrepDomainSummary[] {
  return Object.entries(prepDomainLabels).map(([domain, label]) => {
    const domainTopics = topics.filter((topic) => topic.domain === domain)
    const uniqueGroups = [...new Set(domainTopics.map((topic) => topic.group))]

    return {
      domain: domain as PrepDomainKey,
      label,
      topicCount: domainTopics.length,
      groupCount: uniqueGroups.length,
      primaryGroups: uniqueGroups.slice(0, 3),
    }
  })
}

export function getFocusedPrepDomains(topics: PrepTopicSeed[], focusAreas: string[]) {
  const loweredFocusAreas = focusAreas.map((area) => area.toLowerCase())

  return getPrepDomainSummaries(topics).filter((summary) =>
    loweredFocusAreas.some(
      (focusArea) =>
        summary.label.toLowerCase().includes(focusArea) ||
        summary.primaryGroups.some((group) => group.toLowerCase().includes(focusArea)),
    ),
  )
}
