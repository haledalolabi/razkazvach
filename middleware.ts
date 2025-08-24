import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname.startsWith("/admin")) {
    const token = await getToken({ req });
    const role = (token as { role?: string } | null)?.role;
    if (!role || (role !== "ADMIN" && role !== "EDITOR")) {
      const signInUrl = new URL("/auth/signin", url);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
