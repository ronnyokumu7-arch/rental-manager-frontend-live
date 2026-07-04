// src/lib/api/contracts.ts
import apiClient from "@/lib/api-client";
import type { Contract, PublicContractView } from "@/lib/types";

// ✅ Extracted helper to avoid TypeScript 'this' context errors in object literals
const _generateShareLink = async (id: number) => {
  const res = await apiClient.post(`/contracts/${id}/share-link`);
  return res.data;
};

export const contractsApi = {
  // 1. List contracts (Dashboard)
  list: async (params?: { booking_id?: number; contract_status?: string }): Promise<Contract[]> => {
    const res = await apiClient.get<Contract[]>("/contracts", { params });
    return res.data;
  },

  // 2. Get single contract (Dashboard)
  getById: async (id: number): Promise<Contract> => {
    const res = await apiClient.get<Contract>(`/contracts/${id}`);
    return res.data;
  },

  // 3. Public view (No auth required)
  publicView: async (token: string): Promise<PublicContractView> => {
    const res = await apiClient.get<PublicContractView>(`/contracts/public/${token}`);
    return res.data;
  },

  // 4. ✅ UPDATED: Public sign (Accepts base64 signature payload)
  publicSign: async (token: string, signature: string): Promise<{ message: string }> => {
    const res = await apiClient.post(`/contracts/public/${token}/sign`, { signature });
    return res.data;
  },

  // 5. Public download PDF
  publicDownloadPdf: async (token: string) => {
    const res = await apiClient.get(`/contracts/public/${token}/pdf`, { responseType: "blob" });
    return res;
  },

  // 6. Dashboard download PDF
  downloadPdf: async (id: number) => {
    const res = await apiClient.get(`/contracts/${id}/pdf`, { responseType: "blob" });
    return res;
  },

  // 7. Void contract
  void: async (id: number): Promise<Contract> => {
    const res = await apiClient.post<Contract>(`/contracts/${id}/void`);
    return res.data;
  },

  // 8. Generate share link
  generateShareLink: _generateShareLink,
  shareLink: _generateShareLink,

  // 9. Send to client
  sendToClient: async (id: number): Promise<Contract> => {
    const res = await apiClient.post<Contract>(`/contracts/${id}/send-to-client`);
    return res.data;
  },

  // 10. Regenerate existing contract
  regenerate: async (bookingId: number): Promise<Contract> => {
    const res = await apiClient.post<Contract>(`/contracts/bookings/${bookingId}/regenerate`);
    return res.data;
  },

  // 11. ✅ NEW: Generate contract from booking (Manual override for v1)
  generateContract: async (bookingId: number): Promise<Contract> => {
    const res = await apiClient.post<Contract>(`/contracts/bookings/${bookingId}/generate`);
    return res.data;
  },
};
