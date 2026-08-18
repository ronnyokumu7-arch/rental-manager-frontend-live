// src/lib/api/clientInvites.ts
import apiClient from "@/lib/api-client";

export interface ClientInvite {
  id: number;
  tenant_id: number;
  token: string;
  status: "pending" | "accepted" | "revoked";
  expires_at: string;
  expected_name: string | null;   // ✅ who we're expecting (optional)
  expected_phone: string | null;  // ✅ who we're expecting (optional)
  accepted_client_id: number | null;
  created_at: string;
  is_expired: boolean;
  is_live: boolean;
}

export const clientInvitesApi = {
  /** Generate a single-use onboarding link */
  create: (ttlDays: number = 7, expectedName?: string, expectedPhone?: string) =>
    apiClient.post<ClientInvite>("/clients/invites", {
      ttl_days: ttlDays,
      expected_name: expectedName || null,
      expected_phone: expectedPhone || null,
    }),

  /** List this tenant's invites (newest first) */
  list: (limit: number = 50) =>
    apiClient.get<ClientInvite[]>("/clients/invites", { params: { limit } }),

  /** Kill a live link */
  revoke: (inviteId: number) =>
    apiClient.delete(`/clients/invites/${inviteId}`),
};
