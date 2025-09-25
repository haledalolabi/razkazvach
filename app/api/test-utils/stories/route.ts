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
  isInteractive?: unknown;
  interactiveNodes?: unknown;
  audio?: unknown;
  freeRotationMonthKey?: unknown;
};

type StoryBodyInput = {
  html?: unknown;
  lang?: unknown;
};

type InteractiveChoiceInput = {
  id?: unknown;
  label?: unknown;
  toNodeId?: unknown;
};

type InteractiveNodeInput = {
  id?: unknown;
  title?: unknown;
  bodyHtml?: unknown;
  choices?: unknown;
};

type AudioInput = {
  url?: unknown;
  voice?: unknown;
  quality?: unknown;
  durationSec?: unknown;
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

function normalizeAudio(value: unknown) {
  const input = (value as AudioInput) ?? {};
  if (typeof input.url !== "string" || !input.url) return null;
  return {
    url: input.url,
    voice: typeof input.voice === "string" ? input.voice : undefined,
    quality: typeof input.quality === "string" ? input.quality : undefined,
    durationSec:
      typeof input.durationSec === "number" ? input.durationSec : undefined,
  };
}

function normalizeInteractiveNodes(value: unknown) {
  const nodes: Array<{
    id?: string;
    title: string;
    bodyHtml: string;
    choices: Array<{ id?: string; label: string; toNodeId: string }>;
  }> = [];

  if (!Array.isArray(value)) return nodes;

  for (const entry of value) {
    const input = (entry as InteractiveNodeInput) ?? {};
    if (typeof input.title !== "string") continue;
    const bodyHtml = typeof input.bodyHtml === "string" ? input.bodyHtml : "";
    const id = typeof input.id === "string" && input.id ? input.id : undefined;
    const choices: Array<{ id?: string; label: string; toNodeId: string }> = [];
    if (Array.isArray(input.choices)) {
      for (const rawChoice of input.choices) {
        const choiceInput = (rawChoice as InteractiveChoiceInput) ?? {};
        if (typeof choiceInput.label !== "string") continue;
        if (typeof choiceInput.toNodeId !== "string") continue;
        const choiceId =
          typeof choiceInput.id === "string" && choiceInput.id
            ? choiceInput.id
            : undefined;
        choices.push({
          id: choiceId,
          label: choiceInput.label,
          toNodeId: choiceInput.toNodeId,
        });
      }
    }
    nodes.push({ id, title: input.title, bodyHtml, choices });
  }

  return nodes;
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
  const isInteractive = parseBoolean(payload.isInteractive, false);
  const interactiveNodes = normalizeInteractiveNodes(payload.interactiveNodes);
  const audio = normalizeAudio(payload.audio);
  const freeRotationMonthKey =
    typeof payload.freeRotationMonthKey === "string"
      ? payload.freeRotationMonthKey
      : null;

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
      isInteractive,
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
      isInteractive,
      body: { create: { html, lang } },
    },
    include: { body: true },
  });

  if (clearFreeRotation) {
    await prisma.freeRotation.deleteMany({ where: { storyId: story.id } });
  }

  if (freeRotationMonthKey) {
    await prisma.freeRotation.upsert({
      where: { storyId: story.id },
      update: { monthKey: freeRotationMonthKey },
      create: { storyId: story.id, monthKey: freeRotationMonthKey },
    });
  }

  if (interactiveNodes.length > 0) {
    await prisma.interactiveNode.deleteMany({ where: { storyId: story.id } });
    for (const node of interactiveNodes) {
      const created = await prisma.interactiveNode.create({
        data: {
          id: node.id,
          storyId: story.id,
          title: node.title,
          bodyHtml: node.bodyHtml,
        },
      });
      for (const choice of node.choices) {
        await prisma.interactiveChoice.create({
          data: {
            id: choice.id,
            fromNodeId: created.id,
            label: choice.label,
            toNodeId: choice.toNodeId,
          },
        });
      }
    }
  }

  if (audio) {
    const audioData: {
      url: string;
      voice: string;
      quality: string;
      durationSec?: number;
    } = {
      url: audio.url,
      voice: audio.voice ?? "test-voice",
      quality: audio.quality ?? "standard",
    };
    if (typeof audio.durationSec === "number") {
      audioData.durationSec = audio.durationSec;
    }
    await prisma.audioAsset.upsert({
      where: { storyId: story.id },
      update: audioData,
      create: { storyId: story.id, ...audioData },
    });
  }

  return NextResponse.json({ story });
}
