import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname.startsWith("/admin")) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "ADMIN" && role !== "EDITOR")) {
      const signInUrl = new URL("/auth/signin", url);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
