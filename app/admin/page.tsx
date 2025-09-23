// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// 🚫 Забраняваме статично пререндериране за да не удря БД при build
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  // Build-time детекция:
  // - NEXT_PHASE се задава от Next при production build в някои среди
  // - BUILD_TIME можеш да подадеш като ARG/ENV в Dockerfile по време на build (по желание)
  const isBuildTime =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.BUILD_TIME === "true";

  const hasDb = !!process.env.DATABASE_URL;

  let stories:
    | Array<{
        id: string;
        title: string;
        slug: string;
        status: string;
        updatedAt: Date;
      }>
    | [] = [];

  if (!isBuildTime && hasDb) {
    try {
      stories = await prisma.story.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      // Меко падане при проблем с БД (например runtime без работеща база)
      console.error("[admin] Failed to fetch stories:", e);
      stories = [];
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Link
          className="rounded bg-black px-3 py-2 text-white"
          href="/admin/stories/new"
        >
          New Story
        </Link>
      </div>

      {(!hasDb || isBuildTime) && (
        <p className="mt-4 text-sm text-gray-500">
          Database is not available during build/runtime. Showing empty list.
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {stories.map((s) => (
          <li
            key={s.id}
            className="rounded border p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-gray-500">
                {s.status} · /prikazki/{s.slug}
              </div>
            </div>
            <Link className="underline" href={`/admin/stories/${s.id}`}>
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
