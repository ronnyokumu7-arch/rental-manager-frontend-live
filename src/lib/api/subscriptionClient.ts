// src/lib/api/subscriptionClient.ts
import apiClient from "@/lib/api-client";
import { SubscriptionOut } from "@/lib/types";

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
  getStatus: async (): Promise<SubscriptionOut[]> => {
    const { data } = await apiClient.get<SubscriptionOut[]>("/subscriptions/my");
    return data;
  },

  // PATCH /subscriptions/{id}
  updateAutoRenew: async (id: number, autoRenew: boolean): Promise<SubscriptionOut> => {
    const { data } = await apiClient.patch<SubscriptionOut>(`/subscriptions/${id}`, {
      auto_renew: autoRenew,
    });
    return data;
  },

  // POST /payment-verifications/
  verifyPayment: async (payload: PaymentVerificationPayload): Promise<void> => {
    await apiClient.post("/payment-verifications/", payload);
  },
};
