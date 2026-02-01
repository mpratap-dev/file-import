import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div data-testid="card-content">Content</div>
      </Card>
    )
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('custom-class')
    expect(card).toHaveClass('rounded-xl') // Base class
  })
})
