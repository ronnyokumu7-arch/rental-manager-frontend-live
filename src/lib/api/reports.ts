// src/lib/api/reports.ts
import apiClient from "@/lib/api-client";

export interface ReportParams {
  start_date?: string; // ISO string
  end_date?: string;   // ISO string
  format?: "json" | "pdf" | "excel";
}

export const reportsApi = {
  // ─ JSON Data Fetching ────────────────────────────────────────────────
  getRevenue: (params: ReportParams) =>
    apiClient.get("/reports/revenue", { params: { ...params, format: "json" } }).then((r) => r.data),

  getBookings: (params: ReportParams) =>
    apiClient.get("/reports/bookings", { params: { ...params, format: "json" } }).then((r) => r.data),

  getVehicleUtilisation: (params: ReportParams) =>
    apiClient.get("/reports/vehicle-utilisation", { params: { ...params, format: "json" } }).then((r) => r.data),

  getClientActivity: (params: ReportParams) =>
    apiClient.get("/reports/client-activity", { params: { ...params, format: "json" } }).then((r) => r.data),

  getOverdue: (params: ReportParams) =>
    apiClient.get("/reports/overdue", { params: { ...params, format: "json" } }).then((r) => r.data),

  // ── PDF & Excel Downloads ─────────────────────────────────────────────
  downloadRevenuePdf: (params: ReportParams) =>
    apiClient.get("/reports/revenue", { params: { ...params, format: "pdf" }, responseType: "blob" }),
    
  downloadRevenueExcel: (params: ReportParams) =>
    apiClient.get("/reports/revenue", { params: { ...params, format: "excel" }, responseType: "blob" }),

  downloadOverduePdf: (params: ReportParams) =>
    apiClient.get("/reports/overdue", { params: { ...params, format: "pdf" }, responseType: "blob" }),

  downloadOverdueExcel: (params: ReportParams) =>
    apiClient.get("/reports/overdue", { params: { ...params, format: "excel" }, responseType: "blob" }),
};
