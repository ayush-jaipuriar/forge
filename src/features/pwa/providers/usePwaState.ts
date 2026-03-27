import { useContext } from 'react'
import { PwaContext } from '@/features/pwa/providers/pwaContext'

export function usePwaState() {
  const context = useContext(PwaContext)

  if (!context) {
    throw new Error('usePwaState must be used within a PwaProvider')
  }

  return context
}
