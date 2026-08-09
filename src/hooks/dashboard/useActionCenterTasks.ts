import { useState, useEffect } from "react";
import { tasksApi } from "@/lib/api/tasks";
import { usersApi } from "@/lib/api/users";
import type { Task, User } from "@/lib/types";
import toast from "react-hot-toast";

export function useActionCenterTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let myTasks: Task[] = [];
      let unassignedTasks: Task[] = [];

      // 1. Fetch personal tasks (Accessible by all roles)
      try {
        myTasks = await tasksApi.getMyTasks({ page_size: 50 }); // ✅ FIXED: 'limit' → 'page_size'
      } catch {
        console.error("Failed to fetch personal tasks:");
      }

      // 2. Safely attempt to fetch unassigned tasks (Gracefully absorb 403 errors for standard staff)
      try {
        unassignedTasks = await tasksApi.getUnassigned({ page_size: 50 }); // ✅ FIXED: number → params object
      } catch (_error: any) {
        if (_error.response?.status !== 403) {
          console.error("Failed to fetch unassigned tasks:");
        }
      }

      // 3. Merge, filter out completed, and organize by priority rules
      const combined = [...myTasks, ...unassignedTasks]
        .filter((t) => t.status !== "completed") // ✅ ADDED: Action Center is for active work only
        .sort((a, b) => {
          const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
        });

      setTasks(combined);
    } catch {
      console.error("Failed to compile tasks pipeline:");
    } finally {
      setLoading(false);
    }
  };

  // Safely attempt to fetch system users for task allocation dialogs
  const fetchUsers = async () => {
    try {
      const staff = await usersApi.list();
      setUsers(staff.filter((u: User) => u.is_active && !u.is_suspended)); // ✅ FIXED: typed callback param
    } catch (_error: any) {
      if (_error.response?.status !== 403) { // ✅ FIXED: 'error' → '_error' (consistent naming)
        console.error("Failed to fetch user directory:", _error); // ✅ FIXED: 'error' → '_error'
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const handleComplete = async (taskId: number) => {
    try {
      await tasksApi.update(taskId, { status: "completed" });
      toast.success("Task completed!");
      await fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to complete task");
    }
  };

  const handleClaim = async (taskId: number) => {
    try {
      await tasksApi.claim(taskId);
      toast.success("Task claimed successfully!");
      await fetchTasks();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to claim task");
      return false;
    }
  };

  const handleAssign = async (taskId: number, userId: number) => {
    try {
      await tasksApi.assign(taskId, userId);
      toast.success("Task assigned successfully!");
      await fetchTasks();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to assign task");
      return false;
    }
  };

  return {
    tasks,
    users,
    loading,
    handleComplete,
    handleClaim,
    handleAssign,
    refetch: fetchTasks,
  };
}