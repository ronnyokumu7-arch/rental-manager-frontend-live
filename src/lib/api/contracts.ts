import apiClient from "@/lib/api-client";
import type { Contract, PublicContractView } from "@/lib/types";

export const contractsApi = {
  list: (params?: { booking_id?: number; contract_status?: string }) =>
    apiClient.get<Contract[]>("/contracts", { params }).then((r) => r.data),
  getById: (id: number) =>
    apiClient.get<Contract>(`/contracts/${id}`).then((r) => r.data),
  void: (id: number) =>
    apiClient.post<Contract>(`/contracts/${id}/void`).then((r) => r.data),
  regenerate: (bookingId: number) =>
    apiClient.post<Contract>(`/contracts/bookings/${bookingId}/regenerate`).then((r) => r.data),
  generateContract: (bookingId: number) =>
    apiClient.post<Contract>(`/contracts/bookings/${bookingId}/generate`).then((r) => r.data),
  
  // ✅ FIXED: Removed trailing \n
  downloadPdf: (id: number) =>
    apiClient.get(`/contracts/${id}/pdf`, { responseType: "blob" }),
  generateShareLink: (id: number) =>
    apiClient.post<{ share_token: string; share_url: string; expires_at: string }>(
      `/contracts/${id}/share-link`
    ).then((r) => r.data),
  shareLink: (id: number) =>
    apiClient.post<{ share_token: string; share_url: string }>(
      `/contracts/${id}/share-link`
    ).then((r) => r.data),
  sendToClient: (id: number) =>
    apiClient.post<Contract>(`/contracts/${id}/send-to-client`).then((r) => r.data),
  
  publicView: (token: string) =>
    apiClient.get<PublicContractView>(`/contracts/public/${token}`).then((r) => r.data),
  publicSign: (token: string, signature?: string) =>
    apiClient.post<{ message: string }>(`/contracts/public/${token}/sign`, { signature }).then((r) => r.data),
  publicDownloadPdf: (token: string) =>
    apiClient.get(`/contracts/public/${token}/pdf`, { responseType: "blob" }),
};
