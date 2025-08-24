import { toSlug } from "../../lib/slug";
import { describe, it, expect } from "vitest";

describe("toSlug", () => {
  it("normalizes text", () => {
    expect(toSlug(" Hello World!! ")).toBe("hello-world");
  });
});
