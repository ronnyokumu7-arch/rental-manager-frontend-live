// src/components/users/UsersToolbar.tsx
import { Search, Filter, Plus, ChevronDown } from "lucide-react";
import type { CategoryMode } from "@/hooks/users/useUsersList";

interface UsersToolbarProps {
  category: CategoryMode;
  setCategory: (val: CategoryMode) => void; // ✅ Added to fix TS build error
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
  category, // Kept for potential future context
  setCategory, // ✅ Added to destructuring
  search, 
  setSearch,
  departmentFilter, 
  setDepartmentFilter,
  departmentOptions,
  totalUsers, 
  activeUsers, 
  inactiveUsers,
  onAddMember
}: UsersToolbarProps) {
  return (
    <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
      
      {/* ✅ 1. Counters (Replaces the old Active/Vault Toggle) */}
      <div className="hidden md:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Team</span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalUsers}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
          <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeUsers}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Inactive</span>
          <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{inactiveUsers}</span>
        </div>
      </div>

      {/* ✅ 2. Filters + Add Button */}
      <div className="flex items-center gap-2 w-full lg:w-auto">
        
        {/* Search */}
        <div className="relative flex-1 lg:w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
          />
        </div>
        
        {/* Department Filter with Standard Filter Icon */}
        <div className="relative w-full lg:w-48">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
          <select
            value={departmentFilter || ""}
            onChange={(e) => setDepartmentFilter(e.target.value || null)}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ✅ 3. Unified Add Member Button */}
        <button
          onClick={onAddMember}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>
    </div>
  );
}
