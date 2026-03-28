import { localSettingsRepository } from '@/data/local'
import { forgePrepTaxonomy } from '@/data/seeds'
import { getPrepDomainSummaries, mergePrepTopicProgress } from '@/domain/prep/selectors'
import { calculateReadinessSnapshot } from '@/domain/readiness/calculateReadinessSnapshot'
import {
  buildReadinessOperationalSignals,
  getOperationalAnalyticsSummary,
} from '@/services/analytics/operationalAnalyticsService'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'

export async function getReadinessWorkspace(date = new Date()) {
  const settings = await localSettingsRepository.getDefault()
  const todayWorkspace = await getOrCreateTodayWorkspace(date)
  const topicRecords = mergePrepTopicProgress(forgePrepTaxonomy, settings.prepTopicProgress)
  const domainSummaries = getPrepDomainSummaries(topicRecords)
  const readinessSnapshot = calculateReadinessSnapshot({
    date: todayWorkspace.dateKey,
    focusedDomains: todayWorkspace.focusedPrepDomains,
    topics: topicRecords,
  })
  const operationalAnalytics = await getOperationalAnalyticsSummary(date)

  return {
    dateKey: todayWorkspace.dateKey,
    readinessSnapshot,
    domainSummaries,
    focusedDomains: todayWorkspace.focusedPrepDomains,
    operationalSignals: buildReadinessOperationalSignals({
      summary: operationalAnalytics,
      readinessSnapshot,
      domainSummaries,
    }),
  }
}
