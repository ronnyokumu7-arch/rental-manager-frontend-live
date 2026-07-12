// src/app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Palette,
  Bell,
  CreditCard,
  Settings,
  ChevronRight,
  Puzzle,
  Database,
  Key,
  Users,
  Globe,
  Lock,
  Zap,
  BarChart3,
  UserCheck,
  Receipt,
  Landmark,
  Shield,
  HardDrive,
  Activity,
  Webhook,
} from "lucide-react";

type TabId = "general" | "team" | "financials" | "system" | "advanced";

interface SettingModule {
  title: string;
  description: string;
  icon: any;
  theme: string;
  href: string;
  badge?: string;
}

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "team", label: "Team & Access", icon: Users },
  { id: "financials", label: "Financials", icon: Landmark },
  { id: "system", label: "System", icon: Zap },
  { id: "advanced", label: "Advanced", icon: Shield },
];

const SETTINGS_MODULES: Record<TabId, SettingModule[]> = {
  general: [
    {
      title: "Business Profile",
      description: "Manage your agency details, logo, and official contact information.",
      icon: Building2,
      theme: "blue",
      href: "/dashboard/settings/business",
    },
    {
      title: "Appearance",
      description: "Customize dashboard themes, regional formats, and display preferences.",
      icon: Palette,
      theme: "purple",
      href: "/dashboard/settings/theme",
    },
    {
      title: "Notifications",
      description: "Control email alerts, booking reminders, and system warnings.",
      icon: Bell,
      theme: "amber",
      href: "/dashboard/settings/notifications",
    },
    {
      title: "Regional Settings",
      description: "Set timezone, currency, date formats, and language preferences.",
      icon: Globe,
      theme: "emerald",
      href: "/dashboard/settings/regional",
    },
  ],
  team: [
    {
      title: "Team & Roles",
      description: "Configure staff access, job titles, and granular permission matrices.",
      icon: ShieldCheck,
      theme: "emerald",
      href: "/dashboard/settings/roles",
    },
    {
      title: "User Management",
      description: "Invite, activate, suspend, and manage team member accounts.",
      icon: UserCheck,
      theme: "blue",
      href: "/dashboard/users",
    },
    {
      title: "Authentication",
      description: "Configure 2FA, session timeouts, and password policies.",
      icon: Lock,
      theme: "rose",
      href: "/dashboard/settings/auth",
    },
  ],
  financials: [
    {
      title: "Billing & Subscription",
      description: "Manage your subscription plan, payment methods, and invoices.",
      icon: CreditCard,
      theme: "rose",
      href: "/dashboard/settings/billing",
    },
    {
      title: "Invoice Settings",
      description: "Configure invoice templates, tax rates, and payment terms.",
      icon: Receipt,
      theme: "blue",
      href: "/dashboard/settings/invoices",
      badge: "New",
    },
    {
      title: "Payment Methods",
      description: "Add and manage accepted payment methods and gateways.",
      icon: Landmark,
      theme: "emerald",
      href: "/dashboard/settings/payments",
    },
  ],
  system: [
    {
      title: "Integrations",
      description: "Connect external APIs, webhooks, and third-party services.",
      icon: Puzzle,
      theme: "slate",
      href: "/dashboard/settings/integrations",
    },
    {
      title: "Webhooks",
      description: "Manage webhook endpoints and event subscriptions.",
      icon: Webhook,
      theme: "purple",
      href: "/dashboard/settings/webhooks",
      badge: "Beta",
    },
    {
      title: "API Keys",
      description: "Generate and manage API keys for external integrations.",
      icon: Key,
      theme: "amber",
      href: "/dashboard/settings/api-keys",
    },
    {
      title: "Audit Logs",
      description: "View system activity, user actions, and security events.",
      icon: Activity,
      theme: "blue",
      href: "/dashboard/settings/audit",
    },
  ],
  advanced: [
    {
      title: "Data Management",
      description: "Export, import, and manage your rental data and records.",
      icon: Database,
      theme: "blue",
      href: "/dashboard/settings/data",
    },
    {
      title: "Backup & Recovery",
      description: "Configure automatic backups and disaster recovery settings.",
      icon: HardDrive,
      theme: "emerald",
      href: "/dashboard/settings/backup",
    },
    {
      title: "System Health",
      description: "Monitor system performance, uptime, and resource usage.",
      icon: BarChart3,
      theme: "purple",
      href: "/dashboard/settings/health",
    },
  ],
};

const getThemeClasses = (theme: string) => {
  const themes: Record<string, { iconBg: string; iconText: string }> = {
    blue: { iconBg: "bg-[var(--color-primary-muted)]", iconText: "text-[var(--color-primary-text)]" },
    emerald: { iconBg: "bg-[var(--color-success-bg)]", iconText: "text-[var(--color-success-text)]" },
    purple: { iconBg: "bg-[var(--color-primary-muted)]", iconText: "text-[var(--color-primary-text)]" },
    amber: { iconBg: "bg-[var(--color-warning-bg)]", iconText: "text-[var(--color-warning-text)]" },
    rose: { iconBg: "bg-[var(--color-danger-bg)]", iconText: "text-[var(--color-danger-text)]" },
    slate: { iconBg: "bg-[var(--color-surface-hover)]", iconText: "text-[var(--color-ink-muted)]" },
  };
  return themes[theme] || themes.blue;
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="space-y-6">
      
      {/* Premium Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Settings size={20} />
            </div>
            Settings
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Manage your agency configuration and system preferences
          </p>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_MODULES[activeTab].map((module) => {
          const Icon = module.icon;
          const theme = getThemeClasses(module.theme);
          return (
            <div
              key={module.title}
              onClick={() => router.push(module.href)}
              className="group relative flex items-center gap-4 p-5 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] hover:border-[var(--color-primary)]/50 hover:shadow-[var(--shadow-lg)] transition-all duration-200 cursor-pointer"
            >
              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.iconBg} ${theme.iconText} group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[var(--color-ink)] truncate">
                    {module.title}
                  </h3>
                  {module.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]">
                      {module.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] mt-0.5 line-clamp-2">
                  {module.description}
                </p>
              </div>

              {/* Navigation Chevron */}
              <ChevronRight
                size={18}
                className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
