// src/lib/api/users.ts
import apiClient from "@/lib/api-client";
import type { User } from "@/lib/types";

// ---------------------------------------------------------------------------
// Recovery & Security Interfaces
// ---------------------------------------------------------------------------
export interface SendResetLinkPayload {
  send_to_email: boolean;
  send_to_phone: boolean;
  custom_message?: string;
}

export interface UserRecoveryOptions {
  email_masked: string;
  phone_masked: string | null;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  account_locked_until: string | null;
}

// ---------------------------------------------------------------------------
// Core User Interfaces
// ---------------------------------------------------------------------------
export interface UserCreatePayload {
  full_name: string;
  email: string;
  password?: string;
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
  // ✅ NEW: Image URLs
  avatar_url?: string | null;
  id_image_url?: string | null;
  dl_image_url?: string | null;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  role?: "super_admin" | "tenant_admin" | "tenant_staff";
  is_active?: boolean;
  is_suspended?: boolean;
  suspension_reason?: string | null;
  password?: string;
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  permissions?: string[];
  two_factor_enabled?: boolean;
  id_number?: string | null;
  dl_number?: string | null;
  dl_expiry?: string | null;
  
  // ✅ Verification & Onboarding Lifecycle
  is_onboarded?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  
  // ✅ NEW: Image URLs
  avatar_url?: string | null;
  id_image_url?: string | null;
  dl_image_url?: string | null;
}

// ✅ COMPLETELY EXPANDED: Self-Service Onboarding Payload
export interface AcceptInvitePayload {
  invite_token: string;
  password: string;
  
  // Identity
  full_name: string;
  email: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  
  // Compliance
  id_number?: string | null;
  id_image_url?: string | null;
  dl_number?: string | null;
  dl_image_url?: string | null;
  dl_expiry?: string | null;
}

// ✅ Verification Payloads
export interface VerificationPayload {
  channel: "email" | "phone";
}

export interface VerifyTokenPayload {
  token: string;
  channel: "email" | "phone";
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------
export const usersApi = {
  create: (data: UserCreatePayload) =>
    apiClient.post<User>("/users/", data).then((r) => r.data),

  list: (params?: { tenant_id?: number; role?: string; is_active?: boolean; is_suspended?: boolean }) =>
    apiClient.get<User[]>("/users/", { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  update: (id: number, data: UserUpdatePayload) =>
    apiClient.patch<User>(`/users/${id}`, data).then((r) => r.data),

  suspend: (id: number, reason?: string) =>
    apiClient.post<User>(`/users/${id}/suspend`, null, { params: { reason } }).then((r) => r.data),

  reactivate: (id: number) =>
    apiClient.post<User>(`/users/${id}/reactivate`).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  // 🛡️ Recovery & Security Endpoints
  getRecoveryOptions: (id: number) =>
    apiClient.get<UserRecoveryOptions>(`/users/${id}/recovery-options`).then((r) => r.data),

  sendResetLink: (id: number, payload: SendResetLinkPayload) =>
    apiClient.post<{ message: string }>(`/users/${id}/send-reset-link`, payload).then((r) => r.data),

  // ✅ Accept Invite Endpoint
  acceptInvite: (data: AcceptInvitePayload) =>
    apiClient.post<User>("/users/accept-invite", data).then((r) => r.data),

  // ✅ Verification Endpoints
  sendVerification: (id: number, payload: VerificationPayload) =>
    apiClient.post<{ 
      message: string; 
      verification_link?: string; 
      shareable_message?: string 
    }>(`/users/${id}/send-verification`, payload).then((r) => r.data),

  verifyToken: (data: VerifyTokenPayload) =>
    apiClient.post<User>("/users/verify", data).then((r) => r.data),

  markVerified: (id: number, payload: VerificationPayload) =>
    apiClient.post<User>(`/users/${id}/mark-verified`, payload).then((r) => r.data),
};
