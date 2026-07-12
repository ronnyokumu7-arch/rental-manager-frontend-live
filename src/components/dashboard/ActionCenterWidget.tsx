// src/components/dashboard/ActionCenterWidget.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  CheckCircle2, 
  UserPlus, 
  Calendar, 
  Clock, 
  ArrowRight,
  Zap,
  Plus
} from "lucide-react";

import { useActionCenterTasks } from "@/hooks/dashboard/useActionCenterTasks";
import { useUpcomingBookings } from "@/hooks/dashboard/useUpcomingBookings";
import { useRecentActivity } from "@/hooks/dashboard/useRecentActivity";

type SubTab = "tasks" | "bookings" | "activity";

export default function ActionCenterWidget() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("tasks");

  const { tasks, loading: tasksLoading, handleClaim, handleComplete } = useActionCenterTasks();
  const { bookings, loading: bookingsLoading } = useUpcomingBookings();
  const { activities, loading: activityLoading } = useRecentActivity();

  const subTabs = [
    { id: "tasks" as SubTab, label: "Tasks", count: tasks.length },
    { id: "bookings" as SubTab, label: "Upcoming", count: bookings.length },
    { id: "activity" as SubTab, label: "Activity", count: activities.length },
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      
      {/* Header */}
      <div className="p-5 border-b border-[var(--color-surface-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)] uppercase tracking-wider">
              Action Center
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">Manage your daily workflow</p>
          </div>
        </div>

        {/* New Task Button */}
        <button 
          onClick={() => router.push('/dashboard/tasks/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
        >
          <Plus size={14} />
          New Task
        </button>
      </div>

      {/* Sub-Tab Switcher */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] w-fit">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === tab.id
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeSubTab === tab.id 
                    ? "bg-white/20 text-white" 
                    : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* TAB 1: TASKS */}
        {activeSubTab === "tasks" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {tasksLoading ? (
              <div className="text-center py-8 text-[var(--color-ink-muted)] text-sm">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} className="text-[var(--color-success-text)]" />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">All caught up!</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">No pending tasks right now.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 transition-all group"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.status === "unassigned" && (
                      <button 
                        onClick={() => handleClaim(task.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                      >
                        <UserPlus size={12} /> Claim
                      </button>
                    )}
                    {task.status === "pending" && (
                      <button 
                        onClick={() => handleComplete(task.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-success-text)] bg-[var(--color-success-bg)] hover:bg-[var(--color-success)] hover:text-white transition-all"
                      >
                        <CheckCircle2 size={12} /> Done
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: UPCOMING BOOKINGS */}
        {activeSubTab === "bookings" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {bookingsLoading ? (
              <div className="text-center py-8 text-[var(--color-ink-muted)] text-sm">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center mb-3">
                  <Calendar size={20} className="text-[var(--color-ink-muted)]" />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No upcoming bookings</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Future reservations will appear here.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-muted)] flex items-center justify-center text-[var(--color-primary)]">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Booking #{booking.booking_number || booking.id}</p>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                        {new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                    className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
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
          <div className="space-y-4 animate-in fade-in duration-200">
            {activityLoading ? (
              <div className="text-center py-8 text-[var(--color-ink-muted)] text-sm">Loading activity...</div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center mb-3">
                  <Clock size={20} className="text-[var(--color-ink-muted)]" />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Your activity log will appear here.</p>
              </div>
            ) : (
              activities.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-[var(--color-ink-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
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
