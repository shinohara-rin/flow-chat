import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMessagesStore } from './messages'

export const useImagesStore = defineStore('images', () => {
  const image = ref('')
  const messagesStore = useMessagesStore()

  function setImage(newImage: string) {
    image.value = newImage
  }

  async function appendImageToMessage(messageId: string, imageBase64: string) {
    setImage(imageBase64)
    const markdown = `![generated image](data:image/png;base64,${imageBase64})`
    await messagesStore.appendContent(messageId, markdown)
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
    appendImageToMessage,
    clearImage,
    resetState,
  }
})
