import { describe, it, expect, vi } from "vitest";
vi.mock("../../lib/search", () => ({
  searchStories: vi.fn(async () => ({
    hits: [{ id: "1", title: "t", description: "d" }],
  })),
}));
import { GET as healthGET } from "../../app/api/health/route";
import { GET as searchGET } from "../../app/api/search/route";

describe("routes", () => {
  it("health", async () => {
    const res = await healthGET(new Request("http://localhost/api/health"));
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("search happy path", async () => {
    const res = await searchGET(
      new Request("http://localhost/api/search?q=de"),
    );
    const json = await res.json();
    expect(json.hits.length).toBe(1);
  });
});
