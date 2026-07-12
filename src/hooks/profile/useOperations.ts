// src/hooks/profile/useOperations.ts
import { useState, useEffect } from "react";
import { tasksApi } from "@/lib/api/tasks";
import { usersApi } from "@/lib/api/users";
import type { Task, User } from "@/lib/types";
import toast from "react-hot-toast";

export function useOperations(userId: number, currentUserRole: string, isSelfView: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "unassigned">("pending");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const isAdmin = currentUserRole === "tenant_admin" || currentUserRole === "super_admin";

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch main tasks based on view context
        const targetTasks = isSelfView
          ? await tasksApi.getMyTasks({ limit: 100 })
          : await tasksApi.getByUser(userId);
        
        setTasks(targetTasks);
        
        // Auto-select the first pending task so the right panel isn't empty
        if (targetTasks.length > 0 && !selectedTask) {
           const firstPending = targetTasks.find(t => t.status !== "completed");
           if (firstPending) setSelectedTask(firstPending);
        }

        // Fetch admin-specific data
        if (isAdmin) {
          const [pool, staff] = await Promise.all([
            tasksApi.getUnassigned(100),
            usersApi.list({ is_active: true })
          ]);
          setUnassignedTasks(pool);
          setStaffMembers(staff);
        }
      } catch (error) {
        console.error("Failed to fetch operations data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, isAdmin, isSelfView]); 

  // 2. Actions
  const handleToggleComplete = async (task: Task) => {
    setUpdatingId(task.id);
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await tasksApi.update(task.id, {
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      });
      toast.success(newStatus === "completed" ? "Task completed!" : "Task reopened.");
      
      // Refresh list
      const updatedTasks = isSelfView ? await tasksApi.getMyTasks({ limit: 100 }) : await tasksApi.getByUser(userId);
      setTasks(updatedTasks);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignTask = async (taskId: number, targetUserId: number) => {
    setUpdatingId(taskId);
    try {
      await tasksApi.assign(taskId, targetUserId);
      toast.success("Task assigned successfully!");
      const pool = await tasksApi.getUnassigned(100);
      setUnassignedTasks(pool);
    } catch {
      toast.error("Failed to assign task");
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    tasks, 
    unassignedTasks, 
    staffMembers, 
    selectedTask, 
    setSelectedTask,
    activeTab, 
    setActiveTab, 
    loading, 
    updatingId, 
    isAdmin,
    handleToggleComplete, 
    handleAssignTask
  };
}
