import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import type { AuthSessionValue } from '@/features/auth/types/auth'

const authMock = vi.hoisted(() => ({
  value: {
    status: 'unauthenticated',
    user: null,
    errorMessage: null,
    signInWithGoogle: vi.fn(async () => {}),
    signOutUser: vi.fn(async () => {}),
  } satisfies AuthSessionValue,
}))

vi.mock('@/features/auth/providers/AuthSessionProvider', () => ({
  AuthSessionProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('@/features/auth/providers/useAuthSession', () => ({
  useAuthSession: () => authMock.value,
}))

describe('AuthPage', () => {
  beforeEach(() => {
    authMock.value = {
      status: 'unauthenticated',
      user: null,
      errorMessage: null,
      signInWithGoogle: vi.fn(async () => {}),
      signOutUser: vi.fn(async () => {}),
    }
  })

  it('triggers Google sign-in from the real auth UI boundary', async () => {
    const user = userEvent.setup()

    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: /continue with google/i }))

    expect(authMock.value.signInWithGoogle).toHaveBeenCalledTimes(1)
  })
})
