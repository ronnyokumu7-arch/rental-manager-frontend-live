// src/components/layout/DashboardShell.tsx
"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import BottomNav from "./BottomNav";
import type { NavItem } from "@/lib/nav-config";

interface DashboardShellProps {
  children: ReactNode;
  navItems: NavItem[];
}

export default function DashboardShell({ children, navItems }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] flex transition-colors duration-300">
      {/* Global Toast Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-[var(--color-surface)] !text-[var(--color-ink)] !border !border-[var(--color-surface-border)] !shadow-[var(--shadow-dropdown)] !rounded-xl",
          duration: 3000,
        }}
      />

      {/* Desktop Sidebar - Hidden on mobile/tablet (<1024px) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-[72px]">
        <Sidebar navItems={navItems} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[72px]">
        <Topbar />
        {/* 
          ✅ MOBILE PADDING STRATEGY:
          - pb-[calc(6rem+env(safe-area-inset-bottom,0px))] = 96px (existing) + iOS safe area
          - 96px accommodates: BottomNav (~56px) + FAB spacing (16px) + buffer (24px)
          - env() fallback to 0px ensures Android/older iOS compatibility
          - lg:pb-8 restores desktop spacing
        */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav - Visible only on mobile/tablet (<1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav navItems={navItems} />
      </div>
    </div>
  );
}
