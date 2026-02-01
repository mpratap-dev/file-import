import { render, screen } from '@testing-library/react'
import RootLayout from '../layout'

describe('RootLayout', () => {
  it('renders children', () => {
    // Silence the expected "<html> cannot be a child of <div>" warning
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string' && msg.includes('cannot be a child of')) return
      console.error(msg)
    })

    // Basic test to ensure it renders the passed children
    render(
      <RootLayout>
        <div data-testid="child">Child Content</div>
      </RootLayout>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})
