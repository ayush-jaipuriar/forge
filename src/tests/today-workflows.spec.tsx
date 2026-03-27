import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '@/app/providers/AppProviders'
import { BlockNoteComposer } from '@/features/today/components/BlockNoteComposer'
import { FallbackModeSuggestionCard } from '@/features/today/components/FallbackModeSuggestionCard'

describe('Today workflows', () => {
  it('lets the operator apply an explicit fallback suggestion', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onDismiss = vi.fn()

    render(
      <AppProviders>
        <FallbackModeSuggestionCard
          suggestion={{
            suggestedDayMode: 'lowEnergy',
            title: 'Shift into Low Energy mode',
            rationale: 'A reduced execution posture is more honest than forcing the original load.',
            explanation: 'Low energy under a full-load mode should trigger an explicit fallback suggestion.',
            urgency: 'high',
          }}
          currentModeLabel="Normal Mode"
          onApply={onApply}
          onDismiss={onDismiss}
        />
      </AppProviders>,
    )

    await user.click(screen.getByRole('button', { name: /apply low energy mode/i }))

    expect(onApply).toHaveBeenCalledWith('lowEnergy')
  })

  it('captures a lightweight execution note without forcing a heavy form', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const note = 'Meeting overran. Resume with a 30-minute push.'

    render(<BlockNoteComposer onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: /add note/i }))
    fireEvent.change(screen.getByLabelText('Execution note'), {
      target: { value: note },
    })
    await user.click(screen.getByRole('button', { name: /save note/i }))

    expect(onSave).toHaveBeenCalledWith(note)
  })
})
