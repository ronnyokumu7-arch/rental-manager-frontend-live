import apiClient from "@/lib/api-client";
import type { Invoice, InvoiceCreatePayload, InvoiceUpdatePayload } from "@/lib/types";

export const invoicesApi = {
  list: (params?: { status?: string }) =>
    apiClient.get<Invoice[]>("/invoices", { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data),

  create: (data: InvoiceCreatePayload) =>
    apiClient.post<Invoice>("/invoices", data).then((r) => r.data),

  update: (id: number, data: InvoiceUpdatePayload) =>
    apiClient.patch<Invoice>(`/invoices/${id}`, data).then((r) => r.data),

  send: (id: number) =>
    apiClient.post<Invoice>(`/invoices/${id}/send`).then((r) => r.data),

  void: (id: number) =>
    apiClient.post<Invoice>(`/invoices/${id}/void`).then((r) => r.data),

  downloadPdf: (id: number) =>
    apiClient.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
};
