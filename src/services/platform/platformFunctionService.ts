import { httpsCallable } from 'firebase/functions'
import {
  buildPlatformServiceWorkspace,
  type PlatformServiceBoundary,
  type PlatformServiceBoundaryKey,
} from '@/domain/platform/ownership'
import { getFirebaseFunctions } from '@/lib/firebase/client'

type InvokablePlatformOperationKey = Extract<
  PlatformServiceBoundaryKey,
  'scheduledBackups' | 'scheduledNotifications' | 'analyticsSnapshots'
>

export type PlatformFunctionInvocationResult = {
  key: InvokablePlatformOperationKey
  callableName: NonNullable<PlatformServiceBoundary['callableName']>
  result: unknown
}

function getInvokableBoundary(
  key: InvokablePlatformOperationKey,
): PlatformServiceBoundary & { callableName: NonNullable<PlatformServiceBoundary['callableName']> } {
  const workspace = buildPlatformServiceWorkspace()
  const boundary = workspace.userInvokableFunctions.find((entry) => entry.key === key)

  if (!boundary || !boundary.callableName) {
    throw new Error(`Forge does not have an active Functions-backed operation for ${key}.`)
  }

  return boundary as PlatformServiceBoundary & { callableName: NonNullable<PlatformServiceBoundary['callableName']> }
}

export async function invokePlatformFunctionOperation(key: InvokablePlatformOperationKey): Promise<PlatformFunctionInvocationResult> {
  const boundary = getInvokableBoundary(key)
  const functions = getFirebaseFunctions()

  if (!functions) {
    throw new Error('Firebase Functions is unavailable because Firebase configuration is incomplete.')
  }

  const callable = httpsCallable(functions, boundary.callableName)
  const response = await callable({})

  return {
    key,
    callableName: boundary.callableName,
    result: response.data,
  }
}
