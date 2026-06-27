"use client";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  CalendarDays,
  Users,
  Car,
  Wallet,
  Server,
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

// ─── SUPER ADMIN NAVIGATION ───────────────────────────────────────────────────
export const superAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { label: "Agencies", href: "/super-admin/agencies", icon: Building2 },
  {
    label: "Subscriptions",
    icon: CreditCard,
    children: [
      { label: "Plans & Status", href: "/super-admin/subscriptions" },
      { label: "Renewals", href: "/super-admin/subscriptions/renewals" },
    ],
  },
  { label: "Reports", href: "/super-admin/reports", icon: BarChart3 },
  {
    label: "System",
    icon: Server,
    children: [
      { label: "Background Jobs", href: "/super-admin/system/jobs" },
      { label: "System Logs", href: "/super-admin/system/logs" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "System Config", href: "/super-admin/settings" },
      { label: "Roles & Permissions", href: "/super-admin/settings/roles" },
      { label: "Theme", href: "/super-admin/settings/theme" },
    ],
  },
];

// ─── TENANT ADMIN NAVIGATION ──────────────────────────────────────────────────
export const tenantAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Fleet", href: "/dashboard/fleet", icon: Car }, // ✅ Single link, no group
  {
    label: "Financials",
    icon: Wallet,
    children: [
      { label: "Contracts", href: "/dashboard/contracts" },
      { label: "Invoices", href: "/dashboard/invoices" },
      { label: "Payments", href: "/dashboard/payments" },
    ],
  },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Business Settings", href: "/dashboard/settings" },
      { label: "Roles & Permissions", href: "/dashboard/settings/roles" },
      { label: "Theme", href: "/dashboard/settings/theme" },
    ],
  },
];
