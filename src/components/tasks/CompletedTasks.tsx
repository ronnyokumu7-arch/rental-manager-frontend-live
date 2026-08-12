// src/app/dashboard/tasks/CompletedTasksTab.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Tag, CheckCircle2, MoreVertical, RotateCcw, Eye,
  Search, Clock, Users, UserX, Wrench, Building2, Briefcase, DollarSign, Shield, Car, User as UserIcon
} from "lucide-react";
import type { Task, User } from "@/lib/types";
import type { TimeFilter } from "@/hooks/tasks/useTasksList";

interface CompletedTasksTabProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  metrics: { completedToday: number; completedThisWeek: number; completedThisMonth: number };
  
  // Filters
  search: string;
  setSearch: (val: string) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (val: TimeFilter) => void;
  selectedUserId: string;
  setSelectedUserId: (val: string) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  pageSize: number;
  totalPages: number;
  filteredTasks: Task[];

  // Dropdown & Actions
  openDropdownId: number | null;
  dropdownPos: { top: number; right: number } | null;
  onToggleDropdown: (e: React.MouseEvent, taskId: number) => void;
  onReopen: (taskId: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield, fleet: Car, finance: DollarSign, booking: Briefcase,
  hr: Users, operations: Building2, maintenance: Wrench, other: Tag,
};

const TIME_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: "", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-blue-500",
  low: "bg-slate-400",
};

