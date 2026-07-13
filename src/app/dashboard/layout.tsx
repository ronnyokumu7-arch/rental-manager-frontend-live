// src/app/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import DashboardShell from "@/components/layout/DashboardShell";
import { tenantAdminNav } from "@/lib/nav-config";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    
    // Redirect super admins to their dashboard
    if (user?.role === "super_admin") {
      router.replace("/super-admin");
      return;
    }
    
    // Block inactive/suspended users
    if (!user?.is_active || user.is_suspended) {
      router.replace("/login");
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] dark:bg-[#0B0D14]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
      </div>
    );
  }

  // Don't render anything if not authenticated (redirecting)
  if (!isAuthenticated) return null;

  return (
    <DashboardShell navItems={tenantAdminNav}>
      {children}
    </DashboardShell>
  );
}
