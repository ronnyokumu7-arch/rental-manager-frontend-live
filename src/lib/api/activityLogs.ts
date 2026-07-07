import apiClient from "@/lib/api-client";

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  target_type: string | null;
  target_id: number | null;
  details: any | null;
  created_at: string;
}

export const activityLogsApi = {
  list: (userId?: number, limit: number = 20) => {
    const params: any = { limit };
    if (userId) params.user_id = userId;
    return apiClient.get<ActivityLog[]>("/activity-logs", { params }).then((r) => r.data);
  },
};
