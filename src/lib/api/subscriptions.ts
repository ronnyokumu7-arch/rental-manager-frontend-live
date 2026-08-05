import apiClient from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

// ✅ 100% ALIGNED with backend PaymentVerificationOut schema
export interface SubscriptionRequest {
  id: number;
  tenant_id: number;
  tenant_name: string | null;
  target_plan: string;             
  target_billing_cycle: string;    
  payment_method: "mpesa" | "bank" | "airtel_money" | "card" | "paypal" | "manual"; // ✅ Expanded to match backend PaymentMethod enum
  reference_code: string;
  notes?: string;                  
  created_at: string;              
  status: "pending" | "approved" | "rejected";
}

export const subscriptionsApi = {
  // ✅ FIXED: Unwrap .items from PaginatedResponse
  getPendingRequests: async (): Promise<SubscriptionRequest[]> => {
    const res = await apiClient.get<PaginatedResponse<SubscriptionRequest>>("/payment-verifications/", { 
      params: { status_filter: "pending" } 
    });
    return res.data.items;
  },

  approveRequest: async (id: number): Promise<SubscriptionRequest> => {
    return apiClient.patch<SubscriptionRequest>(`/payment-verifications/${id}/review`, { 
      status: "approved" 
    }).then((r) => r.data);
  },

  rejectRequest: async (id: number, reason: string): Promise<SubscriptionRequest> => {
    return apiClient.patch<SubscriptionRequest>(`/payment-verifications/${id}/review`, { 
      status: "rejected", 
      rejection_reason: reason 
    }).then((r) => r.data);
  },
};
