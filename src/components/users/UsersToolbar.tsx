// src/components/users/UsersToolbar.tsx
"use client";

import { Search, Shield, Briefcase, Plus, ChevronDown, Filter, X } from "lucide-react";
import type { CategoryMode } from "@/hooks/users/useUsersList";

interface UsersToolbarProps {
  category: CategoryMode;
  setCategory: (cat: CategoryMode) => void;
  search: string;
  setSearch: (val: string) => void;
  departmentFilter: string | null;
  setDepartmentFilter: (val: string | null) => void;
  departmentOptions: { value: string; label: string }[];
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  onAddMember: () => void;
}

export default function UsersToolbar({
  category,
  setCategory,
  search,
  setSearch,
  departmentFilter,
  setDepartmentFilter,
  departmentOptions,
  totalUsers,
  activeUsers,
  inactiveUsers,
  onAddMember,
}: UsersToolbarProps) {
  const isFilterActive = Boolean(departmentFilter);

  return (
    <div className="p-3.5 sm:p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
      
      {/* LEFT SIDE: Category Toggle Switcher (Desktop) + Metrics Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
        
        {/* Executive vs Staff Toggle Switcher — HIDDEN ON MOBILE (<640px) */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-xs h-9">
          <button
            type="button"
            onClick={() => setCategory("executive")}
            className={`flex items-center justify-center gap-1.5 px-3 h-full rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              category === "executive"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Shield size={13} />
            <span>Executive</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory("staff")}
            className={`flex items-center justify-center gap-1.5 px-3 h-full rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              category === "staff"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Briefcase size={13} />
            <span>Staff</span>
          </button>
        </div>

        {/* Metrics Breakdown Pills */}
        <div className="flex items-center gap-3 px-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs overflow-x-auto h-9 min-w-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-ink-muted)] font-medium">Team</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalUsers}</span>
          </div>

          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />

          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-ink-muted)] font-medium">Active</span>
            <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeUsers}</span>
          </div>

          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />

          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[var(--color-danger)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-ink-muted)] font-medium">Inactive</span>
            <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{inactiveUsers}</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Search, Compact Icon Filter, and Invite CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
        
        {/* Side-by-Side Search Input & Icon-Only Filter on Mobile */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-xs placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-all"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Department Filter: Icon-only on mobile (<sm), Expanded select dropdown on desktop (≥sm) */}
          {departmentOptions.length > 0 && (
            <div className="relative flex-shrink-0">
              <select
                value={departmentFilter || ""}
                onChange={(e) => setDepartmentFilter(e.target.value || null)}
                aria-label="Filter by department"
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              >
                <option value="">All Departments</option>
                {departmentOptions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <div
                className={`h-9 px-2.5 sm:px-3 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all pointer-events-none ${
                  isFilterActive
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30 font-semibold"
                    : "bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-surface-border)]"
                }`}
              >
                <Filter size={14} className="flex-shrink-0 text-[var(--color-ink-subtle)]" />
                
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {departmentFilter
                    ? departmentOptions.find((d) => d.value === departmentFilter)?.label || departmentFilter
                    : "All Departments"}
                </span>
                
                <ChevronDown size={14} className="hidden sm:block flex-shrink-0 text-[var(--color-ink-subtle)]" />
                
                {isFilterActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] sm:hidden" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Invite CTA */}
        <button
          type="button"
          onClick={onAddMember}
          className="w-full sm:w-auto h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow flex-shrink-0 active:scale-98"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Invite Users</span>
        </button>
      </div>
    </div>
  );
}
