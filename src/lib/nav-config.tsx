// src/lib/nav-config.tsx
"use client";

import {
  LayoutDashboard, Building2, CreditCard, BarChart3, Settings,
  CalendarDays, Contact, Users, Car, Wallet, Server, LifeBuoy,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
}

// ── PREMIUM ICON COMPONENTS ──────────────────────────────────────────────────
// These enhanced icons feature gradients, animations, and theme adaptation

const PremiumDashboardIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <LayoutDashboard size={size} strokeWidth={strokeWidth} className="text-[var(--color-primary)]" />
    <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-md rounded-lg scale-75 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

const PremiumCalendarIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <CalendarDays size={size} strokeWidth={strokeWidth} className="text-[var(--color-primary)]" />
    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-success)] rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 animate-pulse" />
  </div>
);

const PremiumContactIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <Contact size={size} strokeWidth={strokeWidth} className="text-[var(--color-success)]" />
    <div className="absolute inset-0 bg-[var(--color-success)]/20 blur-md rounded-lg scale-75 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

const PremiumCarIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <Car size={size} strokeWidth={strokeWidth} className="text-[var(--color-warning)]" />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-[var(--color-warning)]/40 blur-[2px] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

const PremiumUsersIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <Users size={size} strokeWidth={strokeWidth} className="text-[var(--color-primary)]" />
    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

const PremiumWalletIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <Wallet size={size} strokeWidth={strokeWidth} className="text-[var(--color-success)]" />
    <div className="absolute inset-0 bg-[var(--color-success)]/20 blur-md rounded-lg scale-75 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

const PremiumBarChartIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <BarChart3 size={size} strokeWidth={strokeWidth} className="text-[var(--color-warning)]" />
    <div className="absolute -top-1 right-0 flex gap-0.5 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300">
      <div className="w-0.5 h-2 bg-[var(--color-primary)] rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
      <div className="w-0.5 h-3 bg-[var(--color-primary)] rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "150ms" }} />
      <div className="w-0.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }} />
    </div>
  </div>
);

const PremiumSettingsIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <Settings size={size} strokeWidth={strokeWidth} className="text-[var(--color-ink-muted)] group-hover/nav:text-[var(--color-ink)] transition-colors duration-300" />
  </div>
);

const PremiumBuildingIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <Building2 size={size} strokeWidth={strokeWidth} className="text-[var(--color-primary)]" />
    <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-md rounded-lg scale-75 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

const PremiumCreditCardIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <CreditCard size={size} strokeWidth={strokeWidth} className="text-[var(--color-success)]" />
    <div className="absolute top-1 left-1 right-1 h-0.5 bg-[var(--color-success)]/40 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

const PremiumServerIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <Server size={size} strokeWidth={strokeWidth} className="text-[var(--color-ink-muted)] group-hover/nav:text-[var(--color-primary)] transition-colors duration-300" />
    <div className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-[var(--color-success)] rounded-full animate-pulse" />
  </div>
);

const PremiumLifeBuoyIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <div className={`relative ${className}`}>
    <LifeBuoy size={size} strokeWidth={strokeWidth} className="text-[var(--color-primary)]" />
    <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-md rounded-lg scale-75 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
  </div>
);

// ─── SUPER ADMIN NAVIGATION ───────────────────────────────────────────────────
export const superAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/super-admin", icon: PremiumDashboardIcon },
  { label: "Agencies", href: "/super-admin/agencies", icon: PremiumBuildingIcon },
  { label: "Subscriptions", href: "/super-admin/subscriptions", icon: PremiumCreditCardIcon },
  { label: "Reports", href: "/super-admin/reports", icon: PremiumBarChartIcon },
  { label: "System", href: "/super-admin/system", icon: PremiumServerIcon },
  { label: "Settings", href: "/super-admin/settings", icon: PremiumSettingsIcon },
  { label: "Support", href: "/super-admin/support", icon: PremiumLifeBuoyIcon },
];

// ─── TENANT ADMIN NAVIGATION ──────────────────────────────────────────────────
export const tenantAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: PremiumDashboardIcon },
  { label: "Bookings", href: "/dashboard/bookings", icon: PremiumCalendarIcon },
  { label: "Clients", href: "/dashboard/clients", icon: PremiumContactIcon },
  { label: "Fleet", href: "/dashboard/fleet", icon: PremiumCarIcon },
  { label: "Users", href: "/dashboard/users", icon: PremiumUsersIcon },
  { label: "Financials", href: "/dashboard/financials", icon: PremiumWalletIcon },
  { label: "Reports", href: "/dashboard/reports", icon: PremiumBarChartIcon },
  { label: "Settings", href: "/dashboard/settings", icon: PremiumSettingsIcon },
];
