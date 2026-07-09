// src/components/profile/UserTasksCard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, Circle, Clock, Loader2, Tag, Car, Wallet,
  Users, CalendarDays, Shield, AlertCircle, CheckCircle, UserPlus
} from "lucide-react";
import toast from "react-hot-toast";
import SectionCard from "@/components/ui/SectionCard";
import { tasksApi } from "@/lib/api/tasks";
import { usersApi } from "@/lib/api/users";
import type { Task, User } from "@/lib/types";

interface UserTasksCardProps {
  userId: number;
  currentUserRole?: string;
  isSelfView?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  fleet: Car,
  finance: Wallet,
  hr: Users,
  booking: CalendarDays,
  compliance: Shield,
};

export default function UserTasksCard({
  userId,
  currentUserRole,
  isSelfView = false,
}: UserTasksCardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "unassigned">("pending");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);

  const isAdmin =
    currentUserRole === "tenant_admin" || currentUserRole === "super_admin";

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      usersApi
        .list({ is_active: true })
        .then(setStaffMembers)
        .catch((err) => console.error("Failed to fetch staff list", err));
    }
  }, [userId, isAdmin]);

  // ── Centralized Fetch (Prevents "vanishing" tasks) ─────────────────
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const targetTasks = isSelfView
        ? await tasksApi.getMyTasks({ limit: 50 })
        : await tasksApi.getByUser(userId);

      setTasks(targetTasks);

      if (isAdmin) {
        const pool = await tasksApi.getUnassigned(50);
        setUnassignedTasks(pool);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle Complete ────────────────────────────────────────────────
  const handleToggleComplete = async (task: Task) => {
    setUpdatingId(task.id);
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await tasksApi.update(task.id, {
        status: newStatus,
        completed_at:
          newStatus === "completed" ? new Date().toISOString() : null,
      });
      await fetchTasks();
      toast.success(
        newStatus === "completed" ? "Task completed!" : "Task reopened."
      );
    } catch {
      toast.error("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Claim Task (Assign to self) ────────────────────────────────────
  const handleClaimTask = async (task: Task) => {
    setUpdatingId(task.id);
    try {
      await tasksApi.claim(task.id);
      toast.success("Task claimed successfully!");
      await fetchTasks();
      setActiveTab("pending");
    } catch {
      toast.error("Failed to claim task");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Assign Task (Admin assigns to staff) ───────────────────────────
  const handleAssignTask = async (taskId: number, targetUserId: number) => {
    setUpdatingId(taskId);
    try {
      await tasksApi.assign(taskId, targetUserId);
      toast.success("Task assigned successfully!");
      setAssigningTaskId(null);
      await fetchTasks();
    } catch {
      toast.error("Failed to assign task");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Derived State ──────────────────────────────────────────────────
  const displayTasks =
    activeTab === "unassigned"
      ? unassignedTasks
      : activeTab === "completed"
      ? tasks.filter((t) => t.status === "completed")
      : tasks.filter((t) => t.status !== "completed");

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  const unassignedCount = unassignedTasks.length;

  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <CheckCircle2
              size={18}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Action Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pendingCount} pending &bull; {unassignedCount} unassigned
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
            activeTab === "pending"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          Pending ({tasks.filter((t) => t.status !== "completed").length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
            activeTab === "completed"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          Completed
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
              activeTab === "unassigned"
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <AlertCircle size={12} /> Unassigned ({unassignedTasks.length})
          </button>
        )}
      </div>

      {/* ── Tasks List ──────────────────────────────────────────── */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {activeTab === "unassigned"
              ? "No tasks in the unassigned pool. Great job!"
              : "No tasks found in this view."}
          </div>
        ) : (
          displayTasks.map((task) => {
            const Icon = CATEGORY_ICONS[task.category] || Tag;
            const isCompleted = task.status === "completed";
            const isUnassignedTab = activeTab === "unassigned";

            return (
              <div
                key={task.id}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  isCompleted ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* ── Action Area ── */}
                  {isUnassignedTab ? (
                    <div className="flex items-center gap-2 mt-0.5 flex-shrink-0">
                      {assigningTaskId === task.id ? (
                        <select
                          className="text-xs border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                          onChange={(e) => {
                            if (e.target.value)
                              handleAssignTask(task.id, Number(e.target.value));
                          }}
                          onBlur={() => setAssigningTaskId(null)}
                          autoFocus
                          disabled={updatingId === task.id}
                        >
                          <option value="">Assign to...</option>
                          {staffMembers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.full_name} ({u.job_title || "Staff"})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>
                          <button
                            onClick={() => handleClaimTask(task)}
                            disabled={updatingId === task.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 transition-colors disabled:opacity-50"
                          >
                            {updatingId === task.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            Claim
                          </button>
                          <button
                            onClick={() => setAssigningTaskId(task.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                          >
                            <UserPlus size={12} />
                            Assign
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleComplete(task)}
                      disabled={updatingId === task.id}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {updatingId === task.id ? (
                        <Loader2
                          size={18}
                          className="animate-spin text-blue-600"
                        />
                      ) : isCompleted ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle
                          size={18}
                          className="text-slate-300 hover:text-blue-500"
                        />
                      )}
                    </button>
                  )}

                  {/* ── Task Content ── */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted
                            ? "line-through text-slate-500"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          PRIORITY_COLORS[task.priority] ||
                          PRIORITY_COLORS.medium
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Icon size={12} />
                        <span className="capitalize">{task.category}</span>
                      </div>
                      {task.due_date && (
                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            new Date(task.due_date) < new Date() && !isCompleted
                              ? "text-red-600 font-semibold"
                              : "text-slate-500"
                          }`}
                        >
                          <Clock size={12} />
                          <span>
                            {new Date(task.due_date).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        </div>
                      )}
                      {isUnassignedTab && task.requires_role && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Needs: {task.requires_role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}
