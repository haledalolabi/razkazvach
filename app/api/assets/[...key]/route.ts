import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(_: Request, ctx: { params: { key: string[] } }) {
  const key = ctx.params.key.join("/");
  const baseDir = process.env.ASSETS_DIR || "./uploads";
  const filePath = path.join(baseDir, key);
  if (!fs.existsSync(filePath))
    return new NextResponse("Not found", { status: 404 });
  const stream = fs.createReadStream(filePath);
  return new NextResponse(stream as unknown as BodyInit);
}
