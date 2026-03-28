import { describe, expect, it, vi } from 'vitest'
import { useApplyRestoreStage } from '@/features/settings/hooks/useApplyRestoreStage'

const invalidateQueriesMock = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const useMutationMock = vi.hoisted(() => vi.fn())
const applyRestoreStageMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-query', () => ({
  useMutation: useMutationMock,
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}))

vi.mock('@/services/backup/restoreService', () => ({
  applyRestoreStage: applyRestoreStageMock,
}))

describe('useApplyRestoreStage', () => {
  it('invalidates every workspace touched by restore, including weekly and command center queries', async () => {
    let capturedOnSuccess: (() => Promise<void>) | undefined

    useMutationMock.mockImplementation((config: { onSuccess: () => Promise<void> }) => {
      capturedOnSuccess = config.onSuccess
      return config
    })

    useApplyRestoreStage()

    if (!capturedOnSuccess) {
      throw new Error('Expected useMutation to capture an onSuccess handler.')
    }

    await capturedOnSuccess()

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['settings-workspace'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['today-workspace'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['weekly-workspace'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['prep-workspace'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['physical-workspace'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['readiness-workspace'],
    })

    const invalidateCalls = invalidateQueriesMock.mock.calls as unknown as Array<
      [{ predicate?: (query: { queryKey: unknown[] }) => boolean } | undefined]
    >
    const predicateArgument = invalidateCalls
      .map((call) => call[0] as { predicate?: (query: { queryKey: unknown[] }) => boolean } | undefined)
      .find((argument) => typeof argument?.predicate === 'function')

    expect(predicateArgument).toBeTruthy()
    expect(predicateArgument?.predicate?.({ queryKey: ['command-center-workspace', '30d'] })).toBe(true)
    expect(predicateArgument?.predicate?.({ queryKey: ['today-workspace'] })).toBe(false)
  })
})
