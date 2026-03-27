import { localSettingsRepository } from '@/data/local'
import { forgePrepTaxonomy } from '@/data/seeds'
import { getFocusedPrepDomains, getPrepDomainSummaries, getPrepTopicsForDomain, mergePrepTopicProgress } from '@/domain/prep/selectors'
import type { PrepDomainKey } from '@/domain/prep/types'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'

export async function getPrepWorkspace(date = new Date()) {
  const settings = await localSettingsRepository.getDefault()
  const todayWorkspace = await getOrCreateTodayWorkspace(date)
  const topicRecords = mergePrepTopicProgress(forgePrepTaxonomy, settings.prepTopicProgress)
  const focusAreas = [...new Set(todayWorkspace.dayInstance.blocks.flatMap((block) => block.focusAreas))]
  const focusedDomains = getFocusedPrepDomains(topicRecords, [
    ...focusAreas,
    ...todayWorkspace.topPriorities.flatMap((block) => block.focusAreas),
  ])
  const domainSummaries = getPrepDomainSummaries(topicRecords)

  return {
    dayLabel: todayWorkspace.dayInstance.label,
    totalTopicCount: topicRecords.length,
    focusedDomains,
    domainSummaries,
    topicsByDomain: Object.fromEntries(
      domainSummaries.map((domain) => [domain.domain, getPrepTopicsForDomain(topicRecords, domain.domain as PrepDomainKey)]),
    ) as Record<PrepDomainKey, ReturnType<typeof getPrepTopicsForDomain>>,
  }
}
