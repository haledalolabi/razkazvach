import { prisma } from "@/lib/prisma";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CatalogBrowser } from "./CatalogBrowser";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const stories = await prisma.story.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      tags: true,
      ageMin: true,
      ageMax: true,
      isInteractive: true,
      publishedAt: true,
    },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Каталог с приказки
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            Открий подбрани истории, разделени по възраст и интерактивност.
            Филтрирай, за да намериш идеалното вечерно приключение.
          </p>
        </header>
        <CatalogBrowser stories={stories} />
      </main>
      <SiteFooter />
    </div>
  );
}
