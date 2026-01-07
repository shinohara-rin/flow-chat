import { generateImage } from '@xsai/generate-image'
import { describe, expect, it, vi } from 'vitest'
import { createImageTools } from './image'

vi.mock('@xsai/generate-image', () => ({
  generateImage: vi.fn(),
}))

vi.mock('~/stores/messages', () => ({
  useMessagesStore: vi.fn(),
}))

vi.mock('~/models/tool-calls', () => ({
  useToolCallModel: vi.fn(() => ({
    create: vi.fn().mockResolvedValue({ id: 'test-tool-call-id' }),
    updateResult: vi.fn(),
  })),
}))

describe('createImageTools', () => {
  it('should handle error when generateImage fails', async () => {
    const mockGenerateImage = vi.mocked(generateImage)
    mockGenerateImage.mockRejectedValue(new Error('API Error'))

    const mockPiniaStore = {
      appendContent: vi.fn(),
    } as any

    const tools = await createImageTools({
      apiKey: 'test-key',
      baseURL: 'http://test-url',
      piniaStore: mockPiniaStore,
      messageId: 'test-message-id',
    })

    const generateImageTool = tools[0]
    const result = await generateImageTool.execute({ prompt: 'test prompt' })

    expect(result).toEqual({
      message: 'Error generating image: API Error',
    })
  })

  it('should return image base64 on success', async () => {
    const mockGenerateImage = vi.mocked(generateImage)
    mockGenerateImage.mockResolvedValue({
      image: { base64: 'fake-base64-image' },
    } as any)

    const mockPiniaStore = {
      appendContent: vi.fn(),
    } as any

    const tools = await createImageTools({
      apiKey: 'test-key',
      baseURL: 'http://test-url',
      piniaStore: mockPiniaStore,
      messageId: 'test-message-id',
    })

    const generateImageTool = tools[0]
    const result = await generateImageTool.execute({ prompt: 'test prompt' })

    expect(result).toEqual({
      message: 'Image generated successfully',
      imageBase64: 'fake-base64-image',
    })
  })
})
