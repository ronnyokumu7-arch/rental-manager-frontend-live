import { useState, useEffect } from "react";
import { tasksApi } from "@/lib/api/tasks";
import { usersApi } from "@/lib/api/users"; // ✅ NEW
import type { Task, User } from "@/lib/types";
import toast from "react-hot-toast";

export function useActionCenterTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]); // ✅ NEW

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [myTasks, unassigned] = await Promise.all([
        tasksApi.getMyTasks({ limit: 10 }),
        tasksApi.getUnassigned(10),
      ]);
      const combined = [...myTasks, ...unassigned].sort((a, b) => {
        const priorityOrder: any = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
      });
      setTasks(combined.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch active staff for the Assign Modal
  const fetchUsers = async () => {
    try {
      const staff = await usersApi.list();
      setUsers(staff.filter(u => u.is_active && !u.is_suspended));
    } catch (error) {
      console.error("Failed to fetch users", error);
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
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to complete task");
    }
  };

  // ✅ NEW: Assign Task Logic
  const handleAssign = async (taskId: number, userId: number) => {
    try {
      await tasksApi.assign(taskId, userId);
      toast.success("Task assigned successfully!");
      fetchTasks();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to assign task");
      return false;
    }
  };

  return { tasks, users, loading, handleComplete, handleAssign, refetch: fetchTasks };
}
