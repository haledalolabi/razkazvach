import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { InteractiveReader } from "./interactive";
import { prisma } from "@/lib/prisma";
import {
  canReadFullStory,
  currentMonthKey,
  getFreeRotationForMonth,
  resolveCurrentUserId,
} from "@/lib/entitlements";
import { extractPreview } from "@/lib/preview";
import { absoluteUrl, buildStoryJsonLd } from "@/lib/seo";

const PREVIEW_PARAGRAPHS = Number(process.env.STORY_PREVIEW_PARAGRAPHS ?? "2");

type StoryWithContent = Prisma.StoryGetPayload<{
  include: {
    body: true;
    audio: true;
    interactiveNodes: {
      include: {
        choices: true;
        incoming: true;
      };
    };
  };
}>;

async function loadStory(slug: string): Promise<StoryWithContent | null> {
  return prisma.story.findUnique({
    where: { slug },
    include: {
      body: true,
      audio: true,
      interactiveNodes: {
        include: { choices: true, incoming: true },
      },
    },
  });
}

function ensurePublished(story: StoryWithContent | null): StoryWithContent {
  if (!story || story.status !== "PUBLISHED") {
    notFound();
  }
  return story;
}

function formatReadingTime(story: StoryWithContent) {
  if (story.isInteractive) {
    const approx = story.body?.readingTimeSec
      ? Math.max(1, Math.round((story.body.readingTimeSec ?? 0) / 60))
      : 5;
    return `~${approx} мин интерактивно приключение`;
  }
  const seconds = story.body?.readingTimeSec;
  if (typeof seconds === "number" && seconds > 0) {
    return `${Math.max(1, Math.round(seconds / 60))} мин четене`;
  }
  const text = story.body?.html ?? "";
  const words = text
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} мин четене`;
}

function formatPublishedDate(date: Date | null | undefined) {
  if (!date) return "Очаквайте скоро";
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "long",
  }).format(date);
}

function findInitialNode(story: StoryWithContent) {
  if (!story.isInteractive) return null;
  const nodes = story.interactiveNodes ?? [];
  if (nodes.length === 0) return null;
  const candidates = nodes.filter((node) => node.incoming.length === 0);
  return (candidates[0] ?? nodes[0]).id;
}

async function getNextStory(current: StoryWithContent) {
  if (!current.publishedAt) return null;
  const next = await prisma.story.findFirst({
    where: {
      status: "PUBLISHED",
      publishedAt: { gt: current.publishedAt },
      NOT: { id: current.id },
    },
    orderBy: { publishedAt: "asc" },
    select: { slug: true, title: true },
  });
  return next;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const story = ensurePublished(await loadStory(params.slug));
  const url = absoluteUrl(`/prikazki/${story.slug}`);
  const title = `${story.title} | Разказвач`;
  const description = story.description;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const story = ensurePublished(await loadStory(params.slug));
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

  const hasInteractive =
    story.isInteractive && story.interactiveNodes.length > 0;
  const bodyHtml = story.body?.html ?? "";
  const previewHtml = extractPreview(bodyHtml, PREVIEW_PARAGRAPHS);
  const jsonLd = buildStoryJsonLd({
    title: story.title,
    description: story.description,
    slug: story.slug,
    tags: story.tags,
    publishedAt: story.publishedAt ?? story.updatedAt,
    coverImage: null,
  });
  const nextStory = await getNextStory(story);
  const readingTime = formatReadingTime(story);
  const publishedDate = formatPublishedDate(story.publishedAt);
  const showAudio = entitled || isFreeThisMonth;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex w-full max-w-[200px] flex-shrink-0 items-center justify-center self-start md:self-auto">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-500 p-6 shadow-xl">
              <div className="flex h-full items-center justify-center text-5xl font-bold text-white">
                {story.title.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700">
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold">
                {story.ageMin}–{story.ageMax} г.
              </span>
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {story.title}
            </h1>
            <p className="text-base leading-7 text-slate-600">
              {story.description}
            </p>
            <dl className="flex flex-wrap gap-6 text-sm text-slate-500">
              <div>
                <dt className="font-medium text-slate-600">Време</dt>
                <dd className="mt-1 text-slate-800">{readingTime}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Публикувана</dt>
                <dd className="mt-1 text-slate-800">{publishedDate}</dd>
              </div>
            </dl>
          </div>
        </header>

        {showAudio && story.audio?.url ? (
          <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-emerald-900">
              Слушай аудио версията
            </h2>
            <audio
              aria-label={`Аудио версия на ${story.title}`}
              className="mt-3 w-full"
              controls
              src={story.audio.url}
            />
          </section>
        ) : story.audio?.url ? (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <h2 className="text-lg font-semibold text-slate-700">
              Аудио заключено
            </h2>
            <p className="mt-2">
              Аудио версията е достъпна с премиум абонамент или ако историята е
              в свободната селекция за месеца.
            </p>
            <audio
              aria-label={`Аудио версия на ${story.title}`}
              aria-disabled="true"
              className="mt-3 w-full cursor-not-allowed opacity-60"
              controls
              controlsList="nodownload nofullscreen"
              tabIndex={-1}
              src={story.audio.url}
            />
          </section>
        ) : null}

        <nav className="hidden justify-between md:flex">
          <Link
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
            href="/catalog"
          >
            ← Обратно към каталога
          </Link>
          {nextStory && (
            <Link
              className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
              href={`/prikazki/${nextStory.slug}`}
            >
              Следваща приказка →
            </Link>
          )}
        </nav>

        <article className="space-y-6">
          {hasInteractive && entitled ? (
            <InteractiveReader
              initialNodeId={
                findInitialNode(story) ?? story.interactiveNodes[0]?.id ?? ""
              }
              nodes={story.interactiveNodes.map((node) => ({
                id: node.id,
                title: node.title,
                bodyHtml: node.bodyHtml,
                choices: node.choices.map((choice) => ({
                  id: choice.id,
                  label: choice.label,
                  toNodeId: choice.toNodeId,
                })),
              }))}
              storyId={story.id}
            />
          ) : hasInteractive ? (
            <div className="space-y-4">
              <p className="text-base leading-7 text-slate-700">
                Това е интерактивна приказка с множество избори. Отключи
                достъпа, за да взимаш решения и да запазваш прогреса си.
              </p>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <p className="text-sm font-medium text-emerald-800">
                  Отключи цялата интерактивна история и аудио версията чрез
                  премиум плана.
                </p>
                <Link
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                  href={`/paywall?slug=${story.slug}`}
                >
                  Отключи приказката
                </Link>
              </div>
            </div>
          ) : entitled ? (
            <div
              className="space-y-6 text-[1.125rem] leading-[1.8] text-slate-900"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div
                  className="space-y-6 text-[1.125rem] leading-[1.8] text-slate-900"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <p className="text-sm leading-6 text-emerald-800">
                  Пълната приказка, интерактивните избори и аудиото са достъпни
                  с премиум абонамент.
                </p>
                <Link
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                  href={`/paywall?slug=${story.slug}`}
                >
                  Отключи цялата приказка
                </Link>
              </div>
            </div>
          )}
        </article>
      </main>

      <div className="sticky bottom-0 z-20 flex justify-center px-4 pb-4 pt-0 md:hidden">
        <div className="flex w-full max-w-xl items-center gap-3 rounded-full bg-white/95 p-3 shadow-lg backdrop-blur">
          <Link
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700"
            href="/catalog"
          >
            Каталог
          </Link>
          {nextStory && (
            <Link
              className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-white"
              href={`/prikazki/${nextStory.slug}`}
            >
              Следваща
            </Link>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
