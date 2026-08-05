import apiClient from "@/lib/api-client";
import type { Client, ClientCreate, ClientUpdate, Booking, PaginatedResponse } from "@/lib/types";

export const clientsApi = {
  // ── Core CRUD ──────────────────────────────────────────────────────────────
  // ✅ FIXED: Unwrap .items
  list: (params?: { search?: string; status?: string; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Client>>("/clients/", { params }).then((r) => r.data.items),
    
  // ✅ FIXED: Unwrap .items
  listArchived: (params?: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Client>>("/clients/archived", { params }).then((r) => r.data.items),
    
  get: (id: number) =>
    apiClient.get<Client>(`/clients/${id}`).then((r) => r.data), 
    
  create: (data: ClientCreate) =>
    apiClient.post<Client>("/clients", data).then((r) => r.data),
    
  update: (id: number, data: ClientUpdate) =>
    apiClient.patch<Client>(`/clients/${id}`, data).then((r) => r.data), 
    
  delete: (id: number) =>
    apiClient.delete(`/clients/${id}`), 

  // ── Status Transitions ─────────────────────────────────────────────────────
  activate: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/activate`).then((r) => r.data), 
    
  suspend: (id: number, reason?: string) => {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : ""; 
    return apiClient.post<Client>(`/clients/${id}/suspend${query}`).then((r) => r.data); 
  },
  
  reactivate: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/reactivate`).then((r) => r.data), 

  // ── Archive Workflow ───────────────────────────────────────────────────────
  archive: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/archive`).then((r) => r.data), 
    
  restore: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/restore`).then((r) => r.data), 

  // ─ Document Uploads ───────────────────────────────────────────────────────
  uploadAvatar: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-avatar`, formData, { 
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  uploadIdFront: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-id-front`, formData, { 
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  uploadIdBack: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-id-back`, formData, { 
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  uploadDlFront: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-dl-front`, formData, { 
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // ── Related Data ───────────────────────────────────────────────────────────
  // ✅ FIXED: /bookings endpoint is now paginated, must unwrap .items
  getBookings: (clientId: number) =>
    apiClient
      .get<PaginatedResponse<Booking>>("/bookings", { params: { client_id: clientId } })
      .then((r) => r.data.items),
};
