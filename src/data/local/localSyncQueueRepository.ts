import type { SyncQueueRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'

export class LocalSyncQueueRepository implements SyncQueueRepository {
  async enqueue(item: Parameters<SyncQueueRepository['enqueue']>[0]) {
    const db = await getForgeDb()
    await db.put('syncQueue', item)
  }

  async listOutstanding() {
    const db = await getForgeDb()
    const items = await db.getAll('syncQueue')

    return items.sort((left, right) => left.queuedAt.localeCompare(right.queuedAt))
  }

  async listReplayable() {
    const items = await this.listOutstanding()

    return items.filter((item) => item.status === 'pending' || item.status === 'retrying' || item.status === 'failed')
  }

  async remove(id: string) {
    const db = await getForgeDb()
    await db.delete('syncQueue', id)
  }

  async countOutstanding() {
    const items = await this.listOutstanding()

    return items.length
  }

  async markRetrying(id: string) {
    const db = await getForgeDb()
    const current = await db.get('syncQueue', id)

    if (!current) {
      return
    }

    await db.put('syncQueue', {
      ...current,
      status: 'retrying',
      attemptCount: current.attemptCount + 1,
      updatedAt: new Date().toISOString(),
    })
  }

  async markFailed(id: string, message: string) {
    const db = await getForgeDb()
    const current = await db.get('syncQueue', id)

    if (!current) {
      return
    }

    await db.put('syncQueue', {
      ...current,
      status: 'failed',
      lastError: message,
      updatedAt: new Date().toISOString(),
    })
  }
}
