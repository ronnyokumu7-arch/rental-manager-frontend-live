import apiClient from "@/lib/api-client";
import type { Payment, PaymentCreatePayload } from "@/lib/types";

export const paymentsApi = {
  list: (params?: { invoice_id?: number }) =>
    apiClient.get<Payment[]>("/payments", { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Payment>(`/payments/${id}`).then((r) => r.data),

  record: (data: PaymentCreatePayload) =>
    apiClient.post<Payment>("/payments", data).then((r) => r.data),
};