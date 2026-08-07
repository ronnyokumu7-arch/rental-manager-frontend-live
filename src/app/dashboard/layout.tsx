// src/app/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import DashboardShell from "@/components/layout/DashboardShell";
import { tenantAdminNav } from "@/lib/nav-config";
import AuthGuard from "@/components/AuthGuard"; // ✅ NEW: Import the guard

/**
 * @component DashboardLayout
 * @description 
 * The unified shell for all tenant/admin dashboard routes.
 * 
 * Architecture:
 * 1. Wraps children in `AuthGuard` to ensure baseline authentication 
 *    and prevent null-reference crashes from incomplete auth state.
 * 2. Handles tenant-specific business logic:
 *    - Redirects Super Admins to their dedicated shell (`/super-admin`).
 *    - Blocks inactive or suspended users.
 * 3. Renders the `DashboardShell` with the tenant navigation configuration.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  /**
   * ✅ BUSINESS LOGIC GUARD
   * While AuthGuard handles "is the user logged in?", this useEffect 
   * handles "is the user allowed in the TENANT dashboard?".
   */
  useEffect(() => {
    // Wait for AuthGuard/AuthContext to finish loading.
    // ✅ FIXED: Added `!user` check to prevent reading properties of null 
    // during the brief moment between loading finishing and state updating.
    if (isLoading || !isAuthenticated || !user) return;
    
    // 1. Redirect super admins to their dedicated environment
    if (user.role === "super_admin") {
      router.replace("/super-admin");
      return;
    }
    
    // 2. Block inactive or suspended users
    if (!user.is_active || user.is_suspended) {
      // Optional: You could redirect to a specific "suspended" page instead
      router.replace("/login?reason=suspended");
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    // ✅ WRAPPED IN AUTHGUARD
    // AuthGuard will show a spinner while `isLoading` is true,
    // and redirect to /login if `isAuthenticated` is false.
    // This eliminates the need for manual loading/null checks in this file,
    // adhering to the DRY (Don't Repeat Yourself) principle.
    <AuthGuard>
      <DashboardShell navItems={tenantAdminNav}>
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
