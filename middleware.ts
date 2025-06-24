import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/refresh",
  ];

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard"];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // For API routes, let them handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // For public routes, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For the root path, let the page component handle the redirect
  if (pathname === "/") {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (isProtectedRoute) {
    // In a real implementation, you would check for valid tokens here
    // For now, we'll let the client-side handle authentication
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
