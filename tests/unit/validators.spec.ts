import { StoryUpsertSchema } from "../../lib/validators";
import { describe, it, expect } from "vitest";

describe("StoryUpsertSchema", () => {
  it("parses valid data", () => {
    const result = StoryUpsertSchema.parse({
      title: "Test Story",
      slug: "test-story",
      description: "short description for testing",
      tags: "tag1, tag2",
      ageMin: 3,
      ageMax: 8,
    });
    expect(result.slug).toBe("test-story");
    expect(result.tags).toEqual(["tag1", "tag2"]);
  });

  it("rejects invalid slug", () => {
    expect(() =>
      StoryUpsertSchema.parse({
        title: "Test",
        slug: "Bad Slug!",
        description: "desc desc desc desc desc",
        ageMin: 3,
        ageMax: 8,
      }),
    ).toThrow();
  });
});
