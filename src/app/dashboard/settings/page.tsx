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
  FileText,
  Users,
  Globe,
  Lock,
  Zap,
  BarChart3,
  Mail,
  Smartphone,
  Calendar,
  Truck,
  UserCheck,
  Receipt,
  Landmark,
  Shield,
  HardDrive,
  RefreshCw,
  Eye,
  Activity,
  Code,
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
    blue: { iconBg: "bg-blue-50 dark:bg-blue-900/20", iconText: "text-blue-600 dark:text-blue-400" },
    emerald: { iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconText: "text-emerald-600 dark:text-emerald-400" },
    purple: { iconBg: "bg-purple-50 dark:bg-purple-900/20", iconText: "text-purple-600 dark:text-purple-400" },
    amber: { iconBg: "bg-amber-50 dark:bg-amber-900/20", iconText: "text-amber-600 dark:text-amber-400" },
    rose: { iconBg: "bg-rose-50 dark:bg-rose-900/20", iconText: "text-rose-600 dark:text-rose-400" },
    slate: { iconBg: "bg-slate-100 dark:bg-slate-800", iconText: "text-slate-600 dark:text-slate-400" },
  };
  return themes[theme] || themes.blue;
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your agency configuration and system preferences
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
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
              className="group relative flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 cursor-pointer"
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
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {module.title}
                  </h3>
                  {module.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      {module.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {module.description}
                </p>
              </div>

              {/* Navigation Chevron */}
              <ChevronRight
                size={18}
                className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
