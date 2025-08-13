import { MeiliSearch } from 'meilisearch'

let client: MeiliSearch | null = null

export function getSearchClient() {
  if (client) return client
  const host = process.env.MEILI_HOST
  const apiKey = process.env.MEILI_API_KEY
  if (!host || !apiKey) return null
  client = new MeiliSearch({ host, apiKey })
  return client
}

export async function ensureIndex(name: string) {
  const search = getSearchClient()
  if (!search) throw new Error('MEILI_HOST or MEILI_API_KEY is not set')
  try {
    await search.getIndex(name)
  } catch {
    await search.createIndex(name)
  }
}

export default getSearchClient
