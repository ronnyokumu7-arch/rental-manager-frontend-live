import apiClient from "@/lib/api-client";
import type { PermissionCategory, RoleTemplate } from "@/lib/types";

export const roleTemplatesApi = {
  // Fetches the master dictionary of all possible permissions
  getMatrix: () => 
    apiClient.get<Record<string, PermissionCategory[]>>("/role-templates/matrix").then((r) => r.data),

  // Fetches the current templates for the tenant
  list: () => 
    apiClient.get<RoleTemplate[]>("/role-templates/").then((r) => r.data),

  // Updates the permissions for a specific role template
  update: (templateId: number, permissions: string[]) => 
    apiClient.patch<RoleTemplate>(`/role-templates/${templateId}`, { permissions }).then((r) => r.data),
};
