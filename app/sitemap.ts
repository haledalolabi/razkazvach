import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await prisma.story.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes = [
    "/",
    "/catalog",
    "/pricing",
    "/about",
    "/contact",
    "/paywall",
  ];

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
    })),
    ...stories.map((story) => ({
      url: absoluteUrl(`/prikazki/${story.slug}`),
      lastModified: story.updatedAt ?? new Date(),
    })),
  ];

  return entries;
}
