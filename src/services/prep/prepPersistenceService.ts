import { localSettingsRepository } from '@/data/local'
import { FirestoreSettingsRepository } from '@/data/firebase/firestoreSettingsRepository'
import { forgePrepTaxonomy } from '@/data/seeds'
import { getFocusedPrepDomains, getPrepDomainSummaries, getPrepTopicsForDomain, mergePrepTopicProgress } from '@/domain/prep/selectors'
import type { PrepDomainKey } from '@/domain/prep/types'
import { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'
import { createDefaultUserSettings, type UserSettings } from '@/domain/settings/types'
import { getOrCreateTodayWorkspaceForUser } from '@/services/routine/routinePersistenceService'

const firestoreSettingsRepository = new FirestoreSettingsRepository()

export async function getPrepWorkspace(date = new Date()) {
  const settings = await localSettingsRepository.getDefault()
  const todayWorkspace = await getOrCreateTodayWorkspace(date)
  return buildPrepWorkspaceFromSettings({ settings, todayWorkspace })
}

export async function getPrepWorkspaceForUser(userId: string, date = new Date()) {
  const settings = await getCloudSettingsOrCreateDefault(userId)
  const todayWorkspace = await getOrCreateTodayWorkspaceForUser(userId, date)

  return buildPrepWorkspaceFromSettings({ settings, todayWorkspace })
}

function buildPrepWorkspaceFromSettings({
  settings,
  todayWorkspace,
}: {
  settings: UserSettings
  todayWorkspace: Awaited<ReturnType<typeof getOrCreateTodayWorkspace>>
}) {
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

async function getCloudSettingsOrCreateDefault(userId: string) {
  const settings = await firestoreSettingsRepository.getDefault(userId)

  if (settings) {
    return {
      ...createDefaultUserSettings(),
      ...settings,
    }
  }

  const defaultSettings = createDefaultUserSettings()
  await firestoreSettingsRepository.upsert(userId, defaultSettings)

  return defaultSettings
}
