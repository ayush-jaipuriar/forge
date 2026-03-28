import type { getOrCreateTodayWorkspace } from '@/services/routine/routinePersistenceService'

export type ReturnTypeGetOrCreateTodayWorkspace = Awaited<ReturnType<typeof getOrCreateTodayWorkspace>>
