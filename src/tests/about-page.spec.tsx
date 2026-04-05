import { render, screen } from '@testing-library/react'
import { AboutPage } from '@/features/about/pages/AboutPage'

describe('AboutPage', () => {
  it('renders the project background, developer block, and external links', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { name: /forge exists to make disciplined execution easier to sustain/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /the project started as a way to make real execution easier to trust/i })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /^ayush jaipuriar$/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/ayush-jaipuriar/')
    expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', 'https://ayush-jaipuriar.github.io/Personal-Portfolio/about')
    expect(screen.getByText(/made with love by ayush jaipuriar for disciplined execution/i)).toBeInTheDocument()
  })
})
