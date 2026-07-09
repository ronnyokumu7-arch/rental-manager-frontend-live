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
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";
import CreateTaskModal from "@/components/tasks/CreateTaskModal"; // ✅ NEW
import { useActionCenterTasks } from "@/hooks/dashboard/useActionCenterTasks";
import { useUpcomingBookings } from "@/hooks/dashboard/useUpcomingBookings";
import { useRecentActivity } from "@/hooks/dashboard/useRecentActivity";
import { tasksApi } from "@/lib/api/tasks"; // ✅ NEW

type SubTab = "tasks" | "bookings" | "activity";

export default function ActionCenterWidget() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("tasks");
  
  // ✅ NEW: Modal State
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const { tasks, loading: tasksLoading, handleClaim, handleComplete } = useActionCenterTasks();
  const { bookings, loading: bookingsLoading } = useUpcomingBookings();
  const { activities, loading: activityLoading } = useRecentActivity();

  // ✅ NEW: Handler to create task
  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksApi.create(taskData);
      toast.success("Task created successfully!");
      setShowCreateTaskModal(false);
      // Refetch tasks to show the new one
      // The hook will auto-refetch or we can manually trigger it
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create task");
      throw error; // Re-throw to let modal handle it
    }
  };

  return (
    <>
      <SectionCard className="!p-0 overflow-hidden border-t-4 border-t-indigo-500">
        {/* Header with Million Dollar Button */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Zap size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Action Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your daily workflow
              </p>
            </div>
          </div>

          {/* ✅ UPDATED: Opens Modal instead of navigating */}
          <button 
            onClick={() => setShowCreateTaskModal(true)}
            className="group relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>New Task</span>
            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Rest of the component remains the same... */}
        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1 px-5 pt-4">
          {[
            { id: "tasks", label: "Tasks", count: tasks.length },
            { id: "bookings", label: "Upcoming", count: bookings.length },
            { id: "activity", label: "Activity", count: activities.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeSubTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeSubTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-5 min-h-[300px]">
          {/* TAB 1: TASKS */}
          {activeSubTab === "tasks" && (
            <div className="space-y-3">
              {tasksLoading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                  <p className="text-sm font-medium text-slate-600">All caught up!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                      {/* Priority Dot */}
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        task.priority === 'urgent' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                        task.priority === 'high' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 
                        task.priority === 'medium' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 
                        'bg-slate-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{task.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.status === "unassigned" && (
                        <button 
                          onClick={() => handleClaim(task.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors"
                        >
                          <UserPlus size={12} /> Assign
                        </button>
                      )}
                      {task.status === "pending" && (
                        <button 
                          onClick={() => handleComplete(task.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 transition-colors"
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
            <div className="space-y-3">
              {bookingsLoading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No upcoming bookings</div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Booking #{booking.booking_number || booking.id}</p>
                        <p className="text-xs text-slate-500">{new Date(booking.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
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
            <div className="space-y-4">
              {activityLoading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading activity...</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No recent activity</div>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ✅ NEW: Create Task Modal */}
      <CreateTaskModal
        open={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onCreate={handleCreateTask}
      />
    </>
  );
}
