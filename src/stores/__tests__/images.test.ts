import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useImagesStore } from '../images'

describe('Images Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty image', () => {
    const imagesStore = useImagesStore()
    expect(imagesStore.image).toBe('')
  })

  it('sets image', () => {
    const imagesStore = useImagesStore()
    imagesStore.setImage('test-image-data')
    expect(imagesStore.image).toBe('test-image-data')
  })

  it('clears image', () => {
    const imagesStore = useImagesStore()
    imagesStore.setImage('test-image-data')
    imagesStore.clearImage()
    expect(imagesStore.image).toBe('')
  })

  it('resets state', () => {
    const imagesStore = useImagesStore()
    imagesStore.setImage('test-image-data')
    imagesStore.resetState()
    expect(imagesStore.image).toBe('')
  })
})
