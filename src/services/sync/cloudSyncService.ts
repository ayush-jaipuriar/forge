import { localDayInstanceRepository, localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { FirestoreDayInstanceRepository } from '@/data/firebase/firestoreDayInstanceRepository'
import { FirestoreSettingsRepository } from '@/data/firebase/firestoreSettingsRepository'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import { queryClient } from '@/lib/query/queryClient'

const firestoreDayInstanceRepository = new FirestoreDayInstanceRepository()
const firestoreSettingsRepository = new FirestoreSettingsRepository()

type HydrationResult = {
  hydratedSettings: boolean
  hydratedDayInstances: number
}

export async function hydrateCloudSharedState(userId: string): Promise<HydrationResult> {
  const [settings, dayInstances] = await Promise.all([
    firestoreSettingsRepository.getDefault(userId),
    firestoreDayInstanceRepository.listAll(userId),
  ])

  await Promise.all([applyRemoteSettings(settings), applyRemoteDayInstances(dayInstances)])
  await invalidateSharedWorkspaceQueries()

  return {
    hydratedSettings: Boolean(settings),
    hydratedDayInstances: dayInstances.length,
  }
}

export function subscribeToCloudSharedState(userId: string) {
  const unsubscribeSettings = firestoreSettingsRepository.subscribeDefault(userId, (settings) => {
    void applyRemoteSettings(settings).then(() => invalidateSharedWorkspaceQueries())
  })

  const unsubscribeDayInstances = firestoreDayInstanceRepository.subscribeAll(userId, (instances) => {
    void applyRemoteDayInstances(instances).then(() => invalidateSharedWorkspaceQueries())
  })

  return () => {
    unsubscribeSettings()
    unsubscribeDayInstances()
  }
}

async function applyRemoteSettings(settings: UserSettings | null) {
  if (!settings) {
    return
  }

  await localSettingsRepository.upsert(settings)
  await clearSupersededSyncQueueItems({
    actionType: 'upsertSettings',
    entityIds: [settings.id],
  })
}

async function applyRemoteDayInstances(instances: DayInstance[]) {
  if (instances.length === 0) {
    return
  }

  await localDayInstanceRepository.upsertMany(instances)
  await clearSupersededSyncQueueItems({
    actionType: 'upsertDayInstance',
    entityIds: instances.map((instance) => instance.id),
  })
}

async function clearSupersededSyncQueueItems(input: {
  actionType: 'upsertDayInstance' | 'upsertSettings'
  entityIds: string[]
}) {
  const entityIds = new Set(input.entityIds)

  if (entityIds.size === 0) {
    return
  }

  const outstandingItems = await localSyncQueueRepository.listOutstanding()
  const staleItems = outstandingItems.filter((item) => item.actionType === input.actionType && entityIds.has(item.entityId))

  await Promise.all(staleItems.map((item) => localSyncQueueRepository.remove(item.id)))
}

export async function invalidateSharedWorkspaceQueries() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['today-workspace'] }),
    queryClient.invalidateQueries({ queryKey: ['weekly-workspace'] }),
    queryClient.invalidateQueries({ queryKey: ['settings-workspace'] }),
    queryClient.invalidateQueries({ queryKey: ['prep-workspace'] }),
    queryClient.invalidateQueries({ queryKey: ['physical-workspace'] }),
    queryClient.invalidateQueries({ queryKey: ['readiness-workspace'] }),
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'command-center-workspace',
    }),
  ])
}
