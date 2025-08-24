import { MeiliSearch } from "meilisearch";
import type { Story } from "@prisma/client";

const client = new MeiliSearch({
  host: process.env.MEILI_HOST!,
  apiKey: process.env.MEILI_API_KEY,
});
const indexName = process.env.MEILI_INDEX_STORIES || "stories";

export async function ensureStoryIndex() {
  const index = await client
    .getIndex(indexName)
    .catch(() => client.createIndex(indexName, { primaryKey: "id" }));
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
}

export async function searchStories(q: string) {
  const index = await ensureStoryIndex();
  return index.search(q, { limit: 10 });
}
