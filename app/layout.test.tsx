import { render, screen } from '@testing-library/react'
import RootLayout from './layout'

describe('RootLayout', () => {
  it('renders children', () => {
    // Basic test to ensure it renders the passed children
    render(
      <RootLayout>
        <div data-testid="child">Child Content</div>
      </RootLayout>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
