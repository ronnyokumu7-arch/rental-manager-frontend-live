import apiClient from "@/lib/api-client";
import type { Task, TaskUpdate, TaskCreate, PaginatedResponse } from "@/lib/types";
import { ScheduledTask } from "@/hooks/scheduler/useTaskSchedulerTimeline";

// ---------------------------------------------------------------------------
// Task Scheduler Mapping Helpers
// ---------------------------------------------------------------------------

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  return new Date(dateStr).toISOString().split("T")[0];
};

const mapToScheduledTask = (task: any): ScheduledTask => {
  let frontendStatus: ScheduledTask["status"] = "todo";
  if (task.status === "in_progress") frontendStatus = "in_progress";
  else if (task.status === "in_review") frontendStatus = "in_review";
  else if (task.status === "completed") frontendStatus = "completed";
  else if (task.status === "blocked") frontendStatus = "blocked";

  let progress = 0;
  if (frontendStatus === "completed") progress = 100;
  else if (frontendStatus === "in_progress") progress = 50;
  else if (frontendStatus === "in_review") progress = 90;

  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    assignedUserId: task.user_id,
    // ✅ FIXED: Backend TaskOut lacks start_date. Fallback to created_at or due_date for scheduler placement.
    startDate: formatDate(task.start_date || task.created_at || task.due_date),
    dueDate: formatDate(task.due_date),
    status: frontendStatus,
    priority: task.priority || "medium",
    progressPercentage: progress,
  };
};

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------
export const tasksApi = {
  create: (data: TaskCreate) =>
    apiClient.post<Task>("/tasks", data).then((r) => r.data),

  // ✅ FIXED: Unwrap .items, enforce page_size param
  getMyTasks: (params?: { status?: string; category?: string; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Task>>("/tasks/my-tasks", { params }).then((r) => r.data.items),

  // ✅ FIXED: Unwrap .items
  getByUser: (userId: number, params?: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Task>>(`/tasks/user/${userId}`, { params }).then((r) => r.data.items),

  // ✅ FIXED: Unwrap .items
  getUnassigned: (params?: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Task>>("/tasks/unassigned", { params }).then((r) => r.data.items),

  claim: (taskId: number) => {
    if (!taskId || isNaN(Number(taskId))) {
      throw new Error(`[tasksApi.claim] Invalid task ID: ${taskId}`);
    }
    return apiClient.patch<Task>(`/tasks/${taskId}/claim`).then((r) => r.data);
  },

  assign: (taskId: number, userId: number) =>
    apiClient.patch<Task>(`/tasks/${taskId}/assign`, { user_id: userId }).then((r) => r.data),

  update: (taskId: number, data: TaskUpdate) => {
    if (!taskId || isNaN(Number(taskId))) {
      throw new Error(`[tasksApi.update] Invalid task ID: ${taskId}`);
    }
    return apiClient.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data);
  },

  // =========================================================================
  // ✅ TASK SCHEDULER SPECIFIC METHODS 
  // =========================================================================

  getSchedulerTasks: async (): Promise<ScheduledTask[]> => {
    // ✅ FIXED: Unwrap .items, use page_size
    const res = await apiClient.get<PaginatedResponse<Task>>("/tasks/my-tasks", {
      params: { page_size: 200 },
    });
    return res.data.items.map(mapToScheduledTask);
  },

  createSchedulerTask: async (payload: {
    assignedUserId: number;
    startDate: string;
    dueDate: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "urgent";
  }): Promise<ScheduledTask> => {
    const backendPayload: Partial<TaskCreate> = {
      title: payload.title,
      description: payload.description || "",
      category: "operations", 
      priority: payload.priority,
      user_id: payload.assignedUserId,
      // ✅ FIXED: Removed start_date. Backend TaskCreate schema does not support it.
      due_date: payload.dueDate,
      is_system_generated: false,
    };

    const createdTask = await apiClient.post<Task>("/tasks/", backendPayload).then((r) => r.data);
    return mapToScheduledTask(createdTask);
  },

  updateSchedulerTask: async (
    taskId: number,
    data: Partial<ScheduledTask>
  ): Promise<ScheduledTask> => {
    if (!taskId || isNaN(Number(taskId))) {
      throw new Error(`[tasksApi.updateSchedulerTask] Invalid task ID: ${taskId}`);
    }

    const backendPayload: any = {};

    if (data.assignedUserId !== undefined) backendPayload.user_id = data.assignedUserId;
    // ✅ FIXED: Removed start_date mapping. Backend TaskUpdate schema does not support it.
    if (data.dueDate !== undefined) backendPayload.due_date = data.dueDate;

    if (data.status !== undefined) {
      backendPayload.status = data.status === "todo" ? "pending" : data.status;
    }

    const updatedTask = await apiClient.patch<Task>(`/tasks/${taskId}`, backendPayload).then((r) => r.data);
    return mapToScheduledTask(updatedTask);
  },
};
