import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('To get started, edit the page.tsx file.')
  })

  it('renders "Deploy Now" link', () => {
    render(<Home />)
    const link = screen.getByText('Deploy Now')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', expect.stringContaining('vercel.com/new'))
  })

  it('renders "Documentation" link', () => {
    render(<Home />)
    const link = screen.getByText('Documentation')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', expect.stringContaining('nextjs.org/docs'))
  })
})
