import { MeiliSearch } from "meilisearch";
import type { Story } from "@prisma/client";
import type { Index } from "meilisearch";

type SearchResult = Awaited<ReturnType<Index["search"]>>;

const indexName = process.env.MEILI_INDEX_STORIES || "stories";

function getClient() {
  const host = process.env.MEILI_HOST;
  if (!host) return null;
  return new MeiliSearch({
    host,
    apiKey: process.env.MEILI_API_KEY,
  });
}

export async function ensureStoryIndex(): Promise<Index | null> {
  const client = getClient();
  if (!client) return null;
  await client.createIndex(indexName, { primaryKey: "id" }).catch(() => {});
  const index = client.index(indexName);
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
  if (!index) return;
  await index.addDocuments([
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

export async function searchStories(q: string): Promise<SearchResult> {
  const index = await ensureStoryIndex();
  if (!index) return { hits: [] } as SearchResult;
  return index.search(q, { limit: 10 });
}
