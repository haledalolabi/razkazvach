import type { StoryStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StoryRequestBody = {
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  ageMin?: unknown;
  ageMax?: unknown;
  tags?: unknown;
  status?: unknown;
  publishedAt?: unknown;
  body?: unknown;
  clearFreeRotation?: unknown;
};

type StoryBodyInput = {
  html?: unknown;
  lang?: unknown;
};

function parseBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return defaultValue;
}

function ensureDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

function normalizeBody(body: unknown): { html: string; lang: string } {
  const input = (body as StoryBodyInput) ?? {};
  const html =
    typeof input.html === "string" ? input.html : "<p>Test story</p>";
  const lang = typeof input.lang === "string" ? input.lang : "bg";
  return { html, lang };
}

function normalizeStatus(value: unknown): StoryStatus {
  if (typeof value === "string") {
    const upper = value.toUpperCase();
    if (upper === "DRAFT" || upper === "PUBLISHED") {
      return upper as StoryStatus;
    }
  }
  return "PUBLISHED";
}

export async function POST(request: Request) {
  if (process.env.USE_MOCK_PRISMA !== "1") {
    return NextResponse.json(
      { error: "Test utilities are disabled" },
      { status: 403 },
    );
  }

  let payload: StoryRequestBody;
  try {
    payload = (await request.json()) as StoryRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = typeof payload.slug === "string" && payload.slug.trim();
  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const title =
    typeof payload.title === "string" ? payload.title : "Test Story";
  const description =
    typeof payload.description === "string"
      ? payload.description
      : "Test story used in E2E";
  const ageMin = typeof payload.ageMin === "number" ? payload.ageMin : 0;
  const ageMax = typeof payload.ageMax === "number" ? payload.ageMax : ageMin;
  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const status = normalizeStatus(payload.status);
  const publishedAt = ensureDate(payload.publishedAt);
  const clearFreeRotation = parseBoolean(payload.clearFreeRotation, true);
  const { html, lang } = normalizeBody(payload.body);

  const story = await prisma.story.upsert({
    where: { slug },
    update: {
      title,
      description,
      tags,
      ageMin,
      ageMax,
      status,
      publishedAt,
      body: {
        upsert: {
          update: { html, lang },
          create: { html, lang },
        },
      },
    },
    create: {
      slug,
      title,
      description,
      tags,
      ageMin,
      ageMax,
      status,
      publishedAt,
      body: { create: { html, lang } },
    },
    include: { body: true },
  });

  if (clearFreeRotation) {
    await prisma.freeRotation.deleteMany({ where: { storyId: story.id } });
  }

  return NextResponse.json({ story });
}
