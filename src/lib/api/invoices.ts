// src/lib/api/invoices.ts
import apiClient from "@/lib/api-client";
import type { Invoice, InvoiceCreate, InvoiceUpdate, InvoiceStatus, PaymentMethod } from "@/lib/types";

export interface RecordPaymentPayload {
  amount: number;
  currency_code?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface PublicPaymentPayload {
  amount: number;
  currency_code?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export const invoicesApi = {
  list: (params?: { status?: InvoiceStatus; booking_id?: number }) =>
    apiClient.get<Invoice[]>("/invoices/", { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data),

  create: (payload: InvoiceCreate) =>
    apiClient.post<Invoice>("/invoices/", payload).then((r) => r.data),

  update: (id: number, payload: InvoiceUpdate) =>
    apiClient.patch<Invoice>(`/invoices/${id}`, payload).then((r) => r.data),

  void: (id: number) =>
    apiClient.post<Invoice>(`/invoices/${id}/void`).then((r) => r.data),

  downloadPdf: (id: number) =>
    apiClient.get(`/invoices/${id}/pdf`, { responseType: "blob" }),

  generateShareLink: (id: number) =>
    apiClient.post<{ share_token: string; share_url: string; expires_at: string }>(
      `/invoices/${id}/share-link`
    ).then((r) => r.data),

  getByToken: (token: string) =>
    apiClient.get(`/invoices/public/${token}`).then((r) => r.data),

  // ✅ NEW: Admin offline payment recording against a specific invoice
  recordPayment: (invoiceId: number, payload: RecordPaymentPayload) =>
    apiClient.post(`/invoices/${invoiceId}/record-payment`, payload).then((r) => r.data),

  recordPaymentByToken: (token: string, payload: PublicPaymentPayload) =>
    apiClient.post<Invoice>(`/invoices/public/${token}/pay`, payload).then((r) => r.data),

  downloadPdfByToken: (token: string) =>
    apiClient.get(`/invoices/public/${token}/pdf`, { responseType: "blob" }),
};
