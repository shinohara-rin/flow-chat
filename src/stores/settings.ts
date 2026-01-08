import type { Model } from 'xsai'
import type { ModelInfo, Provider } from '~/types/settings'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { listModels } from 'xsai'

export const useSettingsStore = defineStore('settings', () => {
  const imageGeneration = useLocalStorage('settings/imageGeneration', {
    apiKey: '',
    baseURL: '',
    model: '',
  })

  const modelsDevData = ref<any>(null)

  const configuredTextProviders = useLocalStorage<Provider[]>('settings/configuredTextProviders', [])
  const configuredImageProviders = useLocalStorage<Provider[]>('settings/configuredImageProviders', [])
  const defaultTextModel = useLocalStorage<ModelInfo>('settings/defaultTextModel', {
    provider: '',
    model: '',
  })
  const defaultImageModel = useLocalStorage<ModelInfo>('settings/defaultImageModel', {
    provider: '',
    model: '',
  })
  const summaryTextModel = useLocalStorage<ModelInfo>('settings/summaryTextModel', {
    provider: '',
    model: '',
  })

  const currentProvider = computed(() => {
    return configuredTextProviders.value.find(p => p.name === defaultTextModel.value.provider)
  })

  const defaultTemplateId = useLocalStorage('settings/defaultTemplateId', '')
  const models = ref<Model[]>([])
  const modelsProvider = ref('')
  const isLoadingModels = ref(false)

  async function fetchModelsDevData() {
    try {
      const response = await fetch('https://models.dev/api.json')
      if (!response.ok)
        throw new Error('Failed to fetch models.dev data')
      modelsDevData.value = await response.json()
    }
    catch (error) {
      console.error('Failed to fetch models.dev data:', error)
    }
  }

  function getCapabilities(modelId: string) {
    if (!modelsDevData.value) {
      return undefined
    }

    // Try to find the model in the fetched data
    // Data structure: { [providerId: string]: { models: { [modelId: string]: ModelData } } }
    let foundModel: any = null

    // Search all providers for the model ID
    for (const providerKey in modelsDevData.value) {
      const providerData = modelsDevData.value[providerKey]
      if (providerData.models && providerData.models[modelId]) {
        foundModel = providerData.models[modelId]
        break
      }
    }

    if (foundModel) {
      return {
        toolCall: foundModel.tool_call,
        reasoning: foundModel.reasoning,
      }
    }
    return undefined
  }

  const defaultModelCapabilities = computed(() => {
    return getCapabilities(defaultTextModel.value.model)
  })

  // Auto-fetch data on init
  fetchModelsDevData()

  // Fetch available models
  async function fetchModels(providerName?: string) {
    // API key is not required for public models
    const providerToUse = providerName ?? defaultTextModel.value.provider
    const provider = configuredTextProviders.value.find(p => p.name === providerToUse)
    if (!provider) {
      console.error('Provider not found when fetching models')
      return
    }

    isLoadingModels.value = true
    try {
      models.value = await listModels({
        apiKey: provider.apiKey,
        baseURL: provider.baseURL,
      })
      modelsProvider.value = providerToUse
    }
    catch (error) {
      console.error('Failed to fetch models:', error)
    }
    finally {
      isLoadingModels.value = false
    }
  }

  return {
    currentProvider,
    configuredTextProviders,
    configuredImageProviders,
    defaultTextModel,
    defaultImageModel, // TODO: sort keys
    summaryTextModel,
    imageGeneration,
    defaultTemplateId,
    models,
    modelsProvider,
    isLoadingModels,
    fetchModels,
    getCapabilities,
    defaultModelCapabilities,
  }
})
