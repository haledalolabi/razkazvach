import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const baseDir = process.env.ASSETS_DIR || "./uploads";

export async function GET(
  _req: Request,
  { params }: { params: { key: string[] } },
) {
  const filePath = path.join(baseDir, ...params.key);
  try {
    const stream = fs.createReadStream(filePath);
    return new NextResponse(stream as unknown as BodyInit);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
