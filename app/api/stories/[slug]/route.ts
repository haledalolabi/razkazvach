import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  canReadFullStory,
  currentMonthKey,
  getFreeRotationForMonth,
  resolveCurrentUserId,
} from "@/lib/entitlements";
import { extractPreview } from "@/lib/preview";
import { absoluteUrl } from "@/lib/seo";

const PREVIEW_PARAGRAPHS = Number(process.env.STORY_PREVIEW_PARAGRAPHS ?? "2");

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

  const { id: userId, role } = await resolveCurrentUserId();
  const isStaff = role === "ADMIN" || role === "EDITOR";
  const monthKey = currentMonthKey();
  const rotation = await getFreeRotationForMonth(story.id, monthKey);
  const isFreeThisMonth = !!rotation;
  const entitled = isStaff
    ? true
    : await canReadFullStory({
        userId,
        storyId: story.id,
        monthKey,
        isFreeThisMonth,
      });

  if (!entitled) {
    const previewHtml = extractPreview(
      story.body?.html ?? "",
      PREVIEW_PARAGRAPHS,
    );
    return NextResponse.json({
      id: story.id,
      title: story.title,
      html: previewHtml,
      audioUrl: null,
      paywalled: true,
      paywallUrl: absoluteUrl(`/paywall?slug=${story.slug}`),
    });
  }

  return NextResponse.json({
    id: story.id,
    title: story.title,
    html: story.body?.html ?? "",
    audioUrl: story.audio?.url ?? null,
    paywalled: false,
  });
}
