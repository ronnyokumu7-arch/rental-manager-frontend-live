"use client";

import { useMemo } from "react";
import { Users, CalendarDays, ShieldCheck } from "lucide-react";

export type UserMainTab = "roster" | "scheduler" | "roles";

interface UsersHeaderProps {
  activeTab: UserMainTab;
  onTabChange: (tab: UserMainTab) => void;
}

const TABS = [
  { id: "roster", label: "Team Roster", icon: Users },
  { id: "scheduler", label: "Duty Scheduler", icon: CalendarDays },
  { id: "roles", label: "Role Templates", icon: ShieldCheck },
];

export default function UsersHeader({ activeTab, onTabChange }: UsersHeaderProps) {
  const currentTabInfo = useMemo(() => {
    switch (activeTab) {
      case "roster":
        return {
          title: "Team Management",
          description: "Manage executive leadership, staff accounts, verification steps, and system access.",
          icon: <Users size={20} />,
        };
      case "scheduler":
        return {
          title: "Duty & Shift Scheduler",
          description: "Plan shift timelines, monitor workload distribution, and assign operational tasks.",
          icon: <CalendarDays size={20} />,
        };
      case "roles":
        return {
          title: "Role Templates & Security",
          description: "Configure role-based access control (RBAC), security scopes, and granular permissions.",
          icon: <ShieldCheck size={20} />,
        };
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            {currentTabInfo.icon}
          </div>
          {currentTabInfo.title}
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          {currentTabInfo.description}
        </p>
      </div>

      {/* Main Module Tabs Switcher */}
      <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-xs overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as UserMainTab)}
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
  );
}
