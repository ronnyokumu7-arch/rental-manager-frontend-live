// src/lib/api/clients.ts
import apiClient from "@/lib/api-client";
import type { Client, ClientCreate, ClientUpdate, Booking } from "@/lib/types";

export const clientsApi = {
  // ── Core CRUD ──────────────────────────────────────────────────────────────
  list: (params?: { search?: string; status?: string }) =>
    apiClient.get<Client[]>("/clients", { params }).then((r) => r.data),
  listArchived: () =>
    apiClient.get<Client[]>("/clients/archived").then((r) => r.data),
  get: (id: number) =>
    apiClient.get<Client>(`/clients/${id}`).then((r) => r.data), // ✅ Fixed
    
  create: (data: ClientCreate) =>
    apiClient.post<Client>("/clients", data).then((r) => r.data),
  update: (id: number, data: ClientUpdate) =>
    apiClient.patch<Client>(`/clients/${id}`, data).then((r) => r.data), // ✅ Fixed
  delete: (id: number) =>
    apiClient.delete(`/clients/${id}`), // ✅ Fixed

  // ── Status Transitions ─────────────────────────────────────────────────────
  activate: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/activate`).then((r) => r.data), // ✅ Fixed
  suspend: (id: number, reason?: string) => {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : ""; // ✅ Fixed
    return apiClient.post<Client>(`/clients/${id}/suspend${query}`).then((r) => r.data); // ✅ Fixed
  },
  reactivate: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/reactivate`).then((r) => r.data), // ✅ Fixed

  // ── Archive Workflow ───────────────────────────────────────────────────────
  archive: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/archive`).then((r) => r.data), // ✅ Fixed
  restore: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/restore`).then((r) => r.data), // ✅ Fixed

  // ─ Document Uploads ───────────────────────────────────────────────────────
  uploadAvatar: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-avatar`, formData, { // ✅ Fixed
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  uploadIdFront: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-id-front`, formData, { // ✅ Fixed
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  uploadIdBack: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-id-back`, formData, { // ✅ Fixed
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  uploadDlFront: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload-dl-front`, formData, { // ✅ Fixed
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // ── Related Data ───────────────────────────────────────────────────────────
  getBookings: (clientId: number) =>
    apiClient
      .get<Booking[]>("/bookings", { params: { client_id: clientId } })
      .then((r) => r.data),
};
