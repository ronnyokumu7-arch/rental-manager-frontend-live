import apiClient from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

export interface Permission {
  key: string;
  label: string;
}

export interface PermissionMatrix {
  [category: string]: Permission[];
}

export interface RoleTemplate {
  id: number;
  tenant_id: number;
  job_title: string;
  description?: string | null; // ✅ ADDED: Matches backend RoleTemplateOut
  permissions: string[];
}

export const roleTemplatesApi = {
  // ✅ FIXED: Unwrap .items from PaginatedResponse
  list: () =>
    apiClient.get<PaginatedResponse<RoleTemplate>>("/role-templates/").then((r) => r.data.items),

  // ✅ Backend returns the raw matrix dict (no wrapper) — no change needed
  getMatrix: () =>
    apiClient.get<PermissionMatrix>("/role-templates/matrix").then((r) => r.data),

  update: (id: number, data: { permissions: string[] }) =>
    apiClient.patch<RoleTemplate>(`/role-templates/${id}`, data).then((r) => r.data),

  // ❌ REMOVED: Backend router has NO POST endpoint yet.
  // Re-add this only after a POST / endpoint exists in app/routers/role_templates.py
  // create: (data: { job_title: string; permissions: string[] }) =>
  //   apiClient.post<RoleTemplate>("/role-templates", data).then((r) => r.data),
};
