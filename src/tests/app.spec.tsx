import { render, screen } from '@testing-library/react'
import App from '@/App'

describe('App', () => {
  it('renders the Forge shell and primary navigation', () => {
    render(<App />)

    expect(screen.getByText('Forge')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /what should i do now/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /schedule/i }).length).toBeGreaterThan(0)
  })
})
