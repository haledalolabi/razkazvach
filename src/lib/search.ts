import { MeiliSearch } from 'meilisearch'

export const searchClient = new MeiliSearch({
  host: process.env.MEILI_HOST!,
  apiKey: process.env.MEILI_API_KEY!,
})

export async function ensureIndex(name: string) {
  try {
    await searchClient.getIndex(name)
  } catch {
    await searchClient.createIndex(name)
  }
}

export default searchClient
