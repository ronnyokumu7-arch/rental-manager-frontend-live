// src/lib/api/tasks.ts
import apiClient from "@/lib/api-client";
import type { Task, TaskUpdatePayload } from "@/lib/types";

export const tasksApi = {
  // ✅ NEW: Create a new task
  create: (data: {
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "urgent";
    category: string;
    due_date?: string | null;
    user_id?: number | null;
    target_type?: string | null;
    target_id?: number | null;
  }) =>
    apiClient.post<Task>("/tasks", data).then((r) => r.data),

  // Fetch tasks assigned to the current user
  getMyTasks: (params?: { status?: string; category?: string; limit?: number }) =>
    apiClient.get<Task[]>("/tasks/my-tasks", { params }).then((r) => r.data),

  // Fetch tasks for a specific user (Admin only)
  getByUser: (userId: number) =>
    apiClient.get<Task[]>(`/tasks/user/${userId}`).then((r) => r.data),

  // Fetch the Unassigned Pool (Admin only)
  getUnassigned: (limit: number = 50) =>
    apiClient.get<Task[]>("/tasks/unassigned", { params: { limit } }).then((r) => r.data),

  // Claim an unassigned task (Assign to myself)
  claim: (taskId: number) =>
    apiClient.patch<Task>(`/tasks/${taskId}/claim`).then((r) => r.data),

  // Admin assigns an unassigned task to a specific user
  assign: (taskId: number, userId: number) =>
    apiClient.patch<Task>(`/tasks/${taskId}/assign`, { user_id: userId }).then((r) => r.data),

  // Update task status (e.g., mark as completed)
  update: (taskId: number, data: TaskUpdatePayload) =>
    apiClient.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data),
};
