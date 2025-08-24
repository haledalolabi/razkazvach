import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// Resolve the directory that stores uploaded assets. This path can be
// configured via the `ASSETS_DIR` environment variable. When not provided it
// falls back to `<project root>/uploads`.
const uploadsRoot = process.env.ASSETS_DIR ?? "uploads";
const baseDir = path.resolve(process.cwd(), uploadsRoot);

export async function GET(
  _req: Request,
  { params }: { params: { key: string[] } },
) {
  const filePath = path.join(baseDir, ...params.key);

  console.log("asset request", {
    cwd: process.cwd(),
    uploadsRoot,
    baseDir,
    filePath,
  });

  const relative = path.relative(baseDir, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      return new NextResponse("Not found", { status: 404 });
    }

    console.error(err);
    return new NextResponse("Error", { status: 500 });
  }
}
