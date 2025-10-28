import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/_next", "/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (login page, static, etc.)
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Check for admin_token cookie
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    // Redirect to login page if not authenticated
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access if authenticated
  return NextResponse.next();
}