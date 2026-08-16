// src/lib/api/commission.ts
import apiClient from "@/lib/api-client";

export interface CommissionSummary {
  currency_code: string;
  today_count: number;
  today_total: string;
  outstanding_count: number;
  outstanding_balance: string;
  oldest_unpaid_at: string | null;
  grace_days: number;
  days_until_lock: number | null;
  soft_locked: boolean;
}

export interface CommissionEvent {
  id: number;
  booking_id: number;
  amount: string;
  currency_code: string;
  status: "unpaid" | "paid" | "waived";
  trip_started_at: string;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
}

export const commissionApi = {
  /**
   * Get the daily-resetting commission summary for the dashboard.
   * Returns today's counter (resets at 00:00H) + outstanding balance + soft-lock state.
   */
  getSummary: () => apiClient.get<CommissionSummary>("/commission/summary"),

  /**
   * Get the commission event history (ledger).
   * @param limit Max events to return (default 50, max 200)
   */
  getEvents: (limit: number = 50) =>
    apiClient.get<CommissionEvent[]>("/commission/events", { params: { limit } }),
};
