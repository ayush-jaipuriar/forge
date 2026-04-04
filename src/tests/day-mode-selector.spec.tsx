import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '@/app/providers/AppProviders'
import { DayModeSelector } from '@/features/today/components/DayModeSelector'

describe('DayModeSelector', () => {
  it('marks the active mode as pressed and keeps it focusable without re-submitting it', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <AppProviders>
        <DayModeSelector activeDayMode="normal" onSelect={onSelect} />
      </AppProviders>,
    )

    const normalButton = screen.getByRole('button', { name: 'Normal' })
    const survivalButton = screen.getByRole('button', { name: 'Survival' })

    expect(normalButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('group', { name: /day mode selector/i })).toBeInTheDocument()

    await user.click(survivalButton)
    await user.click(normalButton)

    expect(onSelect).toHaveBeenCalledWith('survival')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
