import { afterEach, describe, expect, it, vi } from 'vitest'
import * as firebaseClient from '@/lib/firebase/client'
import { invokePlatformFunctionOperation } from '@/services/platform/platformFunctionService'

const httpsCallableMock = vi.hoisted(() => vi.fn())

vi.mock('firebase/functions', () => ({
  httpsCallable: httpsCallableMock,
}))

describe('platform function service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    httpsCallableMock.mockReset()
  })

  it('invokes the mapped callable for a Functions-owned platform operation', async () => {
    vi.spyOn(firebaseClient, 'getFirebaseFunctions').mockReturnValue({} as never)
    const callableImplementation = vi.fn().mockResolvedValue({
      data: {
        backupId: 'backup-1',
      },
    })
    httpsCallableMock.mockReturnValue(callableImplementation)

    const result = await invokePlatformFunctionOperation('scheduledBackups')

    expect(httpsCallableMock).toHaveBeenCalledWith(expect.anything(), 'generateUserBackup')
    expect(callableImplementation).toHaveBeenCalledWith({})
    expect(result).toEqual({
      key: 'scheduledBackups',
      callableName: 'generateUserBackup',
      result: {
        backupId: 'backup-1',
      },
    })
  })

  it('throws an explicit error when Firebase Functions is unavailable', async () => {
    vi.spyOn(firebaseClient, 'getFirebaseFunctions').mockReturnValue(null)

    await expect(invokePlatformFunctionOperation('scheduledNotifications')).rejects.toThrow(
      'Firebase Functions is unavailable',
    )
  })
})
