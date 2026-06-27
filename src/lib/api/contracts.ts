import apiClient from "@/lib/api-client";
import type { Contract } from "@/lib/types";

export const contractsApi = {
  // List contracts (filter by booking_id)
  list: (params?: { booking_id?: number }) =>
    apiClient.get<Contract[]>("/contracts/", { params }).then((r) => r.data),

  // Get single contract
  get: (id: number) =>
    apiClient.get<Contract>(`/contracts/${id}`).then((r) => r.data),

  // Regenerate contract for a booking
  regenerate: (bookingId: number) =>
    apiClient.post<Contract>(`/contracts/bookings/${bookingId}/regenerate`).then((r) => r.data),

  // Void a contract
  void: (id: number) =>
    apiClient.post<Contract>(`/contracts/${id}/void`).then((r) => r.data),

  // Generate a shareable link (returns token and URL)
  shareLink: (id: number) =>
    apiClient.post<{ share_token: string; share_url: string }>(`/contracts/${id}/share-link`).then((r) => r.data),

  // Send contract to client via email
  sendToClient: (id: number) =>
    apiClient.post<Contract>(`/contracts/${id}/send-to-client`).then((r) => r.data),

  // Download PDF (Protected)
  downloadPdf: (id: number) =>
    apiClient.get(`/contracts/${id}/pdf`, { responseType: 'blob' }),

  // --- Public Endpoints (No Auth Required) ---
  publicView: (token: string) =>
    apiClient.get(`/contracts/public/${token}`).then((r) => r.data),

  publicSign: (token: string) =>
    apiClient.post(`/contracts/public/${token}/sign`).then((r) => r.data),

  publicDownloadPdf: (token: string) =>
    apiClient.get(`/contracts/public/${token}/pdf`, { responseType: 'blob' }),
};
