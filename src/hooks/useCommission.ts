// src/hooks/useCommission.ts
import { useState, useEffect } from "react";
import { commissionApi, CommissionSummary } from "@/lib/api/commission";
import toast from "react-hot-toast";

export function useCommission() {
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await commissionApi.getSummary();
      setSummary(res.data);
    } catch (err: any) {
      // 401 is handled by the axios interceptor (redirect to login)
      // 404 means the backend hasn't deployed the commission router yet
      if (err.response?.status === 404) {
        console.warn("[useCommission] Commission endpoint not found (backend may not have deployed yet)");
        return;
      }
      console.error("[useCommission] Failed to fetch summary:", err);
      toast.error("Failed to load commission data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // Refresh every 5 minutes to catch new activations
    const interval = setInterval(fetchSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { summary, loading, refetch: fetchSummary };
}