export default function CompletedTasksTab({
  tasks, users, loading, metrics,
  search, setSearch, timeFilter, setTimeFilter,
  selectedUserId, setSelectedUserId,
  currentPage, setCurrentPage, pageSize, totalPages, filteredTasks,
  openDropdownId, dropdownPos, onToggleDropdown, onReopen
}: CompletedTasksTabProps) {
  const router = useRouter();
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const timeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) setIsTimeOpen(false);
      if (userRef.current && !userRef.current.contains(event.target as Node)) setIsUserOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No date";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getAssigneeName = (userId: number | null) => {
    if (!userId) return null;
    const user = users.find((u) => u.id === userId);
    return user?.full_name || "Unknown User";
  };

  const getAssigneeInitials = (userId: number | null) => {
    const name = getAssigneeName(userId);
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const selectedUser = users.find(u => u.id.toString() === selectedUserId);

  // Calculate total completed (all time)
  const totalCompleted = tasks.length;

  return (
    <div className="flex flex-col h-full">
      {/* ✅ RESPONSIVE TOOLBAR - Fixed dropdowns and mobile spacing */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col gap-4">
        
        {/* Metrics - All | Today | This Week (with more space for This Week on mobile) */}
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap flex-[0.5] min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">All</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalCompleted}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap flex-[0.5] min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Today</span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">{metrics.completedToday}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">This Week</span>
            <span className="text-xs font-bold text-blue-500 tabular-nums">{metrics.completedThisWeek}</span>
          </div>
        </div>

        {/* Controls: Search + Icon-Only Time Filter + Icon-Only User Filter */}
        <div className="flex items-center gap-2">
          {/* Search Input - Takes remaining space */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search completed..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>

          {/* ✅ Icon-Only Time Filter with Fixed Dropdown */}
          <div className="relative flex-shrink-0" ref={timeRef}>
            <button
              onClick={() => setIsTimeOpen(!isTimeOpen)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                timeFilter ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
              title={timeFilter ? `Time: ${TIME_OPTIONS.find(t => t.id === timeFilter)?.label || 'All Time'}` : "Filter by time"}
            >
              <Clock size={15} />
            </button>
            {isTimeOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsTimeOpen(false)} />
                {/* Fixed dropdown positioning - renders above button on mobile */}
                <div 
                  className="absolute bottom-full mb-2 right-0 w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="py-1">
                    {TIME_OPTIONS.map(opt => (
                      <button 
                        key={opt.id} 
                        onClick={() => { setTimeFilter(opt.id); setIsTimeOpen(false); }} 
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${timeFilter === opt.id ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ✅ Icon-Only User Filter with Fixed Dropdown */}
          <div className="relative flex-shrink-0" ref={userRef}>
            <button
              onClick={() => setIsUserOpen(!isUserOpen)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                selectedUserId ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
              title={selectedUserId ? `User: ${selectedUser?.full_name || 'All Users'}` : "Filter by user"}
            >
              <Users size={15} />
            </button>
            {isUserOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsUserOpen(false)} />
                {/* Fixed dropdown positioning - renders above button on mobile */}
                <div 
                  className="absolute bottom-full mb-2 right-0 w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="py-1">
                    <button 
                      onClick={() => { setSelectedUserId(""); setIsUserOpen(false); }} 
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${!selectedUserId ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}
                    >
                      All Users
                    </button>
                    <div className="h-px bg-[var(--color-surface-border)]" />
                    {users.map(user => (
                      <button 
                        key={user.id} 
                        onClick={() => { setSelectedUserId(user.id.toString()); setIsUserOpen(false); }} 
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${selectedUserId === user.id.toString() ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}
                      >
                        {user.full_name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MOBILE CARD VIEW (< md) */}
      <div className="block md:hidden p-4 space-y-3">
        {filteredTasks.map((task) => {
          const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
          const assigneeName = getAssigneeName(task.user_id);

          return (
            <div
              key={`mobile-completed-task-${task.id}`}
              className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer shadow-sm opacity-75 hover:opacity-100"
              onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
            >
              {/* Header: Category Icon + Title + Priority Dot */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <CategoryIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold truncate leading-tight line-through decoration-[var(--color-ink-subtle)]/50 text-[var(--color-ink)]">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority] || "bg-slate-400"}`} />
                      <span className="text-xs font-medium text-[var(--color-ink-muted)] capitalize">{task.priority}</span>
                    </div>
                  </div>
                </div>

                {/* 3-Dots Menu */}
                <div className="relative flex-shrink-0" data-dropdown-id={task.id}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleDropdown(e, task.id); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all"
                    title="More Actions"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Body: Assignee, Completed Date, Category */}
              <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3 space-y-2.5 text-xs">
                {/* Assignee */}
                <div className="flex items-center gap-2">
                  {assigneeName ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        {getAssigneeInitials(task.user_id)}
                      </div>
                      <span className="font-medium text-[var(--color-ink)] truncate">{assigneeName}</span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                      <UserX size={10} /> Unassigned
                    </span>
                  )}
                </div>

                {/* Completed Date */}
                <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                  <span className="font-medium">Completed on {formatDate(task.completed_at)}</span>
                </div>

                {/* Category + Quick Action */}
                <div className="flex items-center justify-between pt-1 border-t border-[var(--color-surface-border)]/40">
                  <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                    <Tag size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="font-medium capitalize">{task.category}</span>
                  </div>

                  {/* Quick Action: Reopen */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onReopen(task.id); }}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ DESKTOP TABLE VIEW (md+) */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Task</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Assigned To</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Priority</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Due Date</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)]">
            {tasks.map((task) => {
              const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
              const assigneeName = getAssigneeName(task.user_id);

              return (
                <tr key={task.id} className="hover:bg-[var(--color-surface-hover)] transition-colors group opacity-75 hover:opacity-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                        <CategoryIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)] truncate line-through decoration-[var(--color-ink-subtle)]/50">
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--color-ink-muted)] truncate capitalize flex items-center gap-1 mt-0.5">
                          <Tag size={10} /> {task.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {assigneeName ? (
                      <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          {getAssigneeInitials(task.user_id)}
                        </div>
                        <span className="font-medium truncate max-w-[120px]">{assigneeName}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                        <UserX size={10} /> Unassigned
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority] || "bg-slate-400"}`} />
                      <span className="text-xs font-semibold capitalize text-[var(--color-ink)]">{task.priority}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-[var(--color-ink-subtle)]" />
                      <span className="text-xs font-medium text-[var(--color-ink)]">
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <div className="relative" data-dropdown-id={task.id}>
                        <button onClick={(e) => onToggleDropdown(e, task.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all" title="More Actions">
                          <MoreVertical size={14} />
                        </button>
                        {openDropdownId === task.id && dropdownPos && (
                          <div className="fixed z-[100] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100" style={{ top: dropdownPos.top, right: dropdownPos.right }}>
                            <button onClick={() => onReopen(task.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors">
                              <RotateCcw size={14} /> Reopen Task
                            </button>
                            <div className="h-px bg-[var(--color-surface-border)]" />
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors">
                              <Eye size={14} /> View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ PAGINATION - Desktop only, matches other tabs */}
      {filteredTasks.length > 0 && (
        <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] items-center justify-between bg-[var(--color-surface)]">
          <p className="text-xs text-[var(--color-ink-muted)]">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95">Previous</button>
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">{currentPage} / {totalPages || 1}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
