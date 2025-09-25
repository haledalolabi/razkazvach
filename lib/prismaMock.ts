import { randomUUID } from "crypto";
import type { PrismaClient } from "@prisma/client";

type StoryBody = {
  storyId: string;
  html: string;
  lang: string;
  readingTimeSec?: number | null;
};

type MockStory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  ageMin: number;
  ageMax: number;
  isInteractive: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  body: StoryBody | null;
  audioId: string | null;
  interactiveNodeIds: string[];
};

type StoryInclude = {
  body?: boolean;
  audio?: boolean;
  interactiveNodes?: {
    include?: {
      choices?: boolean;
      incoming?: boolean;
    };
  };
};

type UpsertArgs = {
  where: { slug?: string; id?: string };
  create: Record<string, unknown>;
  update: Record<string, unknown>;
  include?: StoryInclude;
};

type FindUniqueArgs = {
  where: { slug?: string; id?: string };
  include?: StoryInclude;
};

type FindManyArgs = {
  where?: { status?: string };
  include?: StoryInclude;
  orderBy?: { publishedAt?: "asc" | "desc" };
};

type FindFirstArgs = FindManyArgs;

type DeleteManyArgs = {
  where?: { storyId?: string };
};

type MockInteractiveNode = {
  id: string;
  storyId: string;
  title: string;
  bodyHtml: string;
};

type MockInteractiveChoice = {
  id: string;
  fromNodeId: string;
  label: string;
  toNodeId: string;
};

type FreeRotationRecord = {
  storyId: string;
  monthKey: string;
  priority: number;
};

