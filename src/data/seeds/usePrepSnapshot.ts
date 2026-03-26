import { forgePrepTaxonomy } from '@/data/seeds'
import { getTodayRoutineSnapshot } from '@/data/seeds/useRoutineSnapshot'
import { getFocusedPrepDomains, getPrepDomainSummaries } from '@/domain/prep/selectors'

export function getPrepSnapshot(date = new Date()) {
  const { dayInstance, topPriorities } = getTodayRoutineSnapshot(date)
  const focusAreas = [...new Set(dayInstance.blocks.flatMap((block) => block.focusAreas))]

  return {
    domainSummaries: getPrepDomainSummaries(forgePrepTaxonomy),
    focusedDomains: getFocusedPrepDomains(forgePrepTaxonomy, [...focusAreas, ...topPriorities.flatMap((block) => block.focusAreas)]),
    totalTopicCount: forgePrepTaxonomy.length,
    dayLabel: dayInstance.label,
  }
}
