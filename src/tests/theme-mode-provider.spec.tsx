import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@mui/material'
import { ThemeModeProvider } from '@/app/theme/ThemeModeProvider'
import { useThemeMode } from '@/app/theme/themeModeContext'

function ThemeProbe() {
  const { mode, setMode } = useThemeMode()

  return (
    <div>
      <span>Mode: {mode}</span>
      <Button onClick={() => setMode('light')}>Use light</Button>
      <Button onClick={() => setMode('dark')}>Use dark</Button>
    </div>
  )
}

describe('ThemeModeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-forge-theme')
  })

  it('defaults to dark mode when no local preference exists', () => {
    render(
      <ThemeModeProvider>
        <ThemeProbe />
      </ThemeModeProvider>,
    )

    expect(screen.getByText('Mode: dark')).toBeInTheDocument()
    expect(document.documentElement.dataset.forgeTheme).toBe('dark')
  })

  it('persists the selected local appearance mode', async () => {
    const user = userEvent.setup()

    render(
      <ThemeModeProvider>
        <ThemeProbe />
      </ThemeModeProvider>,
    )

    await user.click(screen.getByRole('button', { name: /use light/i }))

    expect(screen.getByText('Mode: light')).toBeInTheDocument()
    expect(window.localStorage.getItem('forge-theme-mode')).toBe('light')
    expect(document.documentElement.dataset.forgeTheme).toBe('light')
  })

  it('ignores invalid stored values', () => {
    window.localStorage.setItem('forge-theme-mode', 'sepia')

    render(
      <ThemeModeProvider>
        <ThemeProbe />
      </ThemeModeProvider>,
    )

    expect(screen.getByText('Mode: dark')).toBeInTheDocument()
  })
})
