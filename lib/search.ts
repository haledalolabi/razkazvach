import { MeiliSearch } from "meilisearch";
import type { Index } from "meilisearch";
import type { Story } from "@prisma/client";

let client: MeiliSearch | null = null;

function getClient() {
  const host = process.env.MEILI_HOST;
  if (!host) return null;
  if (client) return client;
  try {
    client = new MeiliSearch({
      host,
      apiKey: process.env.MEILI_API_KEY,
    });
    return client;
  } catch {
    client = null;
    return null;
  }
}
const indexName = process.env.MEILI_INDEX_STORIES || "stories";

export async function ensureStoryIndex(): Promise<Index<
  Record<string, unknown>
> | null> {
  const meiliClient = getClient();
  if (!meiliClient) return null;
  await meiliClient
    .createIndex(indexName, { primaryKey: "id" })
    .catch(() => {});
  const index = meiliClient.index(indexName);
  await index
    .updateSettings({
      searchableAttributes: ["title", "description", "tags"],
      filterableAttributes: ["ageMin", "ageMax", "status"],
      sortableAttributes: ["publishedAt"],
    })
    .catch(() => {});
  return index as Index<Record<string, unknown>>;
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

export async function searchStories(q: string) {
  try {
    const index = await ensureStoryIndex();
    if (!index) return { hits: [] };
    return await index.search(q, { limit: 10 });
  } catch {
    return { hits: [] };
  }
}
