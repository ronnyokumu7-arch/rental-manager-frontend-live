// src/components/AuthGuard.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

// Define routes that do NOT require authentication
// (Pulled directly from your README's Authentication Routes)
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/invite",
];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if the current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    // ✅ FIXED: Race Condition Redirect
    // If auth is done loading, user is NOT authenticated, and they are on a private route
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      // We use `replace` instead of `push` so the browser's "Back" button 
      // doesn't trap them in a redirect loop.
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router]);

  // 1. ✅ FIXED: The Loading State (Prevents Null Check Crashes)
  // While the app is checking the token with the backend, we show a spinner.
  // This prevents child components from rendering with partial/incomplete auth state.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // 2. If they are unauthenticated on a private route, render nothing while the redirect happens
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // 3. If they are authenticated OR on a public route, render the page safely
  return <>{children}</>;
}
