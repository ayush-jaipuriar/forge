import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import type { AuthSessionValue } from '@/features/auth/types/auth'

const authMock = vi.hoisted(() => ({
  value: {
    status: 'unauthenticated',
    flowPhase: 'idle',
    user: null,
    errorMessage: null,
    signInWithGoogle: vi.fn(async () => {}),
    signInAsGuest: vi.fn(async () => {}),
    signOutUser: vi.fn(async () => {}),
  } as AuthSessionValue,
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
      flowPhase: 'idle',
      user: null,
      errorMessage: null,
      signInWithGoogle: vi.fn(async () => {}),
      signInAsGuest: vi.fn(async () => {}),
      signOutUser: vi.fn(async () => {}),
    } as AuthSessionValue
  })

  it('triggers Google sign-in from the real auth UI boundary', async () => {
    const user = userEvent.setup()

    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: /continue with google/i }))

    expect(authMock.value.signInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('lets visitors start a guest workspace from the auth page', async () => {
    const user = userEvent.setup()

    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: /try demo workspace/i }))

    expect(authMock.value.signInAsGuest).toHaveBeenCalledTimes(1)
  })

  it('keeps the sign-in button in a compact connecting state while auth is busy', () => {
    authMock.value = {
      ...authMock.value,
      status: 'checking',
      flowPhase: 'redirecting',
    } as AuthSessionValue

    const { rerender } = render(<AuthPage />)

    expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled()

    authMock.value = {
      ...authMock.value,
      status: 'checking',
      flowPhase: 'returning',
    } as AuthSessionValue

    rerender(<AuthPage />)

    expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled()
  })

  it('surfaces a concise missing-config warning without enabling sign-in', () => {
    authMock.value = {
      ...authMock.value,
      status: 'missing_config',
      errorMessage: 'Firebase configuration is incomplete.',
    } as AuthSessionValue

    render(<AuthPage />)

    expect(screen.getByText(/missing firebase config in local/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled()
  })
})
