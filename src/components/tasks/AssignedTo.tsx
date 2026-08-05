"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar, Tag, Clock, Ban, CheckCircle2, MoreVertical,
  Users, UserX, Wrench, Building2, Briefcase, DollarSign, Shield, Car, Archive,
  Search, Flag
} from "lucide-react";
import UserFilterSelector from "@/components/ui/UserFilterSelector";
import type { Task, User } from "@/lib/types";

interface AssignedToTabProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  metrics: { user: { total: number; overdue: number; completed: number } };
  
  search: string;
  setSearch: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  selectedUserId: string;
  setSelectedUserId: (val: string) => void;
  
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  pageSize: number;
  totalPages: number;
  filteredTasks: Task[];

  openDropdownId: number | null;
  dropdownPos: { top: number; right: number } | null;
  onToggleDropdown: (e: React.MouseEvent, taskId: number) => void;
  onStatusChange: (taskId: number, status: Task["status"]) => void;
  onArchive: (taskId: number) => void;
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

const PRIORITIES = ["urgent", "high", "medium", "low"];

export default function AssignedToTab({
  tasks, users, loading, metrics,
  search, setSearch, priorityFilter, setPriorityFilter,
  selectedUserId, setSelectedUserId,
  currentPage, setCurrentPage, pageSize, totalPages, filteredTasks,
  openDropdownId, dropdownPos, onToggleDropdown, onStatusChange, onArchive
}: AssignedToTabProps) {

  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);

  const [showCompleted, setShowCompleted] = useState(false);
  const displayTasks = useMemo(() => {
    return filteredTasks.filter(t => showCompleted ? t.status === "completed" : t.status !== "completed");
  }, [filteredTasks, showCompleted]);

  const displayTotalPages = Math.ceil(displayTasks.length / pageSize) || 1;
  const paginatedDisplayTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayTasks.slice(start, start + pageSize);
  }, [displayTasks, currentPage, pageSize]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) setIsPriorityOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return { text: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), isOverdue };
  };

  const getAssigneeName = (userId: number | null) => {
    if (!userId) return null;
    const user = users.find((u) => u.id === userId);
    return user?.full_name || "Unknown User";
  };

  const selectedUser = users.find(u => u.id.toString() === selectedUserId);

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 animate-spin" /> Loading tasks...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* TOOLBAR */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto">
          <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-surface-border)] flex-shrink-0">
            <button 
              onClick={() => { setShowCompleted(false); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${!showCompleted ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}
            >
              Active
            </button>
            <button 
              onClick={() => { setShowCompleted(true); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${showCompleted ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}
            >
              Completed
            </button>
          </div>

          <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Total</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{metrics.user.total}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Overdue</span>
              <span className="text-xs font-bold text-rose-500 tabular-nums">{metrics.user.overdue}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Completed</span>
              <span className="text-xs font-bold text-emerald-500 tabular-nums">{metrics.user.completed}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto ml-auto">
          <div className="relative w-full xl:w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>

          <div className="relative" ref={priorityRef}>
            <button
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              title="Filter by priority"
              className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${priorityFilter ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}
            >
              <Flag size={14} />
            </button>
            {isPriorityOpen && (
              <div className="absolute top-full mt-2 right-0 w-40 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => { setPriorityFilter(""); setIsPriorityOpen(false); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${!priorityFilter ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>All Priorities</button>
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => { setPriorityFilter(p); setIsPriorityOpen(false); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium capitalize transition-colors ${priorityFilter === p ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>{p}</button>
                ))}
              </div>
            )}
          </div>

          <UserFilterSelector 
            users={users} 
            selectedUserId={selectedUserId} 
            onChange={setSelectedUserId} 
          />
        </div>
      </div>

      {/* ✅ CONTENT AREA - No more "Select a user" block */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {displayTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No Assigned Tasks</h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
              {selectedUserId 
                ? `${selectedUser?.full_name} has no tasks matching your filters.` 
                : "There are no assigned tasks in the system right now."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Task</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Assignee</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Priority</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Due Date</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-border)]">
                  {paginatedDisplayTasks.map((task) => {
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
                              <p className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'line-through text-[var(--color-ink-subtle)]' : 'text-[var(--color-ink)]'}`}>{task.title}</p>
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
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${isUnassigned ? STATUS_STYLES.unassigned : STATUS_STYLES[task.status] || STATUS_STYLES.pending}`}>
                            {task.status === 'in_progress' && <Clock size={10} />}
                            {task.status === 'blocked' && <Ban size={10} />}
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-[var(--color-ink-subtle)]" />
                            <span className={`text-xs font-medium ${dateInfo.isOverdue && task.status !== 'completed' ? "text-rose-500 font-bold" : "text-[var(--color-ink)]"}`}>{dateInfo.text}</span>
                            {dateInfo.isOverdue && task.status !== 'completed' && <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold text-rose-500">OVERDUE</span>}
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
                                  {task.status !== 'completed' && (
                                    <>
                                      <button onClick={() => onStatusChange(task.id, "in_progress")} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors"><Clock size={14} /> Mark In Progress</button>
                                      <button onClick={() => onStatusChange(task.id, "completed")} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"><CheckCircle2 size={14} /> Mark Completed</button>
                                      <div className="h-px bg-[var(--color-surface-border)]" />
                                    </>
                                  )}
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

            {displayTasks.length > 0 && (
              <div className="p-4 border-t border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface)]">
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayTasks.length)} of {displayTasks.length} tasks
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95">Previous</button>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">{currentPage} / {displayTotalPages || 1}</span>
                  <button onClick={() => setCurrentPage((p) => Math.min(displayTotalPages, p + 1))} disabled={currentPage === displayTotalPages || displayTotalPages === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
