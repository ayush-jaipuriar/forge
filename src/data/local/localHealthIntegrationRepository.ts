import type { HealthIntegrationRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import { createDefaultHealthIntegrationSnapshot } from '@/domain/health/types'

export class LocalHealthIntegrationRepository implements HealthIntegrationRepository {
  async getDefault() {
    const db = await getForgeDb()
    return (await db.get('healthIntegration', 'default')) ?? createDefaultHealthIntegrationSnapshot()
  }

  async upsert(snapshot: Parameters<HealthIntegrationRepository['upsert']>[0]) {
    const db = await getForgeDb()
    await db.put('healthIntegration', {
      ...createDefaultHealthIntegrationSnapshot(),
      ...snapshot,
      id: 'default',
    })
  }
}
