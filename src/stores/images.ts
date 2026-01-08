import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImagesStore = defineStore('images', () => {
  const image = ref('')

  function setImage(newImage: string) {
    image.value = newImage
  }

  function clearImage() {
    image.value = ''
  }

  function resetState() {
    image.value = ''
  }

  return {
    image,
    setImage,
    clearImage,
    resetState,
  }
})
