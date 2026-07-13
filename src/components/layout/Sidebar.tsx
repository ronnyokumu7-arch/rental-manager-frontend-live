// src/components/layout/Sidebar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, Settings, type LucideIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { NavItem } from "@/lib/nav-config";

interface SidebarProps {
  navItems: NavItem[];
}

export default function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<number>(0);
  const [hoveredItem, setHoveredItem] = useState<{ label: string; top: number } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setHoveredItem(null);
  }, [pathname]);

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

  const handleGroupClick = (label: string, el: HTMLButtonElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setFlyoutPos(rect.top);
    setOpenGroup(openGroup === label ? null : label);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const openGroupItem = navItems.find((i) => i.label === openGroup);

  // Separate settings from other nav items
  const settingsItem = navItems.find(item => item.label === "Settings");
  const regularNavItems = navItems.filter(item => item.label !== "Settings");

  return (
    <>
      {/* ✅ STRICTLY VARIABLE-DRIVEN SIDEBAR RAIL */}
      <aside 
        ref={sidebarRef} 
        className="h-full w-20 flex flex-col flex-shrink-0 
                   bg-[var(--color-bg)] 
                   border-r border-[var(--color-surface-border)] 
                   transition-colors duration-300"
      >
        {/* Logo - Removed divider */}
        <div className="h-16 flex items-center justify-center flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px] text-white tracking-tight select-none bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            RM
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 px-3 py-6 overflow-y-auto custom-scrollbar">
          {regularNavItems.map((item) => {
            const active = isActive(item.href, item.children);
            const isGroupOpen = openGroup === item.label;
            const Icon = item.icon as LucideIcon;
            
            return (
              <div key={item.label} className="relative group/nav">
                {item.href && !item.children ? (
                  <Link
                    href={item.href}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem({ label: item.label, top: rect.top });
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`relative flex items-center justify-center w-full h-12 rounded-xl transition-all duration-200 outline-none group/btn ${
                      active
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    {/* Active Indicator Line */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}
                    <Icon size={20} strokeWidth={active ? 2.2 : 1.8} className="transition-all" />
                  </Link>
                ) : (
                  <button
                    ref={(el) => { buttonRefs.current[item.label] = el; }}
                    onClick={() => handleGroupClick(item.label, buttonRefs.current[item.label])}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem({ label: item.label, top: rect.top });
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`relative flex items-center justify-center w-full h-12 rounded-xl transition-all duration-200 outline-none group/btn ${
                      isGroupOpen
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    {isGroupOpen && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}
                    <Icon size={20} strokeWidth={isGroupOpen ? 2.2 : 1.8} className="transition-all" />
                    {/* Group Indicator Dot */}
                    <span className={`absolute bottom-2 right-2 w-[5px] h-[5px] rounded-full transition-all ${
                      isGroupOpen 
                        ? "bg-[var(--color-primary)] shadow-[0_0_6px_rgba(99,102,241,0.8)]" 
                        : "bg-[var(--color-ink-subtle)]"
                    }`} />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Settings & Logout Section */}
        <div className="px-3 pb-6 flex-shrink-0 space-y-2">
          {/* Settings Button with Unique Animation */}
          {settingsItem && (
            <Link
              href={settingsItem.href || "#"}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({ label: settingsItem.label, top: rect.top });
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative flex items-center justify-center w-full h-12 rounded-xl transition-all duration-200 outline-none group/btn text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
            >
              <Settings 
                size={20} 
                strokeWidth={1.8} 
                className="transition-all duration-500 group-hover/btn:rotate-[180deg] group-hover/btn:scale-110" 
              />
            </Link>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="group/logout relative flex items-center justify-center w-full h-12 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-all duration-300"
            title="Sign out"
          >
            <LogOut size={20} strokeWidth={1.8} className="relative z-10 transition-transform duration-300 group-hover/logout:translate-x-1" />
          </button>
        </div>
      </aside>

      {/* ✅ STRICTLY VARIABLE-DRIVEN TOOLTIP */}
      {hoveredItem && !openGroup && (
        <div
          className="pointer-events-none fixed whitespace-nowrap text-[12px] font-bold px-3 py-1.5 rounded-lg z-[9999] 
                     bg-[var(--color-ink)] text-[var(--color-surface)]
                     shadow-[var(--shadow-dropdown)] animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: "88px",
            top: `${hoveredItem.top}px`,
            transform: "translateY(-50%)",
          }}
        >
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--color-ink)]" />
          {hoveredItem.label}
        </div>
      )}

      {/* ✅ STRICTLY VARIABLE-DRIVEN FLYOUT PANEL */}
      {openGroup && openGroupItem?.children && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenGroup(null)} />
          <div
            className="fixed z-[9999] w-[260px] overflow-y-auto animate-in slide-in-from-left-2 fade-in duration-200 custom-scrollbar"
            style={{
              left: "88px",
              top: `${flyoutPos}px`,
              maxHeight: "calc(100vh - 4rem)",
            }}
          >
            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-dropdown)] backdrop-blur-xl">
              {/* Flyout Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--color-surface-border)]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                  {openGroupItem.icon && <openGroupItem.icon size={16} strokeWidth={2} className="text-[var(--color-primary)]" />}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                  {openGroupItem.label}
                </p>
              </div>
              
              {/* Flyout Items */}
              <div className="space-y-1">
                {openGroupItem.children.map((child) => {
                  const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group/child ${
                        childActive 
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                          : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                        childActive 
                          ? "bg-[var(--color-primary)] shadow-[0_0_6px_rgba(99,102,241,0.8)]" 
                          : "bg-[var(--color-ink-subtle)]"
                      }`} />
                      <span className="flex-1">{child.label}</span>
                      {childActive && <ChevronRight size={14} strokeWidth={2.5} className="text-[var(--color-primary)]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
