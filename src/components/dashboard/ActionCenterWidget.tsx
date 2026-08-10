"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, UserPlus, Calendar, Clock, ArrowRight,
  Zap, Sparkles, Tag, Loader2, MoreVertical
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

import { useActionCenterTasks } from "@/hooks/dashboard/useActionCenterTasks";
import { useUpcomingBookings } from "@/hooks/dashboard/useUpcomingBookings";
import { useRecentActivity } from "@/hooks/dashboard/useRecentActivity";

type SubTab = "tasks" | "bookings" | "activity";

// ✅ Dedicated title, description AND square-balanced icon per tab
const HEADER_COPY: Record<SubTab, { title: string; description: string; icon: LucideIcon; iconClassName?: string }> = {
  tasks: {
    title: "Active Tasks",
    description: "What needs your attention today",
    icon: Zap,
  },
  bookings: {
    title: "Upcoming Bookings",
    description: "Track pickups and drop-offs before they happen",
    icon: Calendar,
    iconClassName: "scale-y-90", // Optical correction: Calendar is 18w×20h, squash to 18×18
  },
  activity: {
    title: "Activity Logs",
    description: "The live pulse of your fleet's latest moves.",
    icon: Clock,
  },
};

export default function ActionCenterWidget() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("tasks");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { tasks, loading: tasksLoading, handleClaim, handleComplete } = useActionCenterTasks();
  const { bookings, loading: bookingsLoading } = useUpcomingBookings();
  const { activities, loading: activityLoading } = useRecentActivity();

  // Close kebab menu on outside click
  useEffect(() => {
    if (openMenuId === null) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-task-menu]")) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openMenuId]);

  const subTabs = [
    { id: "tasks" as SubTab, label: "Tasks", count: tasks.length },
    { id: "bookings" as SubTab, label: "Rentals", count: bookings.length },
    { id: "activity" as SubTab, label: "Activity", count: activities.length },
  ];

  // ✅ Dynamic header copy + icon per active tab
  const headerCopy = HEADER_COPY[activeSubTab];
  const HeaderIcon = headerCopy.icon;

  const getPriorityDotColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-rose-500 shadow-sm shadow-rose-500/50';
      case 'high': return 'bg-amber-500 shadow-sm shadow-amber-500/50';
      case 'medium': return 'bg-blue-500 shadow-sm shadow-blue-500/50';
      default: return 'bg-[var(--color-ink-subtle)]';
    }
  };

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleClaimTask = async (rawId: number | string | undefined | null) => {
    const taskId = Number(rawId);
    if (!taskId || isNaN(taskId)) {
      console.error("Attempted to claim task with invalid ID:", rawId);
      toast.error("Invalid task ID");
      return;
    }
    setUpdatingId(taskId);
    await handleClaim(taskId);
    setUpdatingId(null);
  };

  const handleCompleteTask = async (rawId: number | string | undefined | null) => {
    const taskId = Number(rawId);
    if (!taskId || isNaN(taskId)) {
      console.error("Attempted to complete task with invalid ID:", rawId);
      toast.error("Invalid task ID");
      return;
    }
    setUpdatingId(taskId);
    await handleComplete(taskId);
    setUpdatingId(null);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      
      {/* PREMIUM HEADER — title, description & icon switch per tab */}
      <div className="p-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 flex items-center justify-center text-white shadow-md shadow-[var(--color-primary)]/20">
              <HeaderIcon size={20} className={headerCopy.iconClassName} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)] tracking-tight flex items-center gap-2">
                {headerCopy.title}
                <Sparkles size={12} className="text-[var(--color-primary)] opacity-70" />
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{headerCopy.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] max-w-full overflow-x-auto">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeSubTab === tab.id
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeSubTab === tab.id 
                        ? "bg-white/20 text-white" 
                        : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 sm:p-5 max-h-80 space-y-2.5 sm:space-y-3">
        
        {/* TAB 1: TASKS */}
        {activeSubTab === "tasks" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {tasksLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)] text-sm">
                <Loader2 size={20} className="animate-spin mb-2 text-[var(--color-primary)]" />
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">All caught up!</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">No pending tasks right now.</p>
              </div>
            ) : (
              tasks.map((task) => {
                const overdue = task.due_date ? isOverdue(task.due_date) : false;
                const safeTaskId = (task as any).id ?? (task as any).task_id;
                const hasActions = task.status !== "completed";

                return (
                  <div 
                    key={safeTaskId} 
                    className="group relative p-3 sm:p-4 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-surface)] ${getPriorityDotColor(task.priority)}`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight text-[var(--color-ink)] mb-1">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-2 sm:mb-2.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                          {task.category && (
                            <span className="flex items-center gap-1">
                              <Tag size={11} />
                              <span className="capitalize">{task.category}</span>
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${overdue ? "text-rose-600 dark:text-rose-400 font-bold" : ""}`}>
                              <Calendar size={11} />
                              {formatDate(task.due_date)}
                              {overdue && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-extrabold">OVERDUE</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Kebab (⋮) action menu */}
                      {hasActions && (
                        <div className="relative flex-shrink-0 -mr-1 -mt-1" data-task-menu>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === safeTaskId ? null : safeTaskId);
                            }}
                            className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
                            aria-label="Task actions"
                          >
                            {updatingId === safeTaskId ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <MoreVertical size={16} />
                            )}
                          </button>

                          {openMenuId === safeTaskId && (
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-lg shadow-black/5 z-20 overflow-hidden animate-in fade-in slide-up duration-150">
                              {task.status === "unassigned" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleClaimTask(safeTaskId);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                >
                                  <UserPlus size={14} />
                                  Claim Task
                                </button>
                              )}
                              {task.status !== "unassigned" && task.status !== "completed" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleCompleteTask(safeTaskId);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                >
                                  <CheckCircle2 size={14} />
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeSubTab === "bookings" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {bookingsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)] text-sm">
                <Loader2 size={20} className="animate-spin mb-2 text-[var(--color-primary)]" />
                Loading rentals...
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Calendar size={20} />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No upcoming rentals</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Scheduled rentals will appear here.</p>
              </div>
            ) : (
              bookings.map((booking: any) => (
                <div
                  key={booking.id ?? booking.booking_id}
                  className="p-3 sm:p-4 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                      {booking.customer_name || booking.customer || "Customer"}
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">
                      {booking.vehicle_name || booking.vehicle || "Vehicle"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-[var(--color-ink-subtle)] uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(booking.start_date || booking.pickup_date)}
                      </span>
                    </div>
                  </div>
                  {booking.status && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {booking.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITY */}
        {activeSubTab === "activity" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {activityLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)] text-sm">
                <Loader2 size={20} className="animate-spin mb-2 text-[var(--color-primary)]" />
                Loading activity...
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <Clock size={20} />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Recent fleet moves will be logged here.</p>
              </div>
            ) : (
              activities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="p-3 sm:p-4 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0 text-[var(--color-primary)] mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--color-ink)] leading-snug">
                      {activity.title || activity.description || activity.action}
                    </p>
                    {activity.timestamp && (
                      <p className="text-[10px] text-[var(--color-ink-muted)] mt-1 font-medium">
                        {formatDate(activity.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

{/* FOOTER */}
      <div className="p-3.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-center mt-auto">
        <button
          onClick={() => router.push(`/dashboard/${activeSubTab}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
        >
          View all {headerCopy.title}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
