import apiClient from "@/lib/api-client";
import type { Invoice, InvoiceUpdatePayload } from "@/lib/types";

export interface InvoiceCreatePayload {
  booking_id: number;
  due_date: string;
  notes?: string;
}

export interface PublicPaymentPayload {
  amount: number;
  currency_code?: string;
  method: "mpesa" | "manual";
  reference?: string;
  notes?: string;
}

export const invoicesApi = {
  // ── Dashboard / Authenticated Endpoints ───────────────────────────────
  list: (params?: { status?: string; booking_id?: number }) =>
    apiClient.get<Invoice[]>("/invoices", { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data),

  create: (payload: InvoiceCreatePayload) =>
    apiClient.post<Invoice>("/invoices", payload).then((r) => r.data),

  update: (id: number, payload: InvoiceUpdatePayload) =>
    apiClient.patch<Invoice>(`/invoices/${id}`, payload).then((r) => r.data),

  void: (id: number) =>
    apiClient.post<Invoice>(`/invoices/${id}/void`).then((r) => r.data),

  // ── PDF & Sharing ─────────────────────────────────────────────────────
  downloadPdf: (id: number) =>
    apiClient.get(`/invoices/${id}/pdf`, { responseType: "blob" }),

  generateShareLink: (id: number) =>
    apiClient
      .post<{ share_token: string; share_url: string; expires_at: string }>(
        `/invoices/${id}/share-link`
      )
      .then((r) => r.data),

  // Alias for consistency
  shareLink: (id: number) =>
    apiClient
      .post<{ share_token: string; share_url: string }>(
        `/invoices/${id}/share-link`
      )
      .then((r) => r.data),

  // ── Public Portal Endpoints (No Auth Required) ────────────────────────
  getByToken: (token: string) =>
    apiClient.get(`/invoices/public/${token}`).then((r) => r.data),

  recordPaymentByToken: (token: string, payload: PublicPaymentPayload) =>
    apiClient
      .post<Invoice>(`/invoices/public/${token}/pay`, payload)
      .then((r) => r.data),

  downloadPdfByToken: (token: string) =>
    apiClient.get(`/invoices/public/${token}/pdf`, {
      responseType: "blob",
    }),
};
