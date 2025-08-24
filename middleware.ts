import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  if (nextUrl.pathname.startsWith("/admin")) {
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "ADMIN" && role !== "EDITOR")) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
  }
});

export const config = { matcher: ["/admin/:path*"] };
