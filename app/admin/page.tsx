import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const stories = await prisma.story.findMany({
    orderBy: { updatedAt: "desc" },
  });
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
      <ul className="mt-4 space-y-2">
        {stories.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded border p-3"
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
