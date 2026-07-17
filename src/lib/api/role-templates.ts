// src/lib/api/role-templates.ts
import apiClient from "@/lib/api-client";

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
  permissions: string[];
}

export const roleTemplatesApi = {
  // Fetch all role templates for the tenant
  list: () => 
    apiClient.get<RoleTemplate[]>("/role-templates").then((r) => r.data),
  
  // Fetch the master permission matrix (all possible permissions grouped by category)
  getMatrix: () => 
    apiClient.get<PermissionMatrix>("/role-templates/matrix").then((r) => r.data),
  
  // Update a specific role's permissions
  update: (id: number, data: { permissions: string[] }) => 
    apiClient.patch<RoleTemplate>(`/role-templates/${id}`, data).then((r) => r.data),
    
  // Create a new role template
  create: (data: { job_title: string; permissions: string[] }) => 
    apiClient.post<RoleTemplate>("/role-templates", data).then((r) => r.data),
};
