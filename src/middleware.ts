// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];
const AUTH_ROUTES = ["/dashboard", "/super-admin"];

// ✅ ATTACK PATTERNS — blocked at the edge, never reach serverless functions.
// Catches WordPress probes, PHP shells, scanner signatures.
const ATTACK_PATTERNS: RegExp[] = [
  /wp-.*\.php$/i,           // wp-configs.php, wp-login.php, wp-trackback.php
  /xmlrpc\.php$/i,          // WordPress XML-RPC
  /adminer\.php$/i,         // DB admin tools
  /phpmyadmin/i,            // phpMyAdmin probes
  /\.php$/i,                // Any PHP file (this is a Next.js app)
  /shell\.php$/i,           // Common shells
  /c99\.php$/i,             // C99 shell
  /r57\.php$/i,             // R57 shell
  /\.env$/i,                // Env file probes
  /\.git/i,                 // Git directory probes
  /\.svn/i,                 // SVN probes
  /composer\.json$/i,       // Composer config
  /\.bak$/i,                // Backup probes
  /\.old$/i,                // Old file probes
  /\.sql$/i,                // SQL dump probes
  /\.DS_Store$/i,           // macOS metadata
  /Thumbs\.db$/i,           // Windows thumbnail cache
  /this_is_a_new_hello_world/i, // Known scanner signature
  /222\.php$/i,             // Known scanner signature
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ EDGE BLOCK: attack patterns → fast 404, never hits app
  for (const pattern of ATTACK_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if user has a valid token in cookies
  const token = request.cookies.get("rm_token")?.value;
  const isAuthenticated = !!token;

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route requires authentication
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect authenticated users away from public routes
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (isAuthRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
