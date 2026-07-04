// src/lib/api/invoices.ts
import apiClient from "@/lib/api-client";
import type { Invoice, InvoiceUpdatePayload } from "@/lib/types";

export interface InvoiceCreatePayload {
  booking_id: number;
  due_date: string;
  notes?: string;
}

// ✅ NEW: Payload structure for recording offline payments
export interface PublicPaymentPayload {
  amount: number;
  currency_code?: string;
  method: "mpesa" | "manual";
  reference?: string;
  notes?: string;
}

export const invoicesApi = {
  // ── DASHBOARD / AUTHENTICATED ENDPOINTS ───────────────────────────────
  list: async (status?: string): Promise<Invoice[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<Invoice[]>("/invoices", { params });
    return res.data;
  },

  getById: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get<Invoice>(`/invoices/${id}`);
    return res.data;
  },

  create: async (payload: InvoiceCreatePayload): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>("/invoices", payload);
    return res.data;
  },

  update: async (id: number, payload: InvoiceUpdatePayload): Promise<Invoice> => {
    const res = await apiClient.patch<Invoice>(`/invoices/${id}`, payload);
    return res.data;
  },

  void: async (id: number): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>(`/invoices/${id}/void`);
    return res.data;
  },

  generateShareLink: async (id: number): Promise<{ share_url: string; share_token: string; expires_at: string }> => {
    const res = await apiClient.post(`/invoices/${id}/share-link`);
    return res.data;
  },

  downloadPdf: async (id: number): Promise<Blob> => {
    const res = await apiClient.get(`/invoices/${id}/pdf`, { responseType: "blob" });
    return res.data;
  },

  // ── PUBLIC PORTAL ENDPOINTS (NO AUTH REQUIRED) ─────────────────────────
  
  // 1. Fetch invoice details via public share token
  getByToken: async (token: string): Promise<any> => {
    const res = await apiClient.get(`/invoices/public/${token}`);
    return res.data;
  },

  // 2. ✅ UPDATED: Record offline payment (M-Pesa/Bank) via public token
  recordPaymentByToken: async (token: string, payload: PublicPaymentPayload): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>(`/invoices/public/${token}/pay`, payload);
    return res.data;
  },

  // 3. Download PDF via public share token
  downloadPdfByToken: async (token: string): Promise<Blob> => {
    const res = await apiClient.get(`/invoices/public/${token}/pdf`, {
      responseType: "blob",
    });
    return res.data;
  },
};
