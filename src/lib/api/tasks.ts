// src/lib/api/tasks.ts
import apiClient from "@/lib/api-client";
import type { Task, TaskUpdatePayload } from "@/lib/types";

export const tasksApi = {
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

  getMyTasks: (params?: { status?: string; category?: string; limit?: number }) =>
    apiClient.get<Task[]>("/tasks/my-tasks", { params }).then((r) => r.data),

  // ✅ FIXED: Removed trailing \n
  getByUser: (userId: number) =>
    apiClient.get<Task[]>(`/tasks/user/${userId}`).then((r) => r.data),

  getUnassigned: (limit: number = 50) =>
    apiClient.get<Task[]>("/tasks/unassigned", { params: { limit } }).then((r) => r.data),

  // ✅ FIXED: Removed trailing \n
  claim: (taskId: number) =>
    apiClient.patch<Task>(`/tasks/${taskId}/claim`).then((r) => r.data),

  // ✅ FIXED: Removed trailing \n
  assign: (taskId: number, userId: number) =>
    apiClient.patch<Task>(`/tasks/${taskId}/assign`, { user_id: userId }).then((r) => r.data),

  // ✅ FIXED: Removed trailing \n
  update: (taskId: number, data: TaskUpdatePayload) =>
    apiClient.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data),
};
