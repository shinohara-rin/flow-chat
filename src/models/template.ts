import { eq } from 'drizzle-orm'
import { useDatabaseStore } from '~/stores/database'
import * as schema from '../../db/schema'

export function useTemplateModel() {
  const dbStore = useDatabaseStore()

  async function create(
    name: string,
    systemPrompt: string,
    options: {
      temperature?: number
      top_p?: number
      max_tokens?: number
      presence_penalty?: number
      frequency_penalty?: number
    } = {},
  ) {
    const created = await dbStore.withCheckpoint((db) => {
      return db
        .insert(schema.templates)
        .values({
          name,
          system_prompt: systemPrompt,
          ...options,
        })
        .returning({ id: schema.templates.id })
    })

    return created[0]
  }

  function update(
    id: string,
    name: string,
    systemPrompt: string,
    options: {
      temperature?: number
      top_p?: number
      max_tokens?: number
      presence_penalty?: number
      frequency_penalty?: number
    } = {},
  ) {
    return dbStore.withCheckpoint((db) => {
      return db.update(schema.templates).set({
        name,
        system_prompt: systemPrompt,
        ...options,
      }).where(eq(schema.templates.id, id))
    })
  }

  function destroy(id: string) {
    return dbStore.withCheckpoint((db) => {
      return db.delete(schema.templates).where(eq(schema.templates.id, id))
    })
  }

  async function getById(id: string) {
    return (await dbStore.db().select().from(schema.templates).where(eq(schema.templates.id, id)))[0]
  }

  function getAll() {
    return dbStore.db().select().from(schema.templates)
  }

  return {
    create,
    update,
    destroy,
    getById,
    getAll,
  }
}
