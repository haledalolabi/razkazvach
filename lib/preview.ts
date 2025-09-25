const PARAGRAPH_REGEX = /<p\b[^>]*>[\s\S]*?<\/p>/gi;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractPreview(html: string, paragraphs = 2): string {
  if (!html) return "";
  if (paragraphs <= 0) return "";

  const matches = html.match(PARAGRAPH_REGEX);
  if (matches && matches.length > 0) {
    const selected = matches.slice(0, paragraphs);
    return selected.join("");
  }

  const text = stripHtml(html);
  if (!text) return "";

  const snippet = text.slice(0, 450);
  return `<p>${snippet}${text.length > snippet.length ? "…" : ""}</p>`;
}
