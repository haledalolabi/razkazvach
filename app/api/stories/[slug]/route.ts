import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessStory, hasPremium, isFreeStory } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const story = await prisma.story.findUnique({
    where: { slug: params.slug },
    include: { body: true, audio: true },
  });

  if (!story || story.status !== "PUBLISHED") {
    return new NextResponse("Not found", { status: 404 });
  }

  const [free, premium] = await Promise.all([
    isFreeStory(story.id),
    hasPremium(),
  ]);

  if (!canAccessStory({ isFree: free, hasPremium: premium })) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const location = new URL(`/paywall?slug=${story.slug}`, base);
    return NextResponse.redirect(location);
  }

  return NextResponse.json({
    id: story.id,
    title: story.title,
    html: story.body?.html ?? "",
    audioUrl: story.audio?.url ?? null,
  });
}
