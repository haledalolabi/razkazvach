import fs from "fs/promises";
import path from "path";
import os from "os";
import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";

describe("LocalStorage and /api/assets", () => {
  // Използваме уникална temp директория за всеки рън
  let uploadsPath: string;

  beforeAll(async () => {
    uploadsPath = await fs.mkdtemp(path.join(os.tmpdir(), "rz-test-uploads-"));
    // Важното е ASSETS_DIR да е налично преди да импортнем модулите, които го четат
    process.env.ASSETS_DIR = uploadsPath;
  });

  afterAll(async () => {
    delete process.env.ASSETS_DIR;
    await fs.rm(uploadsPath, { recursive: true, force: true });
  });

  it("operate on the same directory", async () => {
    // Импорт след като ASSETS_DIR е вече зададен
    const { LocalStorage } = await import("../../lib/storage");
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const key = "dir/file.txt";
    const data = "hello";

    await LocalStorage.putObject(key, Buffer.from(data));

    const res = await GET(new Request(`http://example.com/api/assets/${key}`), {
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

    const res = await GET(new Request(`http://example.com/api/assets/${key}`), {
      params: { key: key.split("/") },
    });

    const ct = res.headers.get("Content-Type") || "";
    // Позволяваме charset (напр. text/plain;charset=UTF-8)
    expect(ct.startsWith("text/plain")).toBe(true);

    await LocalStorage.deleteObject(key);
  });

  it("sets Content-Type for .png files", async () => {
    const { LocalStorage } = await import("../../lib/storage");
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const key = "image.png";
    // Не е нужно да е валиден PNG — проверяваме по разширение
    await LocalStorage.putObject(key, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const res = await GET(new Request(`http://example.com/api/assets/${key}`), {
      params: { key: key.split("/") },
    });

    const ct = res.headers.get("Content-Type") || "";
    expect(ct.startsWith("image/png")).toBe(true);

    await LocalStorage.deleteObject(key);
  });

  it("returns 404 when file is missing", async () => {
    const { GET } = await import("../../app/api/assets/[...key]/route");

    const res = await GET(
      new Request("http://example.com/api/assets/missing.txt"),
      {
        params: { key: ["missing.txt"] },
      },
    );

    expect(res.status).toBe(404);
  });

  it("returns 500 for other fs errors", async () => {
    const { GET } = await import("../../app/api/assets/[...key]/route");

    // Инжектираме EACCES грешка при readFile
    const readFile = vi
      .spyOn(fs, "readFile")
      .mockRejectedValueOnce(
        Object.assign(new Error("boom"), { code: "EACCES" }),
      );

    const res = await GET(
      new Request("http://example.com/api/assets/boom.txt"),
      {
        params: { key: ["boom.txt"] },
      },
    );

    expect(res.status).toBe(500);
    readFile.mockRestore();
  });
});
