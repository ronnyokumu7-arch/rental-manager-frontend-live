// src/components/layout/BottomNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";

interface BottomNavProps {
  navItems: NavItem[];
}

export default function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // ✅ Reorder items: Dashboard | Bookings | Fleet | Financials | Clients → More
  const reorderedItems = [...navItems].sort((a, b) => {
    const priority = {
      "dashboard": 0,
      "bookings": 1,
      "fleet": 2,
      "financials": 3,
      "clients": 4, // Push to end so it goes to "More"
    };
    const aKey = a.label.toLowerCase();
    const bKey = b.label.toLowerCase();
    const aPriority = priority[aKey] ?? 99;
    const bPriority = priority[bKey] ?? 99;
    return aPriority - bPriority;
  });

  const mobileItems = reorderedItems.map(item => {
    if (item.children && item.children.length > 0) {
      return { ...item, href: item.children[0].href, icon: item.icon };
    }
    return item;
  });

  // ✅ MOBILE 5-ITEM RULE: First 4 visible, rest in "More"
  const visibleItems = mobileItems.slice(0, 4);
  const moreItems = mobileItems.slice(4);

  return (
    <>
      {/* 
        ✅ ICONS-ONLY MOBILE BOTTOM NAV:
        - Removed text labels, kept original icons from navItems
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
              aria-label={item.label}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            </Link>
          );
        })}

        {/* "More" Button */}
        {moreItems.length > 0 && (
          <button
            onClick={() => setShowMoreDrawer(true)}
            className="flex flex-col items-center justify-center w-16 h-full rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all duration-200"
            aria-label="More options"
          >
            <MoreHorizontal size={22} strokeWidth={1.8} />
          </button>
        )}
      </nav>

      {/* 
        ✅ "MORE" DRAWER - Tile Grid with ORIGINAL icons + captions
      */}
      {mounted && showMoreDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setShowMoreDrawer(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[var(--color-surface)] rounded-t-2xl border-t border-[var(--color-surface-border)] pb-[env(safe-area-inset-bottom,0px)] animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
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

            {/* Tile Grid - Using ORIGINAL icons from navItems */}
            <div className="p-4 grid grid-cols-4 gap-3">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon as LucideIcon; // ✅ Use original icon from prop
                return (
                  <Link
                    key={item.label}
                    href={item.href || "#"}
                    onClick={() => setShowMoreDrawer(false)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all duration-200 ${
                      active
                        ? "bg-[var(--color-primary-muted)]/50 text-[var(--color-primary)]"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Icon size={24} strokeWidth={active ? 2.2 : 1.8} />
                    <span className={`text-[11px] font-medium text-center leading-tight ${active ? "font-semibold" : ""}`}>
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
