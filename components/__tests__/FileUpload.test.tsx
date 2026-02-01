import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { FileUpload } from '../FileUpload'
import { getPresignedUrl } from '@/app/actions'
import { useDropzone } from 'react-dropzone'

// Mock the server action
jest.mock('@/app/actions', () => ({
  getPresignedUrl: jest.fn(),
}))

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('FileUpload', () => {
  const mockGetPresignedUrl = getPresignedUrl as jest.Mock
  const mockUseDropzone = useDropzone as jest.Mock
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementation
    mockUseDropzone.mockImplementation(({ onDrop }) => ({
        getRootProps: jest.fn().mockImplementation((props) => props),
        getInputProps: jest.fn().mockImplementation(() => ({
            onChange: (e: any) => {
                // Simulate file drop/selection
               if (e.target.files && e.target.files.length > 0) {
                   onDrop(Array.from(e.target.files))
               }
            }
        })),
        isDragActive: false,
    }))
  })

  it('renders initial state correctly', () => {
    render(<FileUpload />)
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument()
    expect(screen.queryByText(/upload file/i)).not.toBeInTheDocument()
  })

  it('handles file selection', async () => {
    render(<FileUpload />)
    
    // Trigger onDrop via input change (simulated by our mock)
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = document.querySelector('input')
    
    // Since we mocked getInputProps, we might not find 'input' easily if we didn't render it correctly? 
    // Wait, getInputProps returns props for <input>. <input {...getInputProps()} />
    // Our mock implementation needs to work.
    
    // Actually, calling onDrop directly is easier if we export it or capture it from useDropzone calls?
    // But testing the interaction is better.
    
    // Let's rely on the mock implementation above.
    const { onDrop } = mockUseDropzone.mock.calls[0][0]
    act(() => {
        onDrop([file])
    })

    await waitFor(() => {
      expect(screen.getByText('hello.png')).toBeInTheDocument()
    })
    
    expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument()
  })

  it('ignores empty file selection', async () => {
    render(<FileUpload />)
    const { onDrop } = mockUseDropzone.mock.calls[0][0]
    
    act(() => {
      onDrop([])
    })
    
    // Should stay in idle state (drag & drop text visible)
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument()
    expect(screen.queryByText(/upload file/i)).not.toBeInTheDocument()
  })

  it('uploads file successfully', async () => {
    mockGetPresignedUrl.mockResolvedValue({ success: true, url: 'https://upload.url' });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true })

    render(<FileUpload />)
    
    const { onDrop } = mockUseDropzone.mock.calls[0][0]
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    act(() => {
        onDrop([file])
    })

    await waitFor(() => {
      expect(screen.getByText('hello.png')).toBeInTheDocument()
    })

    const uploadButton = screen.getByRole('button', { name: /upload file/i })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /uploading/i })).toBeInTheDocument()
    })
    
    expect(mockGetPresignedUrl).toHaveBeenCalledWith('hello.png', 'image/png')
    
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://upload.url', expect.objectContaining({
            method: 'PUT',
            body: file
        }))
    })

    await waitFor(() => {
      expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument()
    })
  })

  it('handles error during upload', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetPresignedUrl.mockResolvedValue({ success: false, error: 'Failed' })
    
    render(<FileUpload />)
    
    const { onDrop } = mockUseDropzone.mock.calls[0][0]
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    act(() => {
        onDrop([file])
    })

    await waitFor(() => {
      expect(screen.getByText('hello.png')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /upload file/i }))

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('handles S3 upload failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetPresignedUrl.mockResolvedValue({ success: true, url: 'https://upload.url' });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false })

    render(<FileUpload />)
    
    const { onDrop } = mockUseDropzone.mock.calls[0][0]
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    act(() => {
        onDrop([file])
    })

    await waitFor(() => {
      expect(screen.getByText('hello.png')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /upload file/i }))

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('resets state after successful upload', async () => {
    jest.useFakeTimers()
    mockGetPresignedUrl.mockResolvedValue({ success: true, url: 'https://upload.url' });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true })

    render(<FileUpload />)
    
    const { onDrop } = mockUseDropzone.mock.calls[0][0]
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    act(() => {
        onDrop([file])
    })
    
    await waitFor(() => expect(screen.getByText('hello.png')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /upload file/i }))

    await waitFor(() => {
      expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument()
    })

    // Fast-forward time
    act(() => {
        jest.advanceTimersByTime(3000)
    })

    // Check reset state
    await waitFor(() => {
      expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })

  it('shows active drag state', () => {
    mockUseDropzone.mockReturnValue({
        getRootProps: jest.fn().mockImplementation((props) => props),
        getInputProps: jest.fn(),
        isDragActive: true,
    })

    render(<FileUpload />)
    
    // Check for element with active styles
    const activeElement = document.querySelector('.border-blue-500')
    expect(activeElement).toBeInTheDocument()
  })

  it('handles upload failure with default message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    // Mock success false but no error message
    mockGetPresignedUrl.mockResolvedValue({ success: false }) 
    
    render(<FileUpload />)
    
    const { onDrop } = mockUseDropzone.mock.calls[0][0]
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    onDrop([file])

    await waitFor(() => {
      expect(screen.getByText('hello.png')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /upload file/i }))

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
