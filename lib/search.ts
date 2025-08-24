import { MeiliSearch, type Index } from "meilisearch";
import type { Story } from "@prisma/client";

const client = new MeiliSearch({
  host: process.env.MEILI_HOST!,
  apiKey: process.env.MEILI_API_KEY,
});
const indexName = process.env.MEILI_INDEX_STORIES || "stories";

export async function ensureStoryIndex(): Promise<Index> {
  let index: Index;
  try {
    index = await client.getIndex(indexName);
  } catch {
    await client.createIndex(indexName, { primaryKey: "id" });
    index = await client.getIndex(indexName);
  }
  await index.updateSettings({
    searchableAttributes: ["title", "description", "tags"],
    filterableAttributes: ["ageMin", "ageMax", "status"],
    sortableAttributes: ["publishedAt"],
  });
  return index;
}

export async function upsertStoryIndex(
  s: Story & { body?: { html: string | null } | null },
) {
  try {
    const index = await ensureStoryIndex();
    return index.addDocuments([
      {
        id: s.id,
        slug: s.slug,
        title: s.title,
        description: s.description,
        tags: s.tags,
        ageMin: s.ageMin,
        ageMax: s.ageMax,
        status: s.status,
        publishedAt: s.publishedAt,
      },
    ]);
  } catch {
    return;
  }
}

export async function searchStories(q: string) {
  try {
    const index = await ensureStoryIndex();
    return index.search(q, { limit: 10 });
  } catch {
    return { hits: [] } as { hits: unknown[] };
  }
}
