"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar, Tag, CheckCircle2, MoreVertical, RotateCcw, Eye,
  Search, Clock, Users, UserX, Wrench, Building2, Briefcase, DollarSign, Shield, Car
} from "lucide-react";
import UserFilterSelector from "@/components/ui/UserFilterSelector";
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

export default function CompletedTasksTab({
  tasks, users, loading, metrics,
  search, setSearch, timeFilter, setTimeFilter,
  selectedUserId, setSelectedUserId,
  currentPage, setCurrentPage, pageSize, totalPages, filteredTasks,
  openDropdownId, dropdownPos, onToggleDropdown, onReopen
}: CompletedTasksTabProps) {

  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) setIsTimeOpen(false);
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

  return (
    <div className="flex flex-col h-full">
      {/* ✅ INDEPENDENT TOOLBAR - ALWAYS VISIBLE */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-center justify-between">
        
        {/* Left: Time-Based Metrics */}
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm w-full xl:w-auto overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Today</span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">{metrics.completedToday}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">This Week</span>
            <span className="text-xs font-bold text-blue-500 tabular-nums">{metrics.completedThisWeek}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">This Month</span>
            <span className="text-xs font-bold text-purple-500 tabular-nums">{metrics.completedThisMonth}</span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-full xl:w-auto ml-auto">
          {/* Search */}
          <div className="relative w-full xl:w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search completed..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>

          {/* ✅ Icon-Only Time Filter */}
          <div className="relative" ref={timeRef}>
            <button
              onClick={() => setIsTimeOpen(!isTimeOpen)}
              title="Filter by time period"
              className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${
                timeFilter ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Clock size={14} />
            </button>
            {isTimeOpen && (
              <div className="absolute top-full mt-2 right-0 w-40 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {TIME_OPTIONS.map(opt => (
                  <button 
                    key={opt.id} 
                    onClick={() => { setTimeFilter(opt.id); setIsTimeOpen(false); }} 
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${timeFilter === opt.id ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Option A: Prominent User Filter */}
          <UserFilterSelector 
            users={users} 
            selectedUserId={selectedUserId} 
            onChange={setSelectedUserId} 
            placeholder="Filter by team member"
          />
        </div>
      </div>

      {/* ✅ CONTENT AREA - Empty state ONLY in table area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 animate-spin" /> Loading completed tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No Completed Tasks</h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
              {selectedUserId 
                ? "No completed tasks found for this team member with the current filters." 
                : "Finished tasks will appear here for your records and auditing."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
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
                                {assigneeName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
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
                            <div className={`w-2 h-2 rounded-full ${task.priority === 'urgent' ? 'bg-rose-500' : task.priority === 'high' ? 'bg-amber-500' : task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-400'}`} />
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

            {/* PAGINATION */}
            {filteredTasks.length > 0 && (
              <div className="p-4 border-t border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface)]">
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
          </>
        )}
      </div>
    </div>
  );
}
