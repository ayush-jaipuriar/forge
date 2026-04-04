import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invokePlatformFunctionOperation } from '@/services/platform/platformFunctionService'
import type { PlatformServiceBoundaryKey } from '@/domain/platform/ownership'

type InvokablePlatformOperationKey = Extract<
  PlatformServiceBoundaryKey,
  'scheduledBackups' | 'scheduledNotifications' | 'analyticsSnapshots'
>

export function useInvokePlatformOperation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (key: InvokablePlatformOperationKey) => invokePlatformFunctionOperation(key),
    onSuccess: async (_, key) => {
      const invalidations: Promise<unknown>[] = []

      if (key === 'scheduledBackups' || key === 'scheduledNotifications') {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: ['settings-workspace'],
          }),
        )
      }

      if (key === 'analyticsSnapshots') {
        invalidations.push(
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'command-center-workspace',
          }),
        )
      }

      await Promise.all(invalidations)
    },
  })
}
