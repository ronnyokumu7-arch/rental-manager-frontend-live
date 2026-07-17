// src/lib/api/bookings.ts
import apiClient from "@/lib/api-client";
import type { Booking, BookingCreate, BookingUpdate } from "@/lib/types";

export interface ExtendBookingPayload {
  new_end_date: string;
  extension_reason?: string;
}

export const bookingsApi = {
  // ✅ Renamed from getById to get (matches vehiclesApi pattern)
  get: (id: number) =>
    apiClient.get<Booking>(`/bookings/${id}`).then((r) => r.data),
    
  list: (params?: { vehicle_id?: number; client_id?: number }) =>
    apiClient.get<Booking[]>("/bookings/", { params }).then((r) => r.data),
    
  listArchived: () =>
    apiClient.get<Booking[]>("/bookings/archived").then((r) => r.data),
    
  create: (data: BookingCreate) =>
    apiClient.post<Booking>("/bookings", data).then((r) => r.data),
    
  update: (id: number, data: BookingUpdate) =>
    apiClient.patch<Booking>(`/bookings/${id}`, data).then((r) => r.data),
    
  delete: (id: number) =>
    apiClient.delete(`/bookings/${id}`),
  
  generateInvoice: (id: number) =>
    apiClient.post<{ share_url: string; token: string; expires_at: string }>(
      `/bookings/${id}/generate-invoice`
    ).then((r) => r.data),
  
  confirm: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/confirm`).then((r) => r.data),
    
  activate: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/activate`).then((r) => r.data),
    
  complete: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/complete`).then((r) => r.data),
    
  cancel: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),
    
  // ✅ Renamed from markNoShow to noShow
  noShow: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/no-show`).then((r) => r.data),
    
  archive: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/archive`).then((r) => r.data),
    
  restore: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/restore`).then((r) => r.data),

  extend: (id: number, payload: ExtendBookingPayload) =>
    apiClient.post<{
      message: string;
      booking_id: number;
      extra_days: number;
      additional_cost: number;
      new_end_date: string;
      invoice_updated: boolean;
    }>(`/bookings/${id}/extend`, payload).then((r) => r.data),
};