type AudioAsset = {
  id: string;
  storyId: string;
  url: string;
  voice?: string | null;
  quality?: string | null;
  durationSec?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type SubscriptionRecord = {
  userId: string;
  status: string;
};

function cloneStory(
  story: MockStory,
  include?: StoryInclude,
  helpers?: {
    fetchAudio: (id: string | null) => AudioAsset | null;
    fetchInteractiveNodes: (
      storyId: string,
      include?: StoryInclude["interactiveNodes"],
    ) => unknown;
  },
) {
  const clone: Record<string, unknown> = {
    ...story,
  };

  if (include?.body) {
    clone.body = story.body ? { ...story.body } : null;
  } else {
    delete clone.body;
  }

  if (include?.audio) {
    clone.audio = helpers?.fetchAudio(story.audioId ?? null) ?? null;
  } else {
    delete clone.audio;
  }

  if (include?.interactiveNodes) {
    clone.interactiveNodes = helpers?.fetchInteractiveNodes(
      story.id,
      include.interactiveNodes,
    );
  }

  return clone;
}

function storyMatches(story: MockStory, where?: FindManyArgs["where"]) {
  if (!where) return true;
  if (where.status && story.status !== where.status) return false;
  return true;
}

export function createMockPrisma(): PrismaClient {
  const storiesBySlug = new Map<string, MockStory>();
  const storiesById = new Map<string, MockStory>();
  const interactiveNodes = new Map<string, MockInteractiveNode>();
  const interactiveNodeIdsByStory = new Map<string, string[]>();
  const interactiveChoices = new Map<string, MockInteractiveChoice>();
  const choicesByFromNode = new Map<string, string[]>();
  const choicesByToNode = new Map<string, string[]>();
  const freeRotations = new Map<string, FreeRotationRecord>();
  const audioAssets = new Map<string, AudioAsset>();
  const subscriptions = new Map<string, SubscriptionRecord>();

  function fetchAudio(id: string | null): AudioAsset | null {
    if (!id) return null;
    const asset = audioAssets.get(id);
    return asset ? { ...asset } : null;
  }

  function fetchInteractiveNodes(
    storyId: string,
    include?: StoryInclude["interactiveNodes"],
  ) {
    const nodeIds = interactiveNodeIdsByStory.get(storyId) ?? [];
    return nodeIds
      .map((id) => {
        const node = interactiveNodes.get(id);
        if (!node) return null;
        const base = { ...node } as Record<string, unknown>;
        if (include?.include?.choices) {
          const choiceIds = choicesByFromNode.get(id) ?? [];
          base.choices = choiceIds
            .map((choiceId) => interactiveChoices.get(choiceId))
            .filter(Boolean)
            .map((choice) => ({ ...choice! }));
        }
        if (include?.include?.incoming) {
          const incomingIds = choicesByToNode.get(id) ?? [];
          base.incoming = incomingIds
            .map((choiceId) => interactiveChoices.get(choiceId))
            .filter(Boolean)
            .map((choice) => ({ ...choice! }));
        }
        return base;
      })
      .filter(Boolean);
  }

  function resolveStory(story: MockStory | undefined, include?: StoryInclude) {
    if (!story) return null;
    return cloneStory(story, include, {
      fetchAudio,
      fetchInteractiveNodes,
    });
  }

  function extractSlug(args: { slug?: string; id?: string }) {
    return args.slug ?? null;
  }

  function extractId(args: { slug?: string; id?: string }) {
    return args.id ?? null;
  }

  function getBodyFromCreate(input: Record<string, unknown>, storyId: string) {
    const body = (input as { body?: { create?: StoryBody } }).body;
    if (body?.create) {
      return { ...body.create, storyId };
    }
    return null;
  }

  function applyBodyUpdate(story: MockStory, update: Record<string, unknown>) {
    const body = (
      update as {
        body?: {
          upsert?: { update?: StoryBody; create?: StoryBody };
          create?: StoryBody;
        };
      }
    ).body;
    if (!body) return story.body;

    if ("upsert" in body && body.upsert) {
      if (story.body && body.upsert.update) {
        story.body = { ...story.body, ...body.upsert.update };
      } else if (!story.body && body.upsert.create) {
        story.body = { ...body.upsert.create, storyId: story.id };
      }
    } else if ("create" in body && body.create) {
      story.body = { ...body.create, storyId: story.id };
    }
    return story.body;
  }

  function upsertAudio(storyId: string, data: Record<string, unknown>) {
    const existing = Array.from(audioAssets.values()).find(
      (asset) => asset.storyId === storyId,
    );
    const now = new Date();
    if (existing) {
      const updated = {
        ...existing,
        url: (data as { url?: string }).url ?? existing.url,
        voice: (data as { voice?: string | null }).voice ?? existing.voice,
        quality:
          (data as { quality?: string | null }).quality ?? existing.quality,
        durationSec:
          (data as { durationSec?: number | null }).durationSec ??
          existing.durationSec,
        updatedAt: now,
      };
      audioAssets.set(existing.id, updated);
      return updated;
    }
    const created: AudioAsset = {
      id: randomUUID(),
      storyId,
      url: (data as { url?: string }).url ?? "",
      voice: (data as { voice?: string | null }).voice ?? null,
      quality: (data as { quality?: string | null }).quality ?? null,
      durationSec:
        (data as { durationSec?: number | null }).durationSec ?? null,
      createdAt: now,
      updatedAt: now,
    };
    audioAssets.set(created.id, created);
    return created;
  }

  const story = {
    async findUnique(args: FindUniqueArgs) {
      const slug = args.where.slug;
      const id = args.where.id;
      const record = slug
        ? storiesBySlug.get(slug)
        : id
          ? storiesById.get(id)
          : undefined;
      return resolveStory(record, args.include);
    },
    async findMany(args: FindManyArgs = {}) {
      const records = Array.from(storiesById.values())
        .filter((entry) => storyMatches(entry, args.where))
        .sort((a, b) => {
          if (!args.orderBy?.publishedAt) return 0;
          const aDate = a.publishedAt?.getTime() ?? 0;
          const bDate = b.publishedAt?.getTime() ?? 0;
          return args.orderBy.publishedAt === "asc"
            ? aDate - bDate
            : bDate - aDate;
        });
      return records.map((record) => resolveStory(record, args.include));
    },
    async findFirst(args: FindFirstArgs = {}) {
      const matches = await this.findMany(args);
      return matches[0] ?? null;
    },
    async upsert(args: UpsertArgs) {
      const slug = extractSlug(args.where);
      const idFromWhere = extractId(args.where);
      let existing: MockStory | undefined;
      if (slug) {
        existing = storiesBySlug.get(slug);
      } else if (idFromWhere) {
        existing = storiesById.get(idFromWhere);
      }

      if (existing) {
        Object.entries(args.update).forEach(([key, value]) => {
          if (key === "body" || key === "audio") return;
          (existing as Record<string, unknown>)[key] = value;
        });
        existing.updatedAt = new Date();
        applyBodyUpdate(existing, args.update);
        if ("audio" in args.update && args.update.audio) {
          const audioUpdate = (
            args.update.audio as {
              upsert?: { update?: unknown; create?: unknown };
            }
          ).upsert;
          if (audioUpdate?.update || audioUpdate?.create) {
            const data = audioUpdate.update ?? audioUpdate.create ?? {};
            const asset = upsertAudio(
              existing.id,
              data as Record<string, unknown>,
            );
            existing.audioId = asset.id;
          }
        }
      } else {
        const id = randomUUID();
        const createdAt = new Date();
        const newStory: MockStory = {
          id,
          slug: (args.create as { slug: string }).slug,
          title: (args.create as { title: string }).title,
          description: (args.create as { description: string }).description,
          tags: ((args.create as { tags?: string[] }).tags ?? []).slice(),
          ageMin: (args.create as { ageMin: number }).ageMin,
          ageMax: (args.create as { ageMax: number }).ageMax,
          isInteractive:
            (args.create as { isInteractive?: boolean }).isInteractive ?? false,
          status: (args.create as { status: string }).status,
          createdAt,
          updatedAt: createdAt,
          publishedAt:
            (args.create as { publishedAt?: Date | null }).publishedAt ?? null,
          body: null,
          audioId: null,
          interactiveNodeIds: [],
        };
        newStory.body = getBodyFromCreate(args.create, id);
        if (
          (args.create as { audio?: { create?: Record<string, unknown> } })
            .audio?.create
        ) {
          const asset = upsertAudio(
            id,
            (args.create as { audio: { create: Record<string, unknown> } })
              .audio.create,
          );
          newStory.audioId = asset.id;
        }
        storiesBySlug.set(newStory.slug, newStory);
        storiesById.set(newStory.id, newStory);
        existing = newStory;
      }

      if (existing.slug) {
        storiesBySlug.set(existing.slug, existing);
      }
      storiesById.set(existing.id, existing);
      return resolveStory(existing, args.include);
    },
  };

  const interactiveNode = {
    async create(args: {
      data: { id?: string; storyId: string; title: string; bodyHtml: string };
    }) {
      const id = args.data.id ?? randomUUID();
      const node: MockInteractiveNode = {
        id,
        storyId: args.data.storyId,
        title: args.data.title,
        bodyHtml: args.data.bodyHtml,
      };
      interactiveNodes.set(id, node);
      const list = interactiveNodeIdsByStory.get(node.storyId) ?? [];
      if (!list.includes(id)) {
        list.push(id);
        interactiveNodeIdsByStory.set(node.storyId, list);
      }
      const storyRecord = storiesById.get(node.storyId);
      if (storyRecord && !storyRecord.interactiveNodeIds.includes(id)) {
        storyRecord.interactiveNodeIds.push(id);
      }
      return { ...node };
    },
    async deleteMany(args: DeleteManyArgs) {
      if (!args.where?.storyId) {
        const count = interactiveNodes.size;
        interactiveNodes.clear();
        interactiveNodeIdsByStory.clear();
        choicesByFromNode.clear();
        choicesByToNode.clear();
        interactiveChoices.clear();
        return { count };
      }
      const storyId = args.where.storyId;
      const nodeIds = interactiveNodeIdsByStory.get(storyId) ?? [];
      nodeIds.forEach((nodeId) => {
        interactiveNodes.delete(nodeId);
        const choiceIds = choicesByFromNode.get(nodeId) ?? [];
        choiceIds.forEach((choiceId) => {
          const choice = interactiveChoices.get(choiceId);
          if (choice) {
            const incoming = choicesByToNode.get(choice.toNodeId) ?? [];
            choicesByToNode.set(
              choice.toNodeId,
              incoming.filter((id) => id !== choiceId),
            );
          }
          interactiveChoices.delete(choiceId);
        });
        choicesByFromNode.delete(nodeId);
      });
      interactiveNodeIdsByStory.set(storyId, []);
      const storyRecord = storiesById.get(storyId);
      if (storyRecord) {
        storyRecord.interactiveNodeIds = [];
      }
      return { count: nodeIds.length };
    },
    async findMany(args: {
      where: { storyId: string };
      include?: StoryInclude["interactiveNodes"];
    }) {
      return fetchInteractiveNodes(args.where.storyId, args.include);
    },
  };

  const interactiveChoice = {
    async create(args: {
      data: {
        id?: string;
        fromNodeId: string;
        label: string;
        toNodeId: string;
      };
    }) {
      const id = args.data.id ?? randomUUID();
      const choice: MockInteractiveChoice = {
        id,
        fromNodeId: args.data.fromNodeId,
        label: args.data.label,
        toNodeId: args.data.toNodeId,
      };
      interactiveChoices.set(id, choice);
      const outgoing = choicesByFromNode.get(choice.fromNodeId) ?? [];
      outgoing.push(id);
      choicesByFromNode.set(choice.fromNodeId, outgoing);
      const incoming = choicesByToNode.get(choice.toNodeId) ?? [];
      incoming.push(id);
      choicesByToNode.set(choice.toNodeId, incoming);
      return { ...choice };
    },
    async deleteMany(args: DeleteManyArgs) {
      if (!args.where?.storyId) {
        const count = interactiveChoices.size;
        interactiveChoices.clear();
        choicesByFromNode.clear();
        choicesByToNode.clear();
        return { count };
      }
      const nodeIds = interactiveNodeIdsByStory.get(args.where.storyId) ?? [];
      let count = 0;
      nodeIds.forEach((nodeId) => {
        const outgoing = choicesByFromNode.get(nodeId) ?? [];
        outgoing.forEach((choiceId) => {
          const choice = interactiveChoices.get(choiceId);
          if (choice) {
            const incoming = choicesByToNode.get(choice.toNodeId) ?? [];
            choicesByToNode.set(
              choice.toNodeId,
              incoming.filter((id) => id !== choiceId),
            );
          }
          interactiveChoices.delete(choiceId);
          count += 1;
        });
        choicesByFromNode.delete(nodeId);
      });
      return { count };
    },
  };

  const freeRotation = {
    async findUnique(args: { where: { storyId: string } }) {
      return freeRotations.get(args.where.storyId) ?? null;
    },
    async findFirst(args: { where: { storyId: string; monthKey?: string } }) {
      const record = freeRotations.get(args.where.storyId);
      if (!record) return null;
      if (args.where.monthKey && record.monthKey !== args.where.monthKey)
        return null;
      return { ...record };
    },
    async upsert(args: {
      where: { storyId: string };
      update: { monthKey: string; priority?: number };
      create: { storyId: string; monthKey: string; priority?: number };
    }) {
      const existing = freeRotations.get(args.where.storyId);
      if (existing) {
        const updated = {
          storyId: existing.storyId,
          monthKey: args.update.monthKey,
          priority: args.update.priority ?? existing.priority,
        };
        freeRotations.set(existing.storyId, updated);
        return { ...updated };
      }
      const created = {
        storyId: args.create.storyId,
        monthKey: args.create.monthKey,
        priority: args.create.priority ?? 0,
      };
      freeRotations.set(created.storyId, created);
      return { ...created };
    },
    async create(args: {
      data: { storyId: string; monthKey: string; priority?: number };
    }) {
      const record = {
        storyId: args.data.storyId,
        monthKey: args.data.monthKey,
        priority: args.data.priority ?? 0,
      };
      freeRotations.set(record.storyId, record);
      return { ...record };
    },
    async deleteMany(args: DeleteManyArgs) {
      if (!args.where?.storyId) {
        const count = freeRotations.size;
        freeRotations.clear();
        return { count };
      }
      const existed = freeRotations.delete(args.where.storyId) ? 1 : 0;
      return { count: existed };
    },
  };

  const audio = {
    async upsert(args: {
      where: { storyId: string };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }) {
      const existing = Array.from(audioAssets.values()).find(
        (asset) => asset.storyId === args.where.storyId,
      );
      if (existing) {
        const updated = upsertAudio(args.where.storyId, args.update);
        const storyRecord = storiesById.get(args.where.storyId);
        if (storyRecord) {
          storyRecord.audioId = updated.id;
          storiesById.set(storyRecord.id, storyRecord);
          storiesBySlug.set(storyRecord.slug, storyRecord);
        }
        return { ...updated };
      }
      const created = upsertAudio(args.where.storyId, args.create);
      const storyRecord = storiesById.get(args.where.storyId);
      if (storyRecord) {
        storyRecord.audioId = created.id;
        storiesById.set(storyRecord.id, storyRecord);
        storiesBySlug.set(storyRecord.slug, storyRecord);
      }
      return { ...created };
    },
  };

  const subscription = {
    async findUnique(args: { where: { userId: string } }) {
      const record = subscriptions.get(args.where.userId);
      return record ? { ...record } : null;
    },
    async upsert(args: {
      where: { userId: string };
      update: { status: string };
      create: { userId: string; status: string };
    }) {
      const existing = subscriptions.get(args.where.userId);
      if (existing) {
        const updated = { ...existing, status: args.update.status };
        subscriptions.set(args.where.userId, updated);
        return { ...updated };
      }
      const created = {
        userId: args.create.userId,
        status: args.create.status,
      };
      subscriptions.set(created.userId, created);
      return { ...created };
    },
  };

  const user = {
    async findUnique() {
      return null;
    },
  };

  const mockClient = {
    story,
    interactiveNode,
    interactiveChoice,
    freeRotation,
    audioAsset: audio,
    subscription,
    user,
    async $disconnect() {
      return;
    },
  };

  return mockClient as unknown as PrismaClient;
}
