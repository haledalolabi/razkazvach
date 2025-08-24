import { NextResponse } from "next/server";
import { searchStories } from "@/lib/search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json({ hits: [] });
  const result = await searchStories(q);
  return NextResponse.json(result);
}
