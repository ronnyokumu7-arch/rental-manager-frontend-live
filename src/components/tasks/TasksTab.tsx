// src/app/dashboard/tasks/TasksTab.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Tag, Clock, Ban, CheckCircle2, MoreVertical,
  User as UserIcon, Users, UserX, Wrench, Building2, Briefcase, DollarSign, Shield, Car, Archive,
  Search, Flag, Plus, Pencil
} from "lucide-react";
import type { Task, User } from "@/lib/types";

interface TasksTabProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  metrics: { totalActive: number; overdue: number; unassigned: number };
  
  // Filters
  search: string;
  setSearch: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  
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
  onAssign: (taskId: number, userId: number) => void;
  onClaim: (taskId: number) => void;
  onStatusChange: (taskId: number, status: Task["status"]) => void;
  onArchive: (taskId: number) => void;
  
  // Modal
  onOpenCreateModal: () => void;
  onEdit: (task: Task) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield, fleet: Car, finance: DollarSign, booking: Briefcase,
  hr: Users, operations: Building2, maintenance: Wrench, other: Tag,
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  in_review: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  blocked: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  unassigned: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border-[var(--color-surface-border)]",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-blue-500",
  low: "bg-slate-400",
};

const CATEGORIES = ["fleet", "finance", "hr", "booking", "compliance", "maintenance", "operations", "other"];
const PRIORITIES = ["urgent", "high", "medium", "low"];

