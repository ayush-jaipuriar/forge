import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { initializeForgeAppCheck } from '@/lib/firebase/appCheck'

export function FirebaseSecurityProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    initializeForgeAppCheck()
  }, [])

  return children
}
