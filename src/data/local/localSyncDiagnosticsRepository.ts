import type { SyncDiagnosticsRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'

export class LocalSyncDiagnosticsRepository implements SyncDiagnosticsRepository {
  async getDefault() {
    const db = await getForgeDb()
    return (await db.get('syncDiagnostics', 'default')) ?? null
  }

  async upsert(snapshot: Parameters<SyncDiagnosticsRepository['upsert']>[0]) {
    const db = await getForgeDb()
    await db.put('syncDiagnostics', snapshot)
  }
}
