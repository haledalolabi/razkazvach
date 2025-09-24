import { randomUUID } from "crypto";
import type { PrismaClient } from "@prisma/client";

type StoryBody = {
  storyId: string;
  html: string;
  lang: string;
};

type MockStory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  ageMin: number;
  ageMax: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  body: StoryBody | null;
  audio: null;
};

type StoryInclude = {
  body?: boolean;
  audio?: boolean;
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

type DeleteManyArgs = {
  where?: { storyId?: string };
};

type FreeRotationRecord = {
  id: string;
  storyId: string;
  monthKey: string;
  priority: number;
};

function cloneStory(story: MockStory, include?: StoryInclude) {
  const clone: Record<string, unknown> = {
    ...story,
  };

  if (include?.body) {
    clone.body = story.body ? { ...story.body } : null;
  } else {
    delete clone.body;
  }

  if (include?.audio) {
    clone.audio = story.audio;
  } else {
    delete clone.audio;
  }

  return clone;
}

function resolveStory(story: MockStory | undefined, include?: StoryInclude) {
  if (!story) return null;
  return cloneStory(story, include);
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

export function createMockPrisma(): PrismaClient {
  const storiesBySlug = new Map<string, MockStory>();
  const storiesById = new Map<string, MockStory>();
  const freeRotations = new Map<string, FreeRotationRecord>();

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
          if (key === "body") return;
          (existing as Record<string, unknown>)[key] = value;
        });
        existing.updatedAt = new Date();
        applyBodyUpdate(existing, args.update);
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
          status: (args.create as { status: string }).status,
          createdAt,
          updatedAt: createdAt,
          publishedAt:
            (args.create as { publishedAt?: Date | null }).publishedAt ?? null,
          body: null,
          audio: null,
        };
        newStory.body = getBodyFromCreate(args.create, id);
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

  const freeRotation = {
    async findUnique(args: { where: { storyId: string } }) {
      return freeRotations.get(args.where.storyId) ?? null;
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

  const user = {
    async findUnique() {
      return null;
    },
  };

  const mockClient = {
    story,
    freeRotation,
    user,
    async $disconnect() {
      return;
    },
  };

  return mockClient as unknown as PrismaClient;
}
