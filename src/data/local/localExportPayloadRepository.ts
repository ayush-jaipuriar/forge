import type { ExportPayloadRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import type { ForgeExportPayload } from '@/domain/backup/types'

export class LocalExportPayloadRepository implements ExportPayloadRepository {
  async save(payload: ForgeExportPayload) {
    const db = await getForgeDb()
    await db.put('exportPayloads', payload)
  }
}
