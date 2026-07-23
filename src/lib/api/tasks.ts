// src/lib/api/tasks.ts
import apiClient from "@/lib/api-client";
import type { Task, TaskUpdate, TaskCreate } from "@/lib/types";

export const tasksApi = {
  create: (data: TaskCreate) =>
    apiClient.post<Task>("/tasks", data).then((r) => r.data),

  getMyTasks: (params?: { status?: string; category?: string; limit?: number }) =>
    apiClient.get<Task[]>("/tasks/my-tasks", { params }).then((r) => r.data),

  getByUser: (userId: number) =>
    apiClient.get<Task[]>(`/tasks/user/${userId}`).then((r) => r.data),

  getUnassigned: (limit: number = 50) =>
    apiClient.get<Task[]>("/tasks/unassigned", { params: { limit } }).then((r) => r.data),

  // ✅ HARD GUARD: Prevent undefined IDs
  claim: (taskId: number) => {
    if (!taskId || isNaN(Number(taskId))) {
      throw new Error(`[tasksApi.claim] Invalid task ID: ${taskId}`);
    }
    return apiClient.patch<Task>(`/tasks/${taskId}/claim`).then((r) => r.data);
  },

  assign: (taskId: number, userId: number) =>
    apiClient.patch<Task>(`/tasks/${taskId}/assign`, { user_id: userId }).then((r) => r.data),

  // ✅ HARD GUARD: Prevent undefined IDs
  update: (taskId: number, data: TaskUpdate) => {
    if (!taskId || isNaN(Number(taskId))) {
      throw new Error(`[tasksApi.update] Invalid task ID: ${taskId}`);
    }
    return apiClient.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data);
  },
};
