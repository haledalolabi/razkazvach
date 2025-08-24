import { StoryUpsertSchema } from "../../lib/validators";
import { describe, it, expect } from "vitest";

describe("StoryUpsertSchema", () => {
  it("parses valid data", () => {
    const res = StoryUpsertSchema.safeParse({
      title: "Test story",
      slug: "test-story",
      description: "A short desc for story",
      tags: "a, b",
      ageMin: 3,
      ageMax: 8,
      isInteractive: false,
    });
    expect(res.success).toBe(true);
  });

  it("rejects bad slug", () => {
    const res = StoryUpsertSchema.safeParse({
      title: "Test",
      slug: "Bad Slug!!",
      description: "desc desc desc",
      ageMin: 3,
      ageMax: 5,
    });
    expect(res.success).toBe(false);
  });
});
