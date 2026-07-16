import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

export default async function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl;

  // Protect /dashboard and all subroutes
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      // No session cookie, redirect to login page
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await decrypt(sessionCookie);
    if (!payload) {
      // Invalid/expired session, clear cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }

    // Authorized session
    return NextResponse.next();
  }

  // Redirect authenticated user away from login page to dashboard
  if (pathname === "/login") {
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      const payload = await decrypt(sessionCookie);
      if (payload) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
