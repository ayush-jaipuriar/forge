import type { PropsWithChildren } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query/queryClient'
import { forgeTheme } from '@/app/theme/theme'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={forgeTheme}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
