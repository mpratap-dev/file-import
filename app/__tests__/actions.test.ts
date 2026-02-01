import { getPresignedUrl } from '../actions'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Mock the AWS SDK modules
jest.mock('@aws-sdk/client-s3')
jest.mock('@aws-sdk/s3-request-presigner')

describe('getPresignedUrl', () => {
  const mockGetSignedUrl = getSignedUrl as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_ACCESS_KEY_ID = 'test-key'
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
    process.env.AWS_BUCKET_NAME = 'test-bucket'
  })

  it('returns success and signed url when successful', async () => {
    const mockUrl = 'https://s3.example.com/upload-url'
    mockGetSignedUrl.mockResolvedValue(mockUrl)

    const result = await getPresignedUrl('test.txt', 'text/plain')

    expect(result).toEqual({ success: true, url: mockUrl })
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'test.txt',
      ContentType: 'text/plain',
    })
    expect(getSignedUrl).toHaveBeenCalled()
  })

  it('returns error when generation fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetSignedUrl.mockRejectedValue(new Error('AWS Error'))

    const result = await getPresignedUrl('test.txt', 'text/plain')

    expect(result).toEqual({ success: false, error: 'Failed to generate upload URL' })
    expect(consoleSpy).toHaveBeenCalledWith('Error generating presigned URL:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
