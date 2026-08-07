// src/components/layout/TopBar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Bell, Sun, Moon, User, Settings,
  LogOut, ChevronRight, Command,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

/**
 * @component Topbar
 * @description 
 * The global top navigation bar. Handles search UI, theme toggling, 
 * notifications, and the user profile dropdown.
 * 
 * 📱 MOBILE OPTIMIZATION (Phase 1):
 * - Height: h-12 on mobile (48px), h-14 on desktop (56px)
 * - Search: Hidden on mobile (Phase 2: icon trigger)
 * - Theme toggle: Hidden on mobile (moved to Settings)
 * - Greeting/User name: Already responsive via existing Tailwind classes
 */
export default function Topbar() {
  const { user, tenant, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ─── THEME INITIALIZATION ──────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const isCurrentlyDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(isCurrentlyDark);
    
    if (isCurrentlyDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ─── EVENT LISTENERS (MEMORY LEAK FIX) ─────────────────────────────────────
  
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowUserMenu(false);
    }
  }, []);

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowUserMenu(false);
    }
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showUserMenu, handleClickOutside, handleEscapeKey]);

  // Close menu automatically when navigating to a new route
  useEffect(() => { 
    setShowUserMenu(false); 
  }, [pathname]);

  // ─── HANDLERS & HELPERS ────────────────────────────────────────────────────

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const companyName = user?.role === "super_admin" ? "Rental Manager" : tenant?.name || "Agency";
  
  const greeting = () => {
    const h = new Date().getHours();
    const name = user?.full_name?.split(" ")[0] || "there";
    if (h < 12) return `Good morning, ${name}`;
    if (h < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const isSuperAdmin = user?.role === "super_admin";

  const renderAvatar = (size: "sm" | "md") => {
    const dims = size === "sm" ? "w-7 h-7" : "w-11 h-11";
    const iconSize = size === "sm" ? 14 : 20;
    
    if (user?.avatar_url) {
      return (
        <img 
          src={user.avatar_url} 
          alt={user.full_name || "User"} 
          className={`${dims} rounded-full object-cover border border-[var(--color-surface-border)]`} 
        />
      );
    }
    
    return (
      <div className={`${dims} rounded-full flex items-center justify-center text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]`}>
        <User size={iconSize} strokeWidth={1.8} />
      </div>
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    // ✅ MOBILE HEIGHT: h-12 (48px) on mobile, h-14 (56px) on desktop
    // ✅ MOBILE PADDING: px-4 (16px) on mobile, px-5 (20px) on desktop
    <header className="h-12 sm:h-14 flex items-center gap-4 px-4 sm:px-5 sticky top-0 z-20 border-b border-[var(--color-surface-border)] bg-[var(--color-bg)] backdrop-blur-xl transition-colors duration-300">
      
      {/* Left: Greeting - Already hidden on mobile via existing lg:block class */}
      <p className="hidden lg:block text-[13px] font-medium text-[var(--color-ink-muted)] whitespace-nowrap flex-shrink-0">
        {greeting()}
      </p>

      {/* Center: Search - Hidden on mobile (Phase 2: icon trigger) */}
      <div className="hidden sm:flex flex-1 max-w-xl mx-auto">
        <div className="flex items-center gap-3 h-9 px-3.5 rounded-xl cursor-text border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-hover)] transition-all duration-200 group">
          <Search size={14} strokeWidth={2} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink-muted)] flex-shrink-0 transition-colors" />
          <span className="text-[13px] text-[var(--color-ink-subtle)] flex-1 select-none">Search anything...</span>
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            <kbd className="flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-semibold text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
              <Command size={9} strokeWidth={2.5} />
            </kbd>
            <kbd className="flex items-center justify-center px-1.5 h-5 rounded-md text-[10px] font-semibold text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Theme Toggle - Hidden on mobile (moved to Settings) */}
        <button
          onClick={toggleTheme}
          className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150">
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-bg)]" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-surface-border)] mx-1" />

        {/* User Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-[var(--color-surface-hover)] transition-all duration-150 group"
          >
            <div className="relative flex-shrink-0">
              {renderAvatar("sm")}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-bg)]" />
            </div>
            <span className="hidden md:block text-[13px] font-medium text-[var(--color-ink)] max-w-[100px] truncate">
              {user?.full_name?.split(" ")[0]}
            </span>
            <ChevronRight size={13} strokeWidth={2.5} className={`hidden md:block text-[var(--color-ink-subtle)] transition-transform duration-200 ${showUserMenu ? "rotate-90" : ""}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in slide-up fade-in duration-200">
              {/* User Info Header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {renderAvatar("md")}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-surface)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate leading-tight">{user?.full_name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate leading-tight mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                      <span className="text-[11px] text-[var(--color-success-text)] font-medium">Active</span>
                      <span className="text-[var(--color-surface-border)]">·</span>
                      <span className="text-[11px] text-[var(--color-ink-subtle)] capitalize">
                        {user?.job_title || (user?.role === "tenant_admin" ? "Administrator" : user?.role?.replace("_", " "))}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]">
                    {companyName[0]}
                  </div>
                  <p className="text-[12px] font-medium text-[var(--color-primary-text)] truncate">{companyName}</p>
                </div>
              </div>

              <div className="h-px bg-[var(--color-surface-border)] mx-3" />

              {/* Menu Items */}
              <div className="px-2 py-2">
                <Link href={isSuperAdmin ? `/super-admin/users/${user?.id}` : `/dashboard/users/${user?.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all duration-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <User size={14} strokeWidth={1.8} className="text-[var(--color-ink-muted)]" />
                  </div>
                  <span className="flex-1 font-medium">View Profile</span>
                </Link>
                <Link href={isSuperAdmin ? "/super-admin/settings" : "/dashboard/settings"} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all duration-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <Settings size={14} strokeWidth={1.8} className="text-[var(--color-ink-muted)]" />
                  </div>
                  <span className="flex-1 font-medium">Settings</span>
                </Link>
              </div>

              <div className="h-px bg-[var(--color-surface-border)] mx-3" />

              {/* Sign Out */}
              <div className="px-2 py-2">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-all duration-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20">
                    <LogOut size={14} strokeWidth={1.8} className="text-[var(--color-danger-text)]" />
                  </div>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
