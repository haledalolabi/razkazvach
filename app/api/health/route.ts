import { NextResponse } from "next/server";
export const GET = async () =>
  NextResponse.json({ ok: true, name: "razkazvach", version: "0.1.0" });