export default function TasksTab({
  tasks, users, loading, metrics,
  search, setSearch, priorityFilter, setPriorityFilter, categoryFilter, setCategoryFilter,
  currentPage, setCurrentPage, pageSize, totalPages, filteredTasks,
  openDropdownId, dropdownPos, onToggleDropdown, 
  onAssign: _onAssign,
  onClaim, onStatusChange, onArchive,
  onOpenCreateModal,
  onEdit,
}: TasksTabProps) {
  const router = useRouter();
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) setIsPriorityOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setIsCategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return { 
      text: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), 
      isOverdue 
    };
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

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 animate-spin" /> Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} className="text-[var(--color-ink-subtle)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">All Caught Up!</h3>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">No active tasks found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ✅ RESPONSIVE TOOLBAR - DNA matched to Clients/Invoices pages */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        
        {/* Metrics - Evenly Distributed */}
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{metrics.totalActive}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Overdue</span>
            <span className="text-xs font-bold text-rose-500 tabular-nums">{metrics.overdue}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Unassigned</span>
            <span className="text-xs font-bold text-amber-500 tabular-nums">{metrics.unassigned}</span>
          </div>
        </div>

        {/* Controls: Search + Filters + New Task */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>

            {/* ✅ PREMIUM PRIORITY FILTER DROPDOWN */}
            <div className="relative flex-shrink-0" ref={priorityRef}>
              <button
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  priorityFilter ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
                title="Filter by priority"
              >
                <Flag size={15} />
              </button>
              {isPriorityOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPriorityOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                      <button onClick={() => { setPriorityFilter(""); setIsPriorityOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${!priorityFilter ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>All Priorities</button>
                      <div className="h-px bg-[var(--color-surface-border)]" />
                      {PRIORITIES.map(p => (
                        <button key={p} onClick={() => { setPriorityFilter(p); setIsPriorityOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium capitalize transition-colors ${priorityFilter === p ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>{p}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ✅ PREMIUM CATEGORY FILTER DROPDOWN */}
            <div className="relative flex-shrink-0" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  categoryFilter ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
                title="Filter by category"
              >
                <Tag size={15} />
              </button>
              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                      <button onClick={() => { setCategoryFilter(""); setIsCategoryOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${!categoryFilter ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>All Categories</button>
                      <div className="h-px bg-[var(--color-surface-border)]" />
                      {CATEGORIES.map(c => (
                        <button key={c} onClick={() => { setCategoryFilter(c); setIsCategoryOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium capitalize transition-colors ${categoryFilter === c ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* New Task Button */}
          <button
            onClick={onOpenCreateModal}
            className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Task
          </button>
        </div>
      </div>

      {/* ✅ MOBILE CARD VIEW (< md) */}
      <div className="block md:hidden p-4 space-y-3">
        {tasks.map((task) => {
          const dateInfo = formatDate(task.due_date);
          const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
          const assigneeName = getAssigneeName(task.user_id);
          const isUnassigned = task.status === "unassigned" || task.user_id === null;
          const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.pending;

          return (
            <div
              key={`mobile-task-${task.id}`}
              className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer shadow-sm"
              onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
            >
              {/* Header: Category Icon + Title + Priority Dot */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                    <CategoryIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[var(--color-ink)] truncate leading-tight">
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

              {/* Body: Assignee, Due Date, Status */}
              <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3 space-y-2.5 text-xs">
                {/* Assignee */}
                <div className="flex items-center gap-2">
                  {assigneeName ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0">
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

                {/* Due Date */}
                <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                  <Calendar size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className={`font-medium ${dateInfo.isOverdue ? "text-rose-500 font-bold" : ""}`}>
                    {dateInfo.text}
                  </span>
                  {dateInfo.isOverdue && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold text-rose-500">OVERDUE</span>
                  )}
                </div>

                {/* Status + Quick Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[var(--color-surface-border)]/40">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusStyle}`}>
                    {task.status === 'in_progress' && <Clock size={10} />}
                    {task.status === 'blocked' && <Ban size={10} />}
                    {task.status.replace("_", " ")}
                  </span>

                  {/* Quick Action: Claim or Complete */}
                  {isUnassigned ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onClaim(task.id); }}
                      className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      Claim
                    </button>
                  ) : task.status !== "completed" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, "completed"); }}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      Complete
                    </button>
                  ) : null}
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
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Due Date</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)]">
            {tasks.map((task) => {
              const dateInfo = formatDate(task.due_date);
              const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
              const assigneeName = getAssigneeName(task.user_id);
              const isUnassigned = task.status === "unassigned" || task.user_id === null;

              return (
                <tr key={task.id} className="hover:bg-[var(--color-surface-hover)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                        <CategoryIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{task.title}</p>
                        <p className="text-xs text-[var(--color-ink-muted)] truncate capitalize flex items-center gap-1 mt-0.5">
                          <Tag size={10} /> {task.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {assigneeName ? (
                      <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0">
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
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLES[task.status] || STATUS_STYLES.pending}`}>
                      {task.status === 'in_progress' && <Clock size={10} />}
                      {task.status === 'blocked' && <Ban size={10} />}
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-[var(--color-ink-subtle)]" />
                      <span className={`text-xs font-medium ${dateInfo.isOverdue ? "text-rose-500 font-bold" : "text-[var(--color-ink)]"}`}>{dateInfo.text}</span>
                      {dateInfo.isOverdue && <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold text-rose-500">OVERDUE</span>}
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
                            {isUnassigned && (
                              <>
                                <button onClick={() => onClaim(task.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"><UserIcon size={14} /> Claim Task</button>
                                <div className="h-px bg-[var(--color-surface-border)]" />
                              </>
                            )}
                            {!isUnassigned && (
                              <>
                                <button onClick={() => onStatusChange(task.id, "in_progress")} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors"><Clock size={14} /> Mark In Progress</button>
                                <button onClick={() => onStatusChange(task.id, "completed")} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"><CheckCircle2 size={14} /> Mark Completed</button>
                                <div className="h-px bg-[var(--color-surface-border)]" />
                              </>
                            )}
                            <div className="h-px bg-[var(--color-surface-border)] mx-2 my-1" />
                            <button onClick={() => onEdit(task)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"><Pencil size={14} /> Edit Task</button>
                            <button onClick={() => onArchive(task.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"><Archive size={14} /> Archive Task</button>
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
