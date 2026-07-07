import apiClient from "@/lib/api-client";
import type { Client, ClientCreatePayload, ClientUpdatePayload, Booking } from "@/lib/types";

export const clientsApi = {
  // ── List & Search ─────────────────────────────────────────────────────
  list: (params?: { search?: string; status?: string }) =>
    apiClient.get<Client[]>("/clients", { params }).then((r) => r.data),

  listArchived: () =>
    apiClient.get<Client[]>("/clients/archived").then((r) => r.data),

  // ── Single ────────────────────────────────────────────────────────────
  get: (id: number) =>
    apiClient.get<Client>(`/clients/${id}`).then((r) => r.data),

  create: (data: ClientCreatePayload) =>
    apiClient.post<Client>("/clients", data).then((r) => r.data),

  update: (id: number, data: ClientUpdatePayload) =>
    apiClient.patch<Client>(`/clients/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/clients/${id}`),

  // ── Status Transitions ────────────────────────────────────────────────
  suspend: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/suspend`).then((r) => r.data),

  reactivate: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/reactivate`).then((r) => r.data),

  // ── Archive Workflow ──────────────────────────────────────────────────
  archive: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Client>(`/clients/${id}/restore`).then((r) => r.data),

  // ── File Uploads (Mapped to specific backend endpoints) ───────────────
  uploadAvatar: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  uploadIdDocument: (id: number, front: File, back?: File) => {
    const formData = new FormData();
    formData.append("front", front);
    if (back) formData.append("back", back);
    return apiClient
      .post<Client>(`/clients/${id}/upload/id-document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  uploadDlDocument: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<Client>(`/clients/${id}/upload/dl-document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // ── Related Data ──────────────────────────────────────────────────────
  getBookings: (clientId: number) =>
    apiClient
      .get<Booking[]>("/bookings", { params: { client_id: clientId } })
      .then((r) => r.data),
};
