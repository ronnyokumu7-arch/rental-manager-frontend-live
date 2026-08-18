// src/lib/api/clientInvites.ts
import apiClient from "@/lib/api-client";

export interface ClientInvite {
  id: number;
  tenant_id: number;
  token: string;
  status: "pending" | "accepted" | "revoked";
  expires_at: string;
  accepted_client_id: number | null;
  created_at: string;
  is_expired: boolean;
  is_live: boolean;
}

export const clientInvitesApi = {
  /** Generate a single-use onboarding link */
  create: (ttlDays: number = 7) =>
    apiClient.post<ClientInvite>("/clients/invites", { ttl_days: ttlDays }),

  /** List this tenant's invites (newest first) */
  list: (limit: number = 50) =>
    apiClient.get<ClientInvite[]>("/clients/invites", { params: { limit } }),

  /** Kill a live link */
  revoke: (inviteId: number) =>
    apiClient.delete(`/clients/invites/${inviteId}`),
};
