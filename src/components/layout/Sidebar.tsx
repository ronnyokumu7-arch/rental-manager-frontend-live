"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, type LucideIcon } from "lucide-react";
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

  return (
    <>
      <aside ref={sidebarRef} className="h-full w-full flex flex-col bg-sidebar border-r border-white/5">
        {/* Logo */}
        <div className="h-14 flex items-center justify-center flex-shrink-0 border-b border-white/5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center font-black text-[11px] text-white tracking-tight select-none bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            RM
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2.5 py-4 overflow-y-auto">
          {navItems.map((item) => {
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
                    className={`relative flex items-center justify-center w-full h-11 rounded-[11px] transition-all duration-200 outline-none group/btn ${
                      active
                        ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}
                    <Icon size={19} strokeWidth={active ? 2 : 1.6} />
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
                    className={`relative flex items-center justify-center w-full h-11 rounded-[11px] transition-all duration-200 outline-none group/btn ${
                      isGroupOpen
                        ? "bg-white/10 text-white"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {isGroupOpen && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}
                    <Icon size={19} strokeWidth={isGroupOpen ? 2 : 1.6} />
                    <span className={`absolute bottom-1.5 right-1.5 w-[5px] h-[5px] rounded-full transition-colors ${isGroupOpen ? "bg-[var(--color-primary)] shadow-[0_0_6px_rgba(99,102,241,0.7)]" : "bg-white/20"}`} />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2.5 pb-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="group/logout relative flex items-center justify-center w-full h-11 rounded-xl text-white/40 hover:text-white overflow-hidden transition-all duration-300"
            title="Sign out"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-rose-500/20 translate-x-[-100%] group-hover/logout:translate-x-0 transition-transform duration-500 ease-out" />
            <div className="absolute inset-0 rounded-xl border border-transparent group-hover/logout:border-rose-500/30 transition-colors duration-300" />
            <LogOut size={19} strokeWidth={1.8} className="relative z-10 transition-transform duration-300 group-hover/logout:translate-x-1.5 group-hover/logout:text-rose-400" />
          </button>
        </div>
      </aside>

      {/* Tooltip */}
      {hoveredItem && !openGroup && (
        <div
          className="pointer-events-none fixed whitespace-nowrap text-[12px] font-semibold text-white px-3 py-1.5 rounded-xl z-[9999] bg-[#0d1325] border border-white/10 shadow-xl animate-in fade-in duration-150"
          style={{
            left: "84px",
            top: `${hoveredItem.top}px`,
            transform: "translateY(-50%)",
          }}
        >
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0d1325]" />
          {hoveredItem.label}
        </div>
      )}

      {/* Flyout Panel */}
      {openGroup && openGroupItem?.children && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenGroup(null)} />
          <div
            className="fixed z-[9999] w-[240px] overflow-y-auto animate-in slide-in-from-left-2 fade-in duration-200"
            style={{
              left: "80px",
              top: `${flyoutPos}px`,
              maxHeight: "calc(100vh - 4rem)",
              background: "linear-gradient(145deg, rgba(12,18,32,0.98) 0%, rgba(8,15,28,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.06)",
              backdropFilter: "blur(24px)",
            }}
          >
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                  {openGroupItem.icon && <openGroupItem.icon size={14} strokeWidth={2} className="text-[var(--color-primary)]" />}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                  {openGroupItem.label}
                </p>
              </div>
              <div className="mt-3 h-px bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent" />
            </div>
            <div className="px-2 pb-2">
              {openGroupItem.children.map((child) => {
                const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-100 group/child ${
                      childActive ? "bg-[var(--color-primary)]/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/90"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${childActive ? "bg-[var(--color-primary)] shadow-[0_0_6px_rgba(99,102,241,0.8)]" : "bg-white/20"}`} />
                    <span className="flex-1">{child.label}</span>
                    {childActive && <ChevronRight size={13} strokeWidth={2.5} className="text-[var(--color-primary)]" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
