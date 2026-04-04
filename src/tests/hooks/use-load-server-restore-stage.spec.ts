import { describe, expect, it, vi } from 'vitest'
import { useLoadServerRestoreStage } from '@/features/settings/hooks/useLoadServerRestoreStage'

const useMutationMock = vi.hoisted(() => vi.fn())
const buildServerBackupRestoreStageMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-query', () => ({
  useMutation: useMutationMock,
}))

vi.mock('@/services/backup/serverBackupRestoreService', () => ({
  buildServerBackupRestoreStage: buildServerBackupRestoreStageMock,
}))

describe('useLoadServerRestoreStage', () => {
  it('loads a restore stage for the selected server backup through the authenticated user id', async () => {
    let capturedMutationFn:
      | ((backup: { id: string; createdAt: string }) => Promise<unknown>)
      | undefined

    useMutationMock.mockImplementation((config: { mutationFn: (backup: { id: string; createdAt: string }) => Promise<unknown> }) => {
      capturedMutationFn = config.mutationFn
      return config
    })

    buildServerBackupRestoreStageMock.mockResolvedValue({
      summary: 'loaded',
      warnings: [],
      payload: {},
      source: {
        kind: 'serverBackup',
        label: 'Loaded from scheduled backup backup-1',
        backupId: 'backup-1',
      },
    })

    useLoadServerRestoreStage('user-1')

    if (!capturedMutationFn) {
      throw new Error('Expected useMutation to capture a mutationFn.')
    }

    const backup = {
      id: 'backup-1',
      createdAt: '2026-04-04T08:00:00.000Z',
    }

    await capturedMutationFn(backup)

    expect(buildServerBackupRestoreStageMock).toHaveBeenCalledWith({
      userId: 'user-1',
      backup,
    })
  })

  it('rejects loading a server backup when no authenticated user id is available', async () => {
    let capturedMutationFn:
      | ((backup: { id: string; createdAt: string }) => Promise<unknown>)
      | undefined

    useMutationMock.mockImplementation((config: { mutationFn: (backup: { id: string; createdAt: string }) => Promise<unknown> }) => {
      capturedMutationFn = config.mutationFn
      return config
    })

    useLoadServerRestoreStage(null)

    if (!capturedMutationFn) {
      throw new Error('Expected useMutation to capture a mutationFn.')
    }

    await expect(
      capturedMutationFn({
        id: 'backup-1',
        createdAt: '2026-04-04T08:00:00.000Z',
      }),
    ).rejects.toThrow('authenticated user')
  })
})
