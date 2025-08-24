import { StoryUpsertSchema } from "../../lib/validators";
import { describe, it, expect } from "vitest";

describe("StoryUpsertSchema", () => {
  it("parses basic story", () => {
    const parsed = StoryUpsertSchema.parse({
      title: "Test Story",
      slug: "test-story",
      description: "This is a description with more than ten chars",
      tags: "a, b",
      ageMin: 3,
      ageMax: 8,
    });
    expect(parsed.tags).toEqual(["a", "b"]);
  });
});
