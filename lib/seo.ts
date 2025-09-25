export function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  const base = getAppBaseUrl();
  return new URL(path, base).toString();
}

export function buildStoryJsonLd({
  title,
  description,
  slug,
  tags,
  publishedAt,
  coverImage,
}: {
  title: string;
  description: string;
  slug: string;
  tags: string[];
  publishedAt: Date | null;
  coverImage: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    headline: title,
    name: title,
    description,
    keywords: tags.join(", "),
    inLanguage: "bg",
    isFamilyFriendly: true,
    datePublished: publishedAt?.toISOString() ?? undefined,
    url: absoluteUrl(`/prikazki/${slug}`),
    image: coverImage ?? undefined,
    author: {
      "@type": "Organization",
      name: "Разказвач",
    },
    publisher: {
      "@type": "Organization",
      name: "Разказвач",
    },
  };
}
