import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createForgeTheme } from '@/app/theme/theme'
import type { ForgeThemeMode } from '@/app/theme/tokens'
import { ThemeModeContext, type ThemeModeContextValue } from '@/app/theme/themeModeContext'

const THEME_MODE_STORAGE_KEY = 'forge-theme-mode'

function isForgeThemeMode(value: string | null): value is ForgeThemeMode {
  return value === 'dark' || value === 'light'
}

function getStoredThemeMode(): ForgeThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  try {
    const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)
    return isForgeThemeMode(storedMode) ? storedMode : 'dark'
  } catch {
    return 'dark'
  }
}

export function ThemeModeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ForgeThemeMode>(() => getStoredThemeMode())

  const theme = useMemo(() => createForgeTheme(mode), [mode])

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      setMode: (nextMode) => setModeState(nextMode),
    }),
    [mode],
  )

  useEffect(() => {
    document.documentElement.dataset.forgeTheme = mode

    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode)
    } catch {
      // Appearance is a local preference; failing to persist should not block the app.
    }
  }, [mode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
