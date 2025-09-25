import { describe, expect, it } from "vitest";
import { extractPreview } from "@/lib/preview";

describe("extractPreview", () => {
  it("returns first N paragraphs", () => {
    const html = "<p>Първи.</p><p>Втори.</p><p>Трети.</p>";
    const preview = extractPreview(html, 2);
    expect(preview).toBe("<p>Първи.</p><p>Втори.</p>");
  });

  it("falls back to entire text when paragraphs smaller", () => {
    const html = "<p>Само един абзац.</p>";
    const preview = extractPreview(html, 3);
    expect(preview).toBe("<p>Само един абзац.</p>");
  });

  it("builds snippet when no paragraphs present", () => {
    const html = "<div>Без параграфи, но достатъчно текст за пример.</div>";
    const preview = extractPreview(html, 2);
    expect(preview.startsWith("<p>Без параграфи")).toBe(true);
    expect(preview.endsWith("</p>")).toBe(true);
  });
});
