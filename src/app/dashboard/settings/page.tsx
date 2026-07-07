"use client";
import { useRouter } from "next/navigation";
import { 
  Building2, ShieldCheck, Palette, Bell, CreditCard, 
  Settings, ChevronRight, Puzzle 
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function SettingsHubPage() {
  const router = useRouter();

  // The "Control Panel" Modules
  const settingsModules = [
    {
      title: "Business Profile",
      description: "Manage your agency details, logo, and official contact information.",
      icon: Building2,
      theme: "blue",
      href: "/dashboard/settings/business",
    },
    {
      title: "Team & Roles",
      description: "Configure staff access, job titles, and granular permission matrices.",
      icon: ShieldCheck,
      theme: "emerald",
      href: "/dashboard/settings/roles",
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
      title: "Billing & Subscription",
      description: "Manage your subscription plan, payment methods, and invoices.",
      icon: CreditCard,
      theme: "rose",
      href: "/dashboard/settings/billing",
    },
    {
      title: "Integrations",
      description: "Connect external APIs, webhooks, and third-party services.",
      icon: Puzzle,
      theme: "slate",
      href: "/dashboard/settings/integrations",
    },
  ];

  // Theme mapping for icon backgrounds and text colors
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

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Settings"
        subtitle="Manage your agency configuration, team access, and system preferences."
        icon={Settings}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      {/* OS-Style Settings Grid (Windows 11 / Ubuntu Inspired) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsModules.map((module) => {
          const Icon = module.icon;
          const theme = getThemeClasses(module.theme);

          return (
            <div
              key={module.title}
              onClick={() => router.push(module.href)}
              className="group relative flex items-center gap-4 p-5 rounded-2xl border border-surface-border bg-white dark:bg-slate-900 hover:bg-surface-hover dark:hover:bg-slate-800/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 cursor-pointer"
            >
              {/* Icon Container */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.iconBg} ${theme.iconText} group-hover:scale-105 transition-transform duration-200`}>
                <Icon size={22} strokeWidth={1.8} />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-ink truncate">{module.title}</h3>
                <p className="text-sm text-ink-muted mt-0.5 line-clamp-2">{module.description}</p>
              </div>

              {/* Navigation Chevron */}
              <ChevronRight 
                size={18} 
                className="text-ink-subtle group-hover:text-ink group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
