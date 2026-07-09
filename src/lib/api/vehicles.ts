// src/lib/api/vehicles.ts
import apiClient from "@/lib/api-client";
import type { Vehicle, VehicleCreate, VehicleUpdate, Booking } from "@/lib/types";

export const vehiclesApi = {
  // ── Core CRUD ──────────────────────────────────────────────────────
  list: (params?: { include_archived?: boolean }) =>
    apiClient.get<Vehicle[]>("/vehicles", { params }).then((r) => r.data),

  listArchived: () =>
    apiClient.get<Vehicle[]>("/vehicles/archived").then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),

  // ⚡ TRIGGERS: check_completeness & dispatch_lifecycle_tasks("created")
  create: (data: VehicleCreate) =>
    apiClient.post<Vehicle>("/vehicles", data).then((r) => r.data),

  // ⚡ TRIGGERS: check_maintenance_on_booking (if current_mileage is updated)
  update: (id: number, data: VehicleUpdate) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/vehicles/${id}`),

  // ── Lifecycle Actions (Event-Driven Triggers) ──────────────────────
  
  //  TRIGGERS: dispatch_lifecycle_tasks("activated")
  activate: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/activate`).then((r) => r.data),

  // ⚡ TRIGGERS: dispatch_lifecycle_tasks("maintenance") & check_insurance_on_maintenance_status
  sendToMaintenance: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/maintenance`).then((r) => r.data),

  // ⚡ TRIGGERS: dispatch_lifecycle_tasks("reactivate")
  reactivate: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/reactivate`).then((r) => r.data),

  // ⚡ TRIGGERS: dispatch_lifecycle_tasks("retire")
  retire: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/retire`).then((r) => r.data),

  archive: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/restore`).then((r) => r.data),

  // ── Related Data ───────────────────────────────────────────────────
  getBookings: (vehicleId: number) =>
    apiClient.get<Booking[]>("/bookings", { params: { vehicle_id: vehicleId } }).then((r) => r.data),
};
