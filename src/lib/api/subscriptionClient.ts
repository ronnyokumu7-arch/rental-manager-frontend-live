import apiClient from "@/lib/api-client";
import { SubscriptionOut, PaginatedResponse } from "@/lib/types"; // ✅ Added PaginatedResponse import

// ✅ Strict payload matching the backend PaymentVerificationCreate schema
export interface PaymentVerificationPayload {
  target_plan: string;
  target_billing_cycle: string;
  payment_method: "mpesa" | "bank";
  reference_code: string;
  notes?: string;
}

export const subscriptionClient = {
  // GET /subscriptions/my
  // ✅ FIXED: Unwrap .items from PaginatedResponse so the hook receives a true array
  getStatus: async (): Promise<SubscriptionOut[]> => {
    const { data } = await apiClient.get<PaginatedResponse<SubscriptionOut>>("/subscriptions/my");
    return data.items;
  },

  // PATCH /subscriptions/{id}
  // (No change needed: Backend returns a single SubscriptionOut object, not a paginated list)
  updateAutoRenew: async (id: number, autoRenew: boolean): Promise<SubscriptionOut> => {
    const { data } = await apiClient.patch<SubscriptionOut>(`/subscriptions/${id}`, {
      auto_renew: autoRenew,
    });
    return data;
  },

  // POST /payment-verifications/
  // (No change needed: Backend returns a single PaymentVerificationOut object)
  verifyPayment: async (payload: PaymentVerificationPayload): Promise<void> => {
    await apiClient.post("/payment-verifications/", payload);
  },
};
