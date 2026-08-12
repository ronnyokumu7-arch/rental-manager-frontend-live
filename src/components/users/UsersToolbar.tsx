// src/components/users/UsersToolbar.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Shield, Briefcase, Plus, Filter } from "lucide-react";
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
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // Handle click outside for department dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDepartmentDropdown && !target.closest('[data-department-filter]')) {
        setShowDepartmentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDepartmentDropdown]);

  const isFilterActive = Boolean(departmentFilter);

  return (
    <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
      
      {/* LEFT SIDE: Category Toggle + Metrics (Evenly Distributed) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
        
        {/* Executive vs Staff Toggle Switcher — HIDDEN ON MOBILE (<640px) */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm h-9">
          <button
            type="button"
            onClick={() => setCategory("executive")}
            className={`flex items-center justify-center gap-1.5 px-3 h-full rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              category === "executive"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
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
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Briefcase size={13} />
            <span>Staff</span>
          </button>
        </div>

        {/* Metrics Breakdown Pills - Text-only, evenly distributed */}
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Team</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalUsers}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
            <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeUsers}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Inactive</span>
            <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{inactiveUsers}</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Search + Premium Filter + Invite Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
        <div className="flex items-center gap-2 flex-1 sm:w-80">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* ✅ PREMIUM DEPARTMENT FILTER DROPDOWN */}
          {departmentOptions.length > 0 && (
            <div className="relative flex-shrink-0" data-department-filter>
              <button
                type="button"
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  isFilterActive
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
                title="Filter by department"
              >
                <Filter size={15} />
              </button>

              {showDepartmentDropdown && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowDepartmentDropdown(false)} />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                      {/* "All Departments" - clears filter */}
                      <button
                        onClick={() => { setDepartmentFilter(null); setShowDepartmentDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                          departmentFilter === null
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                        }`}
                      >
                        All Departments
                      </button>
                      <div className="h-px bg-[var(--color-surface-border)]" />
                      
                      {/* Department options */}
                      {departmentOptions.map((dept) => (
                        <button
                          key={dept.value}
                          onClick={() => { setDepartmentFilter(dept.value); setShowDepartmentDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                            departmentFilter === dept.value
                              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                          }`}
                        >
                          {dept.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Invite Button */}
        <button
          type="button"
          onClick={onAddMember}
          className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
        >
          <Plus size={14} strokeWidth={2.5} />
          Invite Users
        </button>
      </div>
    </div>
  );
}
