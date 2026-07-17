// src/lib/api/payments.ts
import apiClient from "@/lib/api-client";
import type { Payment, PaymentStatus, PaymentMethod } from "@/lib/types";

export interface PaymentVoidPayload {
  reason: string;
}

export const paymentsApi = {
  list: async (params?: {
    invoice_id?: number;
    status?: PaymentStatus;
    method?: PaymentMethod;
  }): Promise<Payment[]> => {
    const res = await apiClient.get<Payment[]>("/payments", { params });
    return res.data;
  },

  // ✅ REMOVED: create() - Payments are now created exclusively via invoicesApi.recordPayment()

  void: async (id: number, payload: PaymentVoidPayload): Promise<Payment> => {
    const res = await apiClient.post<Payment>(`/payments/${id}/void`, payload);
    return res.data;
  },

  exportCsv: async (params?: { start_date?: string; end_date?: string }) => {
    return apiClient.get("/payments/export/csv", {
      params,
      responseType: "blob",
    });
  },
};
