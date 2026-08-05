"use client";

import {
  LayoutDashboard, Building2, CreditCard, BarChart3, Settings,
  CalendarDays, Contact, Users, Car, Wallet, Server, LifeBuoy, ListChecks,
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

// ── OPTIMIZED PREMIUM ICON COMPONENTS ────────────────────────────────────────
// Removed heavy DOM wrappers, blurs, and infinite animations to reduce CPU/GPU load.
// Maintains premium feel through distinct color-coding and subtle scale transitions.

const PremiumDashboardIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <LayoutDashboard size={size} strokeWidth={strokeWidth} className={`text-[var(--color-primary)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumCalendarIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <CalendarDays size={size} strokeWidth={strokeWidth} className={`text-[var(--color-primary)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumContactIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Contact size={size} strokeWidth={strokeWidth} className={`text-[var(--color-success)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumCarIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Car size={size} strokeWidth={strokeWidth} className={`text-[var(--color-warning)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumUsersIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Users size={size} strokeWidth={strokeWidth} className={`text-[var(--color-primary)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumWalletIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Wallet size={size} strokeWidth={strokeWidth} className={`text-[var(--color-success)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
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
  <Settings size={size} strokeWidth={strokeWidth} className={`text-[var(--color-ink-muted)] group-hover/nav:text-[var(--color-ink)] transition-colors duration-200 ${className}`} />
);

const PremiumBuildingIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Building2 size={size} strokeWidth={strokeWidth} className={`text-[var(--color-primary)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumCreditCardIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <CreditCard size={size} strokeWidth={strokeWidth} className={`text-[var(--color-success)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumServerIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Server size={size} strokeWidth={strokeWidth} className={`text-[var(--color-ink-muted)] group-hover/nav:text-[var(--color-primary)] transition-colors duration-200 ${className}`} />
);

const PremiumLifeBuoyIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <LifeBuoy size={size} strokeWidth={strokeWidth} className={`text-[var(--color-primary)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

// ✅ NEW: Premium Tasks Icon
const PremiumTasksIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <ListChecks size={size} strokeWidth={strokeWidth} className={`text-[var(--color-primary)] transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
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
  { label: "Tasks", href: "/dashboard/tasks", icon: PremiumTasksIcon }, // ✅ ADDED
  { label: "Settings", href: "/dashboard/settings", icon: PremiumSettingsIcon },
];
