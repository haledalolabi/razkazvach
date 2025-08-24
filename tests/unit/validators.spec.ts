import { StoryUpsertSchema } from "../../lib/validators";
import { describe, it, expect } from "vitest";

describe("StoryUpsertSchema", () => {
  it("parses basic story", () => {
    const data = {
      title: "Test Story",
      slug: "test-story",
      description: "short description here",
      tags: "tag1, tag2",
      ageMin: 3,
      ageMax: 8,
      isInteractive: false,
    };
    const parsed = StoryUpsertSchema.parse(data);
    expect(parsed.slug).toBe("test-story");
    expect(parsed.tags).toEqual(["tag1", "tag2"]);
  });
});
