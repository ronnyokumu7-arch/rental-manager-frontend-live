// src/components/dashboard/ActionCenterWidget.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  UserPlus, 
  Calendar, 
  Clock, 
  ArrowRight,
  Zap,
  Plus,
  Sparkles,
  Tag,
  Loader2
} from "lucide-react";

import { useActionCenterTasks } from "@/hooks/dashboard/useActionCenterTasks";
import { useUpcomingBookings } from "@/hooks/dashboard/useUpcomingBookings";
import { useRecentActivity } from "@/hooks/dashboard/useRecentActivity";

type SubTab = "tasks" | "bookings" | "activity";

export default function ActionCenterWidget() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("tasks");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { tasks, loading: tasksLoading, handleClaim, handleComplete } = useActionCenterTasks();
  const { bookings, loading: bookingsLoading } = useUpcomingBookings();
  const { activities, loading: activityLoading } = useRecentActivity();

  const subTabs = [
    { id: "tasks" as SubTab, label: "Tasks", count: tasks.length },
    { id: "bookings" as SubTab, label: "Upcoming", count: bookings.length },
    { id: "activity" as SubTab, label: "Activity", count: activities.length },
  ];

  // ✅ Helpers for rich task details
  const getPriorityDotColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-rose-500 shadow-[0_0_8px_-2px_rgba(244,63,94,0.6)]';
      case 'high': return 'bg-amber-500 shadow-[0_0_8px_-2px_rgba(245,158,11,0.6)]';
      case 'medium': return 'bg-blue-500 shadow-[0_0_8px_-2px_rgba(59,130,246,0.6)]';
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

  const handleClaimTask = async (taskId: number) => {
    setUpdatingId(taskId);
    await handleClaim(taskId);
    setUpdatingId(null);
  };

  const handleCompleteTask = async (taskId: number) => {
    setUpdatingId(taskId);
    await handleComplete(taskId);
    setUpdatingId(null);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      
      {/* ✅ PREMIUM HEADER: Title + Tabs + Action Button */}
      <div className="p-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/70 flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary)]/20">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)] tracking-tight flex items-center gap-2">
                Action Center
                <Sparkles size={12} className="text-[var(--color-primary)] opacity-60" />
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">Manage your daily workflow</p>
            </div>
          </div>
          
          {/* Right: Tab Switcher + New Task Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)]">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

            <button 
              onClick={() => router.push('/dashboard/tasks/new')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all active:scale-95"
            >
              <Plus size={14} />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* ✅ SCROLLABLE CONTENT AREA: No item limit, smooth custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 max-h-[500px] space-y-3">
        
        {/* TAB 1: TASKS (Rich Design matching OperationsTab) */}
        {activeSubTab === "tasks" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {tasksLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)] text-sm">
                <Clock size={20} className="animate-pulse mb-2" />
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">All caught up!</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">No pending tasks right now.</p>
              </div>
            ) : (
              tasks.map((task) => {
                const overdue = isOverdue(task.due_date);
                return (
                  <div 
                    key={task.id} 
                    className="group relative p-4 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      
                      {/* Priority Dot */}
                      <div className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-surface)] ${getPriorityDotColor(task.priority)}`} />
                      
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <p className="text-sm font-semibold leading-tight text-[var(--color-ink)] mb-1">
                          {task.title}
                        </p>
                        
                        {/* Description */}
                        {task.description && (
                          <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-2.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Meta Row: Category/Department + Due Date */}
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                          {task.category && (
                            <span className="flex items-center gap-1">
                              <Tag size={11} />
                              <span className="capitalize">{task.category}</span>
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${overdue ? "text-rose-500" : ""}`}>
                              <Calendar size={11} />
                              {formatDate(task.due_date)}
                              {overdue && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold">OVERDUE</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {task.status === "unassigned" && (
                          <button 
                            onClick={() => handleClaimTask(task.id)}
                            disabled={updatingId === task.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === task.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <UserPlus size={12} />
                            )}
                            Claim
                          </button>
                        )}
                        {task.status === "pending" && (
                          <button 
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={updatingId === task.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === task.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: UPCOMING BOOKINGS */}
        {activeSubTab === "bookings" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {bookingsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)] text-sm">
                <Clock size={20} className="animate-pulse mb-2" />
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-3">
                  <Calendar size={20} className="text-[var(--color-ink-muted)]" />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No upcoming bookings</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Future reservations will appear here.</p>
              </div>
            ) : (
              bookings.slice(0, 4).map((booking) => (
                <div 
                  key={booking.id} 
                  className="group flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Booking #{booking.booking_number || booking.id}</p>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                    className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all active:scale-95"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: RECENT ACTIVITY */}
        {activeSubTab === "activity" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {activityLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)] text-sm">
                <Clock size={20} className="animate-pulse mb-2" />
                Loading activity...
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-3">
                  <Clock size={20} className="text-[var(--color-ink-muted)]" />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Your activity log will appear here.</p>
              </div>
            ) : (
              activities.slice(0, 4).map((item) => (
                <div key={item.id} className="group flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)]/5 group-hover:border-[var(--color-primary)]/20 transition-colors">
                    <Clock size={14} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{item.title}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
