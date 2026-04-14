import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/",
  "/pedidos",
  "/reposicion",
  "/desarrollo",
  "/perfil",
  
];

const AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Redirect to login if accessing protected route without token
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if already authenticated and on auth page
  if (isAuthPage && token) {
    const nextUrl = request.nextUrl.searchParams.get("next") || "/";
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (icons, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
