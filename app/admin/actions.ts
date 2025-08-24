"use server";
import { prisma } from "@/lib/prisma";
import { StoryUpsertSchema } from "@/lib/validators";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { upsertStoryIndex } from "@/lib/search";

export async function upsertStory(formData: FormData): Promise<void> {
  const parsed = StoryUpsertSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid story payload");
  const { id, bodyHtml, ...fields } = parsed.data as z.infer<
    typeof StoryUpsertSchema
  >;

  await prisma.story.upsert({
    where: { id: id ?? "" },
    update: {
      ...fields,
      body: bodyHtml
        ? { upsert: { create: { html: bodyHtml }, update: { html: bodyHtml } } }
        : undefined,
    },
    create: {
      ...fields,
      body: bodyHtml ? { create: { html: bodyHtml } } : undefined,
    },
  });
  revalidatePath("/admin");
}

export async function publishStory(id: string): Promise<void> {
  const s = await prisma.story.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
    include: { body: true },
  });
  await upsertStoryIndex(s);
  revalidatePath(`/prikazki/${s.slug}`);
}
