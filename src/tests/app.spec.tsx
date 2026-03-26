import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('App', () => {
  it('renders the Forge shell and primary navigation', () => {
    render(<App />)

    expect(screen.getByText('Forge')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /what should i do now/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /schedule/i }).length).toBeGreaterThan(0)
  })

  it('does not keep the Today nav link marked as current after navigating away from root', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getAllByRole('link', { name: /schedule/i })[0])

    expect(screen.getByRole('heading', { name: /fixed routine, visible at a glance/i })).toBeInTheDocument()

    screen.getAllByRole('link', { name: /^today$/i }).forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current', 'page')
    })
  })
})
