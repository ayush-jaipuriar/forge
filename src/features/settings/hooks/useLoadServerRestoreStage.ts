import { useMutation } from '@tanstack/react-query'
import type { BackupSnapshotRecord } from '@/domain/backup/types'
import { buildServerBackupRestoreStage } from '@/services/backup/serverBackupRestoreService'

export function useLoadServerRestoreStage(userId?: string | null) {
  return useMutation({
    mutationFn: async (backup: BackupSnapshotRecord) => {
      if (!userId) {
        throw new Error('Forge needs an authenticated user before it can load a scheduled server backup.')
      }

      return buildServerBackupRestoreStage({
        userId,
        backup,
      })
    },
  })
}
