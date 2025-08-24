import { describe, it, expect } from "vitest";
import { StoryUpsertSchema } from "../../lib/validators";

describe("StoryUpsertSchema", () => {
  it("parses and transforms fields", () => {
    const data = {
      title: "Test Story",
      slug: "test-story",
      description: "This is a test story description",
      tags: "a, b ,c",
      ageMin: "3",
      ageMax: "8",
      isInteractive: "true",
    } as Record<string, unknown>;
    const parsed = StoryUpsertSchema.parse(data);
    expect(parsed.tags).toEqual(["a", "b", "c"]);
    expect(parsed.isInteractive).toBe(true);
    expect(parsed.ageMin).toBe(3);
  });

  it("rejects bad slug", () => {
    const data: Record<string, unknown> = {
      title: "Bad",
      slug: "Bad Slug!!",
      description: "too short description??", // but passes min length after translation? Wait, this is 25 characters >10
      ageMin: 3,
      ageMax: 8,
    };
    expect(() => StoryUpsertSchema.parse(data)).toThrow();
  });
});
