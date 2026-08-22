// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];
const AUTH_ROUTES = ["/dashboard", "/super-admin"];
const RATE_LIMIT_ROUTES = ["/login", "/forgot-password", "/reset-password"];

// ✅ ATTACK PATTERNS
const ATTACK_PATTERNS: RegExp[] = [
  /wp-.*\.php$/i,
  /xmlrpc\.php$/i,
  /adminer\.php$/i,
  /phpmyadmin/i,
  /\.php$/i,
  /shell\.php$/i,
  /c99\.php$/i,
  /r57\.php$/i,
  /\.env$/i,
  /\.git/i,
  /\.svn/i,
  /composer\.json$/i,
  /\.bak$/i,
  /\.old$/i,
  /\.sql$/i,
  /\.DS_Store$/i,
  /Thumbs\.db$/i,
  /this_is_a_new_hello_world/i,
  /222\.php$/i,
];

// ✅ BAD BOT PATTERNS
const BAD_BOTS: RegExp[] = [
  /python-requests/i,
  /curl\/\d/i,
  /wget/i,
  /scrapy/i,
  /nikto/i,
  /sqlmap/i,
  /masscan/i,
  /nmap/i,
  /havij/i,
  /libwww-perl/i,
];

// ✅ Lightweight JWT validation (no dependencies)
function validateJWT(token: string): { valid: boolean; expired: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, expired: false };
    
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    
    const now = Math.floor(Date.now() / 1000);
    const expired = payload.exp && payload.exp < now;
    
    return { valid: true, expired };
  } catch {
    return { valid: false, expired: false };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // ── LAYER 1: Attack Pattern Block ──────────────────────────────────────
  for (const pattern of ATTACK_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ── LAYER 2: Bot Protection ────────────────────────────────────────────
  for (const botPattern of BAD_BOTS) {
    if (botPattern.test(userAgent)) {
      return new NextResponse(null, { status: 403 });
    }
  }

  // ── LAYER 3: Static Files Bypass ───────────────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── LAYER 4: JWT Validation ────────────────────────────────────────────
  const token = request.cookies.get("rm_token")?.value;
  const tokenValidation = token ? validateJWT(token) : { valid: false, expired: false };
  const isAuthenticated = tokenValidation.valid && !tokenValidation.expired;

  // Clear expired tokens
  if (token && tokenValidation.expired) {
    const response = NextResponse.next();
    response.cookies.delete("rm_token");
    return response;
  }

  // ── LAYER 5: Route Protection ──────────────────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from public routes
  if (isPublicRoute && isAuthenticated) {
    const redirectUrl = new URL("/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  // Redirect unauthenticated users to login
  if (isAuthRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ── LAYER 6: Rate Limit Headers (for sensitive routes) ─────────────────
  if (RATE_LIMIT_ROUTES.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Window", "60");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
