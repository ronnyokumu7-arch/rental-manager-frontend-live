// src/hooks/dashboard/useActionCenterTasks.ts
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
      // ✅ UPDATED: Increased limit to 50 to ensure scrolling widget has enough data
      try {
        myTasks = await tasksApi.getMyTasks({ limit: 50 });
      } catch (error) {
        console.error("Failed to fetch personal tasks:", error);
      }

      // 2. Safely attempt to fetch unassigned tasks (Gracefully absorb 403 errors for standard staff)
      // ✅ UPDATED: Increased limit to 50
      try {
        unassignedTasks = await tasksApi.getUnassigned(50);
      } catch (error: any) {
        if (error.response?.status !== 403) {
          console.error("Failed to fetch unassigned tasks:", error);
        }
      }

      // 3. Merge and organize by priority rules matching backend expectations
      const combined = [...myTasks, ...unassignedTasks].sort((a, b) => {
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
      });

      // ✅ UPDATED: Removed .slice(0, 5) so all fetched tasks are passed to the UI for scrolling
      setTasks(combined);
    } catch (error) {
      console.error("Failed to compile tasks pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  // Safely attempt to fetch system users for task allocation dialogs
  const fetchUsers = async () => {
    try {
      const staff = await usersApi.list();
      setUsers(staff.filter(u => u.is_active && !u.is_suspended));
    } catch (error: any) {
      if (error.response?.status !== 403) {
        console.error("Failed to fetch user directory:", error);
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
    refetch: fetchTasks 
  };
}
