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

  // Close menu on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Close on route change
  useEffect(() => { setShowUserMenu(false); }, [pathname]);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const companyName =
    user?.role === "super_admin" ? "Rental Manager" : tenant?.name || "Agency";

  const greeting = () => {
    const h = new Date().getHours();
    const name = user?.full_name?.split(" ")[0] || "there";
    if (h < 12) return `Good morning, ${name}`;
    if (h < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const isSuperAdmin = user?.role === "super_admin";

  const menuItems = [
    {
      group: "account",
      items: [
        {
          label: "View Profile",
          icon: User,
          href: isSuperAdmin ? "/super-admin/profile" : "/dashboard/profile",
        },
        ...(!isSuperAdmin
          ? [{ label: "Upgrade Plan", icon: CreditCard, href: "/dashboard/settings/plan", accent: true }]
          : []),
        { label: "Language — EN", icon: Globe, href: null, disabled: true },
        {
          label: "Settings",
          icon: Settings,
          href: isSuperAdmin ? "/super-admin/settings" : "/dashboard/settings",
        },
      ],
    },
  ];

  return (
    <header
      className="h-14 flex items-center gap-4 px-5 sticky top-0 z-30 border-b border-[#e2e6f0]"
      style={{
        background: "rgba(248,249,252,0.88)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* ── Left: greeting ──────────────────────────── */}
      <p className="hidden lg:block text-[13px] font-medium text-[#6b7280] whitespace-nowrap flex-shrink-0">
        {greeting()}
      </p>

      {/* ── Center: global search ────────────────────── */}
      <div className="flex-1 max-w-xl mx-auto">
        <div
          className="flex items-center gap-3 h-9 px-3.5 rounded-xl cursor-text
            border border-[#e2e6f0] bg-white/70
            hover:border-[#64b5f6]/60 hover:bg-white
            transition-all duration-200 group"
        >
          <Search
            size={14}
            strokeWidth={2}
            className="text-[#9ca3af] group-hover:text-[#6b7280] flex-shrink-0 transition-colors"
          />
          <span className="text-[13px] text-[#9ca3af] flex-1 select-none">
            Search anything...
          </span>
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            <kbd
              className="flex items-center justify-center w-5 h-5 rounded-md text-[10px]
                font-semibold text-[#9ca3af] border border-[#e2e6f0] bg-[#f8f9fc]"
            >
              <Command size={9} strokeWidth={2.5} />
            </kbd>
            <kbd
              className="flex items-center justify-center px-1.5 h-5 rounded-md text-[10px]
                font-semibold text-[#9ca3af] border border-[#e2e6f0] bg-[#f8f9fc]"
            >
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── Right: controls ──────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-[#6b7280] hover:bg-[#f0f2f8] hover:text-[#1a1a2e]
            transition-all duration-150"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark
            ? <Sun size={17} strokeWidth={1.8} />
            : <Moon size={17} strokeWidth={1.8} />
          }
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center
            text-[#6b7280] hover:bg-[#f0f2f8] hover:text-[#1a1a2e]
            transition-all duration-150"
        >
          <Bell size={17} strokeWidth={1.8} />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#ef4444]
              ring-2 ring-[rgba(248,249,252,0.88)]"
          />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#e2e6f0] mx-1" />

        {/* Avatar + user menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl
              hover:bg-[#f0f2f8] transition-all duration-150 group"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center
                  text-white font-semibold text-xs select-none"
                style={{
                  background: "linear-gradient(135deg, #1e6fba 0%, #64b5f6 100%)",
                }}
              >
                {user?.full_name?.[0] || "U"}
              </div>
              {/* Status dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                  bg-green-400 ring-2 ring-[rgba(248,249,252,0.88)]"
              />
            </div>
            {/* Name — desktop only */}
            <span className="hidden md:block text-[13px] font-medium text-[#1a1a2e]
              group-hover:text-[#1a1a2e] max-w-[100px] truncate">
              {user?.full_name?.split(" ")[0]}
            </span>
            <ChevronRight
              size={13}
              strokeWidth={2.5}
              className={`hidden md:block text-[#9ca3af] transition-transform duration-200
                ${showUserMenu ? "rotate-90" : ""}`}
            />
          </button>

          {/* ── Premium user menu ──────────────────── */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-[260px] rounded-2xl
                animate-[slideUp_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(226,230,240,0.8)",
                boxShadow:
                  "0 0 0 1px rgba(30,111,186,0.06), 0 20px 48px rgba(26,26,46,0.14), 0 8px 16px rgba(26,26,46,0.06)",
                zIndex: 9999,
              }}
            >
              {/* User info header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center
                        text-white font-bold text-base select-none"
                      style={{
                        background: "linear-gradient(135deg, #1e6fba 0%, #64b5f6 100%)",
                      }}
                    >
                      {user?.full_name?.[0] || "U"}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                        bg-green-400 ring-2 ring-white"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a2e] truncate leading-tight">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-[#6b7280] truncate leading-tight mt-0.5">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-[11px] text-green-600 font-medium">Active</span>
                      <span className="text-[#e2e6f0]">·</span>
                      <span className="text-[11px] text-[#9ca3af] capitalize">
                        {user?.role?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company chip */}
                <div
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%)",
                    border: "1px solid rgba(30,111,186,0.12)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center
                      text-white font-bold text-[10px] flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #1e6fba 0%, #64b5f6 100%)",
                    }}
                  >
                    {companyName[0]}
                  </div>
                  <p className="text-[12px] font-medium text-[#1e6fba] truncate">
                    {companyName}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#f0f2f8] mx-3" />

              {/* Menu items */}
              <div className="px-2 py-2">
                {menuItems[0].items.map((item, i) => {
                  const Icon = item.icon;
                  const isDisabled = "disabled" in item && item.disabled;
                  const isAccent = "accent" in item && item.accent;
                  const content = (
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                        text-[13px] transition-all duration-100
                        ${isDisabled
                          ? "opacity-40 cursor-not-allowed"
                          : isAccent
                          ? "text-[#1e6fba] hover:bg-[#e8f4fd] cursor-pointer"
                          : "text-[#374151] hover:bg-[#f0f2f8] cursor-pointer"
                        }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                          ${isAccent ? "bg-[#e8f4fd]" : "bg-[#f8f9fc]"}`}
                        style={{ border: "1px solid rgba(226,230,240,0.8)" }}
                      >
                        <Icon
                          size={14}
                          strokeWidth={1.8}
                          className={isAccent ? "text-[#1e6fba]" : "text-[#6b7280]"}
                        />
                      </div>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {isAccent && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full
                            text-white"
                          style={{ background: "linear-gradient(135deg, #1e6fba, #64b5f6)" }}
                        >
                          PRO
                        </span>
                      )}
                    </div>
                  );
                  return item.href && !isDisabled ? (
                    <Link key={i} href={item.href}>{content}</Link>
                  ) : (
                    <div key={i}>{content}</div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#f0f2f8] mx-3" />

              {/* Sign out */}
              <div className="px-2 py-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-[13px] font-medium text-[#b91c1c]
                    hover:bg-[#fee2e2] transition-all duration-100"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#fee2e2]"
                    style={{ border: "1px solid rgba(239,68,68,0.15)" }}
                  >
                    <LogOut size={14} strokeWidth={1.8} className="text-[#b91c1c]" />
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
