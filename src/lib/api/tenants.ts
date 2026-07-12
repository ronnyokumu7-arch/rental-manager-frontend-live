// src/lib/api/tenants.ts
import apiClient from "@/lib/api-client";
import type {
  Tenant,
  CreateTenantPayload,
  UpdateTenantPayload,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Recovery & Security Interfaces
// ---------------------------------------------------------------------------
export interface AdminRecoveryOptions {
  admin_email_masked: string;
  admin_phone_masked: string | null;
  phone_verified: boolean;
  reset_attempts_remaining: number;
  email_change_cooldown_minutes: number;
  last_reset_request_at: string | null;
}

export interface ChangeAdminEmailPayload {
  new_email: string;
  verification_method: "email" | "phone" | "manual_override";
  reason: string;
  otp?: string;
}

export interface SendResetLinkPayload {
  send_to_email: boolean;
  send_to_phone: boolean;
  custom_message?: string;
}

// ---------------------------------------------------------------------------
// Payment Gateway Interfaces
// ---------------------------------------------------------------------------
export interface PaymentGatewayConfig {
  id: number;
  tenant_id: number;
  type: string;
  is_active: boolean;
  [key: string]: any; // Masked credentials and other dynamic fields
}

export interface TenantListResponse {
  data?: Tenant[];
  items?: Tenant[];
  total?: number;
}

export const tenantsApi = {
  /**
   * GET /tenants/
   * Returns list of tenants. Handles both array and paginated object responses.
   */
  list: async (skip = 0, limit = 100): Promise<Tenant[]> => {
    const res = await apiClient
      .get<Tenant[] | TenantListResponse>(`/tenants/?skip=${skip}&limit=${limit}`)
      .then((r) => r.data);

    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  },

  /**
   * GET /tenants/me
   * Fetches active tenant context for current authenticated tenant admin.
   */
  getMe: async (): Promise<Tenant> => {
    return apiClient.get<Tenant>("/tenants/me").then((r) => r.data);
  },

  /**
   * PATCH /tenants/me
   * Self-service update for active tenant admin.
   */
  updateMe: async (payload: UpdateTenantPayload): Promise<Tenant> => {
    return apiClient.patch<Tenant>("/tenants/me", payload).then((r) => r.data);
  },

  /**
   * GET /tenants/{tenant_id}
   * Retrieves full details for a single tenant by ID.
   */
  getById: async (id: number | string): Promise<Tenant> => {
    return apiClient.get<Tenant>(`/tenants/${id}`).then((r) => r.data);
  },

  /**
   * POST /tenants/
   * Provisions a new tenant workspace and initial admin account.
   */
  create: async (payload: CreateTenantPayload): Promise<Tenant> => {
    return apiClient.post<Tenant>("/tenants/", payload).then((r) => r.data);
  },

  /**
   * PATCH /tenants/{tenant_id}
   * Super Admin update for specific tenant configuration.
   */
  update: async (
    id: number | string,
    payload: UpdateTenantPayload
  ): Promise<Tenant> => {
    return apiClient.patch<Tenant>(`/tenants/${id}`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/transition-to-payg
   */
  transitionToPayg: async (id: number | string): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/transition-to-payg`).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/suspend
   */
  suspend: async (id: number | string, reason?: string): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/suspend`, null, { params: { reason } }).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/activate
   */
  activate: async (id: number | string): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/activate`).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/archive
   * Moves tenant to Vault (Soft Delete)
   */
  archive: async (id: number | string): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/archive`).then((r) => r.data);
  },

  /**
   * DELETE /tenants/{tenant_id}
   */
  delete: async (id: number | string, hardDelete = false): Promise<void> => {
    return apiClient.delete(`/tenants/${id}`, { params: { hard_delete: hardDelete } });
  },

  // ---------------------------------------------------------------------------
  // 🛡️ Recovery & Security Endpoints
  // ---------------------------------------------------------------------------

  /**
   * GET /tenants/{tenant_id}/admin-recovery-options
   * Returns masked contacts and rate limit status for recovery UI.
   */
  getRecoveryOptions: async (id: number | string): Promise<AdminRecoveryOptions> => {
    return apiClient.get<AdminRecoveryOptions>(`/tenants/${id}/admin-recovery-options`).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/change-admin-email
   * High-security dual-channel email change with OTP verification.
   */
  changeAdminEmail: async (
    id: number | string,
    payload: ChangeAdminEmailPayload
  ): Promise<{ message: string; new_email: string; notification_sent_to: string }> => {
    return apiClient.post(`/tenants/${id}/change-admin-email`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/send-reset-link
   * Triggers password reset instructions via email and/or SMS.
   */
  sendResetLink: async (
    id: number | string,
    payload: SendResetLinkPayload
  ): Promise<{ message: string }> => {
    return apiClient.post(`/tenants/${id}/send-reset-link`, payload).then((r) => r.data);
  },

  // ---------------------------------------------------------------------------
  // 💳 Payment Gateway Endpoints
  // ---------------------------------------------------------------------------

  /**
   * GET /tenants/{tenant_id}/payment-gateways
   * Lists all configured gateways with masked credentials.
   */
  getPaymentGateways: async (
    id: number | string
  ): Promise<{ gateways: PaymentGatewayConfig[] }> => {
    return apiClient.get(`/tenants/${id}/payment-gateways`).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/payment-gateways/{gateway_type}
   * Creates a new gateway configuration.
   */
  createPaymentGateway: async (
    id: number | string,
    gatewayType: string,
    payload: Record<string, any>
  ): Promise<PaymentGatewayConfig> => {
    return apiClient.post(`/tenants/${id}/payment-gateways/${gatewayType}`, payload).then((r) => r.data);
  },

  /**
   * PATCH /tenants/{tenant_id}/payment-gateways/{gateway_type}/{config_id}
   * Updates an existing gateway configuration.
   */
  updatePaymentGateway: async (
    id: number | string,
    gatewayType: string,
    configId: number,
    payload: Record<string, any>
  ): Promise<PaymentGatewayConfig> => {
    return apiClient.patch(`/tenants/${id}/payment-gateways/${gatewayType}/${configId}`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/payment-gateways/{gateway_type}/test
   * Tests connectivity to a gateway without saving credentials.
   */
  testPaymentGateway: async (
    id: number | string,
    gatewayType: string,
    payload: Record<string, any>
  ): Promise<{ gateway_type: string; status: string; message: string }> => {
    return apiClient.post(`/tenants/${id}/payment-gateways/${gatewayType}/test`, payload).then((r) => r.data);
  },
};
