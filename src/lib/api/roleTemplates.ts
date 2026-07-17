// src/lib/api/roleTemplates.ts
import apiClient from "@/lib/api-client";
import type { PermissionCategory, RoleTemplate } from "@/lib/types";

export const roleTemplatesApi = {
  /**
   * Fetches the master dictionary of all possible permissions grouped by category.
   * Used to dynamically render the permission matrix checkboxes in the UI.
   */
  getMatrix: () => 
    apiClient.get<Record<string, PermissionCategory[]>>("/role-templates/matrix").then((r) => r.data),

  /**
   * Fetches all role templates for the current authenticated tenant.
   */
  list: () => 
    apiClient.get<RoleTemplate[]>("/role-templates/").then((r) => r.data),

  /**
   * Updates the permissions for a specific role template.
   * @param templateId - The ID of the role template to update.
   * @param permissions - Array of permission keys to assign to this role.
   */
  update: (templateId: number, permissions: string[]) => 
    apiClient.patch<RoleTemplate>(`/role-templates/${templateId}`, { permissions }).then((r) => r.data),

  /**
   * 🚀 FUTURE: Creates a new role template.
   * NOTE: Uncomment this once you add the corresponding `POST /` endpoint 
   * to your backend `role_templates.py` router to support the "Add New Role" button.
   */
  // create: (data: { job_title: string; permissions: string[] }) => 
  //   apiClient.post<RoleTemplate>("/role-templates/", data).then((r) => r.data),
};
