export interface Template {
  id: string
  name: string
  system_prompt: string
  temperature: number | null
  top_p: number | null
  max_tokens: number | null
  presence_penalty: number | null
  frequency_penalty: number | null
  created_at: Date
  updated_at: Date
}
