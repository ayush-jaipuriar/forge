import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '@/app/providers/AppProviders'
import { SignalToggleGroup } from '@/features/today/components/SignalToggleGroup'

describe('SignalToggleGroup', () => {
  it('exposes grouped toggle semantics and avoids re-submitting the current value', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <AppProviders>
        <SignalToggleGroup
          label="Energy"
          value="normal"
          options={[
            { value: 'unknown', label: 'Unknown' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
          ]}
          onSelect={onSelect}
        />
      </AppProviders>,
    )

    const normalButton = screen.getByRole('button', { name: 'Normal' })
    const highButton = screen.getByRole('button', { name: 'High' })

    expect(screen.getByRole('group', { name: /energy/i })).toBeInTheDocument()
    expect(normalButton).toHaveAttribute('aria-pressed', 'true')

    await user.click(normalButton)
    await user.click(highButton)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('high')
  })
})
