import { beforeEach, describe, expect, it } from 'vitest'
import { localNotificationLogRepository, localNotificationStateRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import {
  getNotificationStateWorkspace,
  logDeliveredNotification,
  updateNotificationPermission,
} from '@/services/notifications/notificationStateService'

describe('notification state service', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('persists the requested notification permission', async () => {
    const snapshot = await updateNotificationPermission('granted')

    expect(snapshot.permission).toBe('granted')
    expect((await localNotificationStateRepository.getDefault())?.permission).toBe('granted')
  })

  it('records delivered notifications and increments the daily delivered counter', async () => {
    await logDeliveredNotification({
      id: 'candidate-1',
      ruleKey: 'fallback-mode-suggestion',
      category: 'fallback',
      title: 'Shift into Low Energy mode',
      body: 'Forge is suggesting a downgrade.',
      urgency: 'high',
      deliveryWindow: {
        startsAt: '2026-03-28T08:00:00.000Z',
        endsAt: '2026-03-28T08:30:00.000Z',
      },
      sourceDate: '2026-03-28',
    })

    const workspace = await getNotificationStateWorkspace()
    const logs = await localNotificationLogRepository.listRecent()

    expect(workspace.state.countersByDate['2026-03-28']?.delivered).toBe(1)
    expect(logs[0].status).toBe('delivered')
    expect(logs[0].ruleKey).toBe('fallback-mode-suggestion')
  })
})
