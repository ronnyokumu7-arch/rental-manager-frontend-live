import apiClient from "@/lib/api-client";
import type { Booking, BookingCreatePayload, BookingUpdatePayload, BookingStatus } from "@/lib/types";

// Define the query parameters supported by the backend's GET /bookings endpoint
interface BookingListParams {
  status?: BookingStatus;
  client_id?: number;
  vehicle_id?: number;
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string;   // Format: YYYY-MM-DD
  include_archived?: boolean;
}

export const bookingsApi = {
  list: (params?: BookingListParams) =>
    apiClient.get<Booking[]>("/bookings", { params }).then((r) => r.data),

  listArchived: () =>
    apiClient.get<Booking[]>("/bookings/archived").then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Booking>(`/bookings/${id}`).then((r) => r.data),

  create: (data: BookingCreatePayload) =>
    apiClient.post<Booking>("/bookings", data).then((r) => r.data),

  update: (id: number, data: BookingUpdatePayload) =>
    apiClient.patch<Booking>(`/bookings/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/bookings/${id}`),

  // ─── Status Transitions ──────────────────────────────────────────────────────
  confirm: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/confirm`).then((r) => r.data),

  activate: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/activate`).then((r) => r.data),

  complete: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/complete`).then((r) => r.data),

  cancel: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),

  noShow: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/no-show`).then((r) => r.data),

  archive: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/restore`).then((r) => r.data),
};