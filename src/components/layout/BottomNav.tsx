// src/components/layout/BottomNav.tsx
"use client";

import { useState } from "react"; // ✅ Added for "More" drawer state
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react"; // ✅ Added for "More" UI
import type { LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";

interface BottomNavProps {
  navItems: NavItem[];
}

export default function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false); // ✅ State for "More" drawer

  const isActive = (href?: string, children?: { href: string }[]) => {
    if (children && children.length > 0) {
      return children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
    }
    if (!href) return false;
    if (href === "/dashboard" || href === "/super-admin") {
      return pathname === href || pathname === href + "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const mobileItems = navItems.map(item => {
    if (item.children && item.children.length > 0) {
      return { ...item, href: item.children[0].href, icon: item.icon };
    }
    return item;
  });

  // ✅ MOBILE 5-ITEM RULE: Show first 4 items + "More" button
  // Items beyond index 3 are rendered in the "More" drawer below
  const visibleItems = mobileItems.slice(0, 4);
  const moreItems = mobileItems.slice(4);

  return (
    <>
      {/* 
        ✅ MOBILE BOTTOM NAV:
        - pb-[env(safe-area-inset-bottom,0px)]: iOS home indicator support
        - h-16: Standard 64px height for thumb reach
        - px-2: Minimal horizontal padding for edge-to-edge feel on phones
      */}
      <nav className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom,0px)] bg-[var(--color-surface)]/90 backdrop-blur-xl border-t border-[var(--color-surface-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon as LucideIcon;
          return (
            <Link
              key={item.label}
              href={item.href || "#"}
              className={`flex flex-col items-center justify-center w-16 h-full rounded-xl transition-all duration-200 ${
                active
                  ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]/50"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} className="mb-1" />
              <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* "More" Button - Shows when there are >4 nav items */}
        {moreItems.length > 0 && (
          <button
            onClick={() => setShowMoreDrawer(true)}
            className="flex flex-col items-center justify-center w-16 h-full rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all duration-200"
            aria-label="More options"
          >
            <MoreHorizontal size={20} strokeWidth={1.8} className="mb-1" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        )}
      </nav>

      {/* 
        ✅ "MORE" DRAWER (Phase 1: Basic Implementation)
        - Full-screen overlay for mobile (<640px)
        - Simple list of remaining nav items
        - Phase 2: Convert to bottom-sheet with gestures, haptics, search
      */}
      {showMoreDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden">
          {/* Drawer Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-surface)] rounded-t-2xl border-t border-[var(--color-surface-border)] pb-[env(safe-area-inset-bottom,0px)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)]">
              <span className="text-sm font-semibold text-[var(--color-ink)]">More</span>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} className="text-[var(--color-ink-muted)]" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-2 space-y-1">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon as LucideIcon;
                return (
                  <Link
                    key={item.label}
                    href={item.href || "#"}
                    onClick={() => setShowMoreDrawer(false)} // Close drawer on navigation
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 ${
                      active
                        ? "bg-[var(--color-primary-muted)]/50 text-[var(--color-primary)]"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    <span className={`text-[13px] font-medium ${active ? "font-semibold" : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
