// src/lib/api/vehicles.ts
import apiClient from "@/lib/api-client";
import type { Vehicle, VehicleCreate, VehicleUpdate, Booking } from "@/lib/types";

// ✅ Payload for Milestone 3 (Quick Garage)
export interface MileageUpdatePayload {
  current_mileage: number;
  next_service_km?: number | null;
}

export const vehiclesApi = {
  // ✅ Updated to accept status filter for active vehicles
  list: (params?: { status?: string }) =>
    apiClient.get<Vehicle[]>("/vehicles/", { params }).then((r) => r.data),

  // ✅ Updated to accept status filter for archived vehicles
  listArchived: (params?: { status?: string }) =>
    apiClient.get<Vehicle[]>("/vehicles/archived", { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),

  create: (data: VehicleCreate) =>
    apiClient.post<Vehicle>("/vehicles", data).then((r) => r.data),

  update: (id: number, data: VehicleUpdate) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/vehicles/${id}`),

  activate: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/activate`).then((r) => r.data),

  sendToMaintenance: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/maintenance`).then((r) => r.data),

  reactivate: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/reactivate`).then((r) => r.data),

  retire: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/retire`).then((r) => r.data),

  archive: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/restore`).then((r) => r.data),

  getBookings: (vehicleId: number) =>
    apiClient.get<Booking[]>("/bookings", { params: { vehicle_id: vehicleId } }).then((r) => r.data),

  // ✅ Milestone 3 Endpoint to resolve the awaiting_mileage lock
  updateMileage: (id: number, data: MileageUpdatePayload) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}/update-mileage`, data).then((r) => r.data),

  uploadInsuranceDoc: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/vehicles/${id}/upload-insurance`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadRegistrationDoc: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/vehicles/${id}/upload-registration`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadInspectionDoc: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/vehicles/${id}/upload-inspection`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
