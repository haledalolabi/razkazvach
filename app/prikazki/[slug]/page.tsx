import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessStory, hasPremium, isFreeStory } from "@/lib/access";

export const dynamic = "force-dynamic";

interface StoryPageProps {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await prisma.story.findUnique({
    where: { slug: params.slug },
    include: { body: true, audio: true },
  });

  if (!story || story.status !== "PUBLISHED") {
    notFound();
  }

  const [free, premium] = await Promise.all([
    isFreeStory(story.id),
    hasPremium(),
  ]);

  if (!canAccessStory({ isFree: free, hasPremium: premium })) {
    redirect(`/paywall?slug=${encodeURIComponent(story.slug)}`);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <article>
        <h1 className="text-3xl font-bold">{story.title}</h1>
        <p className="text-gray-500">{story.description}</p>
        {story.body?.html ? (
          <div
            className="prose prose-lg mt-6"
            dangerouslySetInnerHTML={{ __html: story.body.html }}
          />
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Story body not available.
          </p>
        )}
      </article>

      {story.audio?.url && (
        <section className="rounded border p-4">
          <h2 className="text-lg font-semibold">Аудио версия</h2>
          <audio className="mt-2 w-full" controls src={story.audio.url} />
        </section>
      )}
    </main>
  );
}
