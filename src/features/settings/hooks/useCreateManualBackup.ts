import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SessionUser } from '@/features/auth/types/auth'
import { downloadTextFile } from '@/services/backup/browserDownload'
import { createManualBackup } from '@/services/backup/backupService'

export function useCreateManualBackup(user: SessionUser | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ kind }: { kind: 'json' | 'notes' | 'both' }) => {
      const result = await createManualBackup(user)

      if (kind === 'json' || kind === 'both') {
        downloadTextFile({
          filename: result.suggestedJsonFilename,
          content: result.jsonText,
          mimeType: 'application/json',
        })
      }

      if (kind === 'notes' || kind === 'both') {
        downloadTextFile({
          filename: result.suggestedNotesFilename,
          content: result.notesMarkdown,
          mimeType: 'text/markdown',
        })
      }

      return result
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['settings-workspace'],
      })
    },
  })
}
