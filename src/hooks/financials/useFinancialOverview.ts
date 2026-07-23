// src/hooks/financials/useFinancialOverview.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
// Adjust this import to match your actual API client setup
import apiClient from "@/lib/api-client"; 

// =====================================================
// 1. TYPE DEFINITIONS (Matching Backend Schema)
// =====================================================

export interface MonthlyRevenueItem {
  month: string; // e.g., "Jan", "Feb"
  amount: number;
}

export interface RevenueOverview {
  avg_monthly_revenue: number;
  total_revenue: number;
  total_pending: number;
  monthly_trend: MonthlyRevenueItem[];
}

export interface InvoiceStatusSummary {
  paid_count: number;
  pending_count: number;
  overdue_count: number;
  paid_percentage: number;
  pending_percentage: number;
  overdue_percentage: number;
  collection_rate: number;
}

export interface ContractHealth {
  signed_count: number;
  draft_count: number;
  sent_count: number;
  signed_percentage: number;
  draft_percentage: number;
  sent_percentage: number;
  total_active: number;
}

export interface ActivityItem {
  id: string;
  type: string; // "payment_received", "contract_signed"
  title: string;
  description: string;
  timestamp: string;
  link: string;
}

export interface FinancialOverviewData {
  revenue_overview: RevenueOverview;
  invoice_status: InvoiceStatusSummary;
  contract_health: ContractHealth;
  recent_activity: ActivityItem[];
}

// =====================================================
// 2. CUSTOM HOOK
// =====================================================

export function useFinancialOverview() {
  const [data, setData] = useState<FinancialOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API call logic
      const response = await apiClient.get<FinancialOverviewData>("/financials/overview");
      setData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch financial overview:", err);
      setError(err.response?.data?.detail || "Failed to load dashboard data");
      toast.error("Failed to load financial overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
