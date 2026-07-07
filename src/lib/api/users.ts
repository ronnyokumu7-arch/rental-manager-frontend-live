import apiClient from "@/lib/api-client";
import type { User } from "@/lib/types";

// ✅ NEW: Interface for creating a user (includes compliance fields)
export interface UserCreatePayload {
  full_name: string;
  email: string;
  password: string;
  role: "super_admin" | "tenant_admin" | "tenant_staff";
  tenant_id?: number | null;
  is_active?: boolean;
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  permissions?: string[];
  two_factor_enabled?: boolean;
  id_number?: string | null;
  dl_number?: string | null;
  dl_expiry?: string | null;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  role?: "super_admin" | "tenant_admin" | "tenant_staff";
  is_active?: boolean;
  password?: string;
  phone_number?: string;
  department?: string;
  permissions?: string[];
  two_factor_enabled?: boolean;
  // ✅ ADDED: Compliance fields for updates
  id_number?: string | null;
  dl_number?: string | null;
  dl_expiry?: string | null;
}

export const usersApi = {
  // ✅ NEW: Create method (This was missing!)
  create: (data: UserCreatePayload) =>
    apiClient.post<User>("/users", data).then((r) => r.data),

  // ── List & Get ────────────────────────────────────────────────────────
  list: (params?: { tenant_id?: number; role?: string; is_active?: boolean; is_suspended?: boolean }) =>
    apiClient.get<User[]>("/users", { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  // ── Update ────────────────────────────────────────────────────────────
  update: (id: number, data: UserUpdatePayload) =>
    apiClient.patch<User>(`/users/${id}`, data).then((r) => r.data),

  // ── Status Transitions ────────────────────────────────────────────────
  suspend: (id: number, reason?: string) =>
    apiClient.post<User>(`/users/${id}/suspend`, null, { params: { reason } }).then((r) => r.data),

  reactivate: (id: number) =>
    apiClient.post<User>(`/users/${id}/reactivate`).then((r) => r.data),

  // ── Delete ────────────────────────────────────────────────────────────
  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),
};
