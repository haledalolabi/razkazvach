"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Prisma } from "@prisma/client";
import { cn } from "@/lib/utils";

type StorySummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  ageMin: number;
  ageMax: number;
  isInteractive: boolean;
  publishedAt: string | null;
};

type StoryFromQuery = Prisma.StoryGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    description: true;
    tags: true;
    ageMin: true;
    ageMax: true;
    isInteractive: true;
    publishedAt: true;
  };
}>;

const AGE_FILTERS = [
  { label: "3–5", value: "3-5", min: 3, max: 5 },
  { label: "6–8", value: "6-8", min: 6, max: 8 },
];

function normalizeStories(stories: StoryFromQuery[]): StorySummary[] {
  return stories.map((story) => ({
    ...story,
    publishedAt: story.publishedAt
      ? new Date(story.publishedAt).toISOString()
      : null,
  }));
}

export function CatalogBrowser({ stories }: { stories: StoryFromQuery[] }) {
  const [ageFilter, setAgeFilter] = useState<string | null>(null);
  const [interactiveOnly, setInteractiveOnly] = useState(false);
  const normalizedStories = useMemo(() => normalizeStories(stories), [stories]);

  const filtered = useMemo(() => {
    return normalizedStories.filter((story) => {
      if (interactiveOnly && !story.isInteractive) {
        return false;
      }
      if (!ageFilter) {
        return true;
      }
      const filter = AGE_FILTERS.find((item) => item.value === ageFilter);
      if (!filter) return true;
      const overlaps = story.ageMax >= filter.min && story.ageMin <= filter.max;
      return overlaps;
    });
  }, [normalizedStories, interactiveOnly, ageFilter]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {AGE_FILTERS.map((filter) => {
          const active = ageFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={active}
              onClick={() => setAgeFilter(active ? null : filter.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-slate-900",
              )}
            >
              Възраст {filter.label}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={interactiveOnly}
          onClick={() => setInteractiveOnly((value) => !value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            interactiveOnly
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-slate-200 text-slate-600 hover:border-purple-200 hover:text-slate-900",
          )}
        >
          Само интерактивни
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((story) => (
          <article
            key={story.id}
            className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-600">
                  {story.ageMin}–{story.ageMax} г.
                </span>
                {story.isInteractive && (
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 font-semibold text-purple-600">
                    Интерактивна
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                {story.title}
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                {story.description}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
              <span>
                {story.publishedAt
                  ? new Date(story.publishedAt).toLocaleDateString("bg-BG")
                  : "Очаквайте скоро"}
              </span>
              <Link
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                href={`/prikazki/${story.slug}`}
              >
                Към приказката
              </Link>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
            Няма приказки за избраните критерии. Опитай с друг филтър.
          </div>
        )}
      </div>
    </section>
  );
}
