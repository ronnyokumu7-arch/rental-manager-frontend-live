// src/hooks/profile/useOperations.ts
import { useState, useEffect, useCallback } from "react";
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

  // ✅ Helper to fetch tasks based on context
  const fetchTasksForContext = useCallback(async () => {
    try {
      if (isAdmin && !isSelfView) {
        return await tasksApi.getByUser(userId);
      } else {
        return await tasksApi.getMyTasks({ limit: 100 });
      }
    } catch (error) {
      console.error("Failed to fetch tasks for context", error);
      // Fallback to my-tasks if specific user fetch fails
      return await tasksApi.getMyTasks({ limit: 100 });
    }
  }, [userId, isAdmin, isSelfView]);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const targetTasks = await fetchTasksForContext();
        setTasks(targetTasks);
        
        // Auto-select the first pending task ONLY if no task is currently selected
        // and there are pending tasks available
        if (!selectedTask && targetTasks.length > 0) {
           const firstPending = targetTasks.find(t => t.status === "pending");
           if (firstPending) {
             setSelectedTask(firstPending);
           } else if (targetTasks.length > 0) {
             // If no pending tasks, select the first one regardless of status
             setSelectedTask(targetTasks[0]);
           }
        }

        // Fetch admin-specific data (Unassigned Pool + Staff List)
        if (isAdmin) {
          try {
            const [pool, staff] = await Promise.all([
              tasksApi.getUnassigned(100),
              usersApi.list({ is_active: true })
            ]);
            setUnassignedTasks(pool);
            setStaffMembers(staff);
          } catch (adminError) {
            console.warn("Failed to fetch admin data (pool/staff)", adminError);
            // Non-critical error, we can still show the main task list
          }
        }
      } catch (error) {
        console.error("Failed to fetch operations data", error);
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, isAdmin, isSelfView, fetchTasksForContext]); 
  // ✅ REMOVED 'selectedTask' from deps to prevent infinite loops

  // 2. Actions
  const handleToggleComplete = async (taskId: number) => {
    setUpdatingId(taskId);
    try {
      // Aligned with Backend Truth: PATCH /tasks/{task_id} with TaskUpdate payload
      await tasksApi.update(taskId, {
        status: "completed",
        completed_at: new Date().toISOString(),
      });
      toast.success("Task completed!");
      
      // Refresh list using the correct context-aware endpoint
      const updatedTasks = await fetchTasksForContext();
      setTasks(updatedTasks);
      
      // If the completed task was selected, clear the selection or pick the next one
      if (selectedTask?.id === taskId) {
        const nextTask = updatedTasks.find(t => t.id !== taskId && t.status === "pending") || null;
        setSelectedTask(nextTask);
      }
    } catch (error) {
      console.error("Failed to complete task", error);
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
      
      // Refresh unassigned pool
      if (isAdmin) {
        const pool = await tasksApi.getUnassigned(100);
        setUnassignedTasks(pool);
      }
      
      // If the assigned task was selected, clear selection
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error("Failed to assign task", error);
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
