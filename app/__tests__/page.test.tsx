import { render, screen } from '@testing-library/react'
import Home from '../page'

// Mock the FileUpload component to isolate testing
jest.mock('@/components/FileUpload', () => ({
  FileUpload: () => <div data-testid="file-upload">File Upload Component</div>,
}))

describe('Home Page', () => {
  it('renders title and description', () => {
    render(<Home />)
    expect(screen.getByText('File Import Service')).toBeInTheDocument()
    expect(screen.getByText(/Securely upload your files/i)).toBeInTheDocument()
  })

  it('renders FileUpload component', () => {
    render(<Home />)
    expect(screen.getByTestId('file-upload')).toBeInTheDocument()
  })

  it('renders copyright', () => {
    render(<Home />)
    expect(screen.getByText(/File Import Service using/i)).toBeInTheDocument()
  })
})
