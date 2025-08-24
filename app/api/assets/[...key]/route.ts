import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const baseDir = process.env.ASSETS_DIR || "./uploads";

export async function GET(
  _req: Request,
  { params }: { params: { key: string[] } },
) {
  const filePath = path.join(baseDir, ...params.key);
  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
