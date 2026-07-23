// src/lib/api/subscriptions.ts
import apiClient from "@/lib/api-client";

// ✅ 100% ALIGNED with backend PaymentVerificationOut schema
export interface SubscriptionRequest {
  id: number;
  tenant_id: number;
  tenant_name: string | null;
  target_plan: string;             // ✅ Backend sends target_plan
  target_billing_cycle: string;    // ✅ Backend sends target_billing_cycle
  payment_method: "mpesa" | "bank";
  reference_code: string;
  notes?: string;                  // ✅ Backend sends notes
  created_at: string;              // ✅ Backend sends created_at (NOT submitted_at)
  status: "pending" | "approved" | "rejected";
}

export const subscriptionsApi = {
  // ✅ GET /payment-verifications/?status_filter=pending
  getPendingRequests: async (): Promise<SubscriptionRequest[]> => {
    return apiClient
      .get("/payment-verifications/", { params: { status_filter: "pending" } })
      .then((r) => r.data);
  },

  // ✅ PATCH /payment-verifications/{id}/review (Approve)
  approveRequest: async (id: number): Promise<void> => {
    return apiClient.patch(`/payment-verifications/${id}/review`, { 
      status: "approved" 
    });
  },

  // ✅ PATCH /payment-verifications/{id}/review (Reject)
  rejectRequest: async (id: number, reason: string): Promise<void> => {
    return apiClient.patch(`/payment-verifications/${id}/review`, { 
      status: "rejected", 
      rejection_reason: reason 
    });
  },
};
