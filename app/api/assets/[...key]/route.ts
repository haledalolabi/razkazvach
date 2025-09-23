import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { lookup as getMimeType } from "mime-types";

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
    const mimeType = getMimeType(filePath) || "application/octet-stream";
    return new NextResponse(file, {
      headers: { "Content-Type": mimeType },
    });
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    const code = error?.code;

    console.error("asset readFile error", { filePath, code, err });

    const devBody = JSON.stringify({
      filePath,
      code,
      message: error?.message,
    });

    if (code === "ENOENT") {
      return new NextResponse(
        process.env.NODE_ENV === "development" ? devBody : "Not found",
        { status: 404 },
      );
    }

    return new NextResponse(
      process.env.NODE_ENV === "development" ? devBody : "Error",
      { status: 500 },
    );
  }
}
