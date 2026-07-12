"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Bell, Sun, Moon, User, Settings,
  LogOut, Globe, CreditCard, ChevronRight, Command,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function Topbar() {
  const { user, tenant, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => { setShowUserMenu(false); }, [pathname]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
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

  return (
    <header className="h-14 flex items-center gap-4 px-5 sticky top-0 z-30 border-b border-[var(--color-surface-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
      {/* Left: Greeting */}
      <p className="hidden lg:block text-[13px] font-medium text-[var(--color-ink-muted)] whitespace-nowrap flex-shrink-0">
        {greeting()}
      </p>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="flex items-center gap-3 h-9 px-3.5 rounded-xl cursor-text border border-[var(--color-surface-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface)] transition-all duration-200 group">
          <Search size={14} strokeWidth={2} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink-muted)] flex-shrink-0 transition-colors" />
          <span className="text-[13px] text-[var(--color-ink-subtle)] flex-1 select-none">Search anything...</span>
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            <kbd className="flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-semibold text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] bg-[var(--color-surface)]">
              <Command size={9} strokeWidth={2.5} />
            </kbd>
            <kbd className="flex items-center justify-center px-1.5 h-5 rounded-md text-[10px] font-semibold text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] bg-[var(--color-surface)]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150">
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-surface)]" />
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
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs select-none bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]">
                {user?.full_name?.[0] || "U"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-surface)]" />
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
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base select-none bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]">
                      {user?.full_name?.[0] || "U"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-surface)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate leading-tight">{user?.full_name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate leading-tight mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                      <span className="text-[11px] text-[var(--color-success-text)] font-medium">Active</span>
                      <span className="text-[var(--color-surface-border)]">·</span>
                      <span className="text-[11px] text-[var(--color-ink-subtle)] capitalize">{user?.role?.replace("_", " ")}</span>
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
