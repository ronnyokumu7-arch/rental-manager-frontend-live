// src/lib/api/invoices.ts
import apiClient from "@/lib/api-client";
import type { Invoice } from "@/lib/types";

export interface InvoiceCreatePayload {
  booking_id: number;
  due_date: string; // ISO string
  notes?: string;
}

export const invoicesApi = {
  list: async (status?: string): Promise<Invoice[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<Invoice[]>("/invoices", { params });
    return res.data;
  },

  getById: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get<Invoice>(`/invoices/${id}`);
    return res.data;
  },

  // ✅ This is the endpoint we will call right after creating a booking
  create: async (payload: InvoiceCreatePayload): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>("/invoices", payload);
    return res.data;
  },

  void: async (id: number): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>(`/invoices/${id}/void`);
    return res.data;
  },
};
