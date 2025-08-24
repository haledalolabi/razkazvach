"use server";
import { prisma } from "@/lib/prisma";
import { StoryUpsertSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { upsertStoryIndex } from "@/lib/search";
import type { Prisma } from "@prisma/client";

export async function upsertStory(formData: FormData) {
  const parsed = StoryUpsertSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid story payload");
  const { id, bodyHtml, ...fields } = parsed.data as {
    id?: string;
    bodyHtml?: string;
    [key: string]: unknown;
  };

  const story = await prisma.story.upsert({
    where: { id: id ?? "" },
    update: {
      ...(fields as Prisma.StoryUpdateInput),
      body: bodyHtml
        ? {
            upsert: {
              create: { html: bodyHtml },
              update: { html: bodyHtml },
            },
          }
        : undefined,
    },
    create: {
      ...(fields as Prisma.StoryCreateInput),
      body: bodyHtml ? { create: { html: bodyHtml } } : undefined,
    },
  });
  revalidatePath("/admin");
  return { id: story.id };
}

export async function publishStory(id: string) {
  const s = await prisma.story.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
    include: { body: true },
  });
  await upsertStoryIndex(s);
  revalidatePath(`/prikazki/${s.slug}`);
  return { ok: true };
}
