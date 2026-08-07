// src/components/layout/DashboardShell.tsx
"use client";

import { ReactNode } from "react";
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
    // ✅ REMOVED bg-[var(--color-bg)] to allow layout.tsx ambient glows to show through
    <div className="min-h-screen text-[var(--color-ink)] flex transition-colors duration-300">
      
      {/* Desktop Sidebar - Hidden on mobile/tablet (<1024px) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-[72px]">
        <Sidebar navItems={navItems} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[72px]">
        <Topbar />
        
        {/* 
          ✅ MOBILE PADDING STRATEGY:
          - pb-[calc(5rem+env(safe-area-inset-bottom,0px))]: 80px bottom nav + safe area
          - px-4 sm:px-6 lg:px-8: Consistent horizontal padding
        */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
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
