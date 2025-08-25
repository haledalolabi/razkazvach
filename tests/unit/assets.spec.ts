import fs from "fs/promises";
import path from "path";
import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";

describe("LocalStorage and /api/assets", () => {
  const testUploads = "test-uploads";
  const uploadsPath = path.resolve(process.cwd(), testUploads);

  beforeAll(() => {
    process.env.ASSETS_DIR = testUploads;
  });

  afterAll(async () => {
    delete process.env.ASSETS_DIR;
    await fs.rm(uploadsPath, { recursive: true, force: true });
  });

  it("operate on the same directory", async () => {
    const { LocalStorage } = await import("../../lib/storage");
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const key = "dir/file.txt";
    const data = "hello";
    await LocalStorage.putObject(key, Buffer.from(data));

    const res = await GET(new Request("http://example.com"), {
      params: { key: key.split("/") },
    });
    const body = await res.text();

    expect(body).toBe(data);

    await LocalStorage.deleteObject(key);
  });

  it("sets Content-Type for .txt files", async () => {
    const { LocalStorage } = await import("../../lib/storage");
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const key = "file.txt";
    await LocalStorage.putObject(key, Buffer.from("data"));

    const res = await GET(new Request("http://example.com"), {
      params: { key: key.split("/") },
    });

    expect(res.headers.get("Content-Type")).toBe("text/plain");

    await LocalStorage.deleteObject(key);
  });

  it("sets Content-Type for .png files", async () => {
    const { LocalStorage } = await import("../../lib/storage");
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const key = "image.png";
    await LocalStorage.putObject(key, Buffer.from("png"));

    const res = await GET(new Request("http://example.com"), {
      params: { key: key.split("/") },
    });

    expect(res.headers.get("Content-Type")).toBe("image/png");

    await LocalStorage.deleteObject(key);
  });

  it("returns 404 when file is missing", async () => {
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const res = await GET(new Request("http://example.com"), {
      params: { key: ["missing.txt"] },
    });

    expect(res.status).toBe(404);
  });

  it("returns 500 for other fs errors", async () => {
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const readFile = vi
      .spyOn(fs, "readFile")
      .mockRejectedValueOnce(
        Object.assign(new Error("boom"), { code: "EACCES" }),
      );

    const res = await GET(new Request("http://example.com"), {
      params: { key: ["boom.txt"] },
    });

    expect(res.status).toBe(500);
    readFile.mockRestore();
  });
});
