import { createContext } from 'react'
import type { AuthSessionValue } from '@/features/auth/types/auth'

export const AuthSessionContext = createContext<AuthSessionValue | null>(null)
