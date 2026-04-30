import { createContext, useContext } from 'react'
import type { ForgeThemeMode } from '@/app/theme/tokens'

export type ThemeModeContextValue = {
  mode: ForgeThemeMode
  setMode: (mode: ForgeThemeMode) => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

export function useThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeModeProvider')
  }

  return context
}
