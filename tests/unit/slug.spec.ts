import { toSlug } from "../../lib/slug";
import { describe, it, expect } from "vitest";

describe("toSlug", () => {
  it("normalizes text", () => {
    expect(toSlug(" Приказка за Лисицата! ")).toBe("prikazka-za-lisicata");
  });
});
