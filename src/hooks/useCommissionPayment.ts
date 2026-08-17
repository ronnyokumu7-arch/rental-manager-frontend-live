// src/hooks/useCommissionPayment.ts
import { useState, useEffect, useCallback } from "react";
import {
  commissionApi,
  CommissionPaymentInfo,
  CommissionPayment,
} from "@/lib/api/commission";

export function useCommissionPayment() {
  const [info, setInfo] = useState<CommissionPaymentInfo | null>(null);
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [infoRes, paymentsRes] = await Promise.all([
        commissionApi.getPaymentInfo(),
        commissionApi.getPayments(20),
      ]);
      setInfo(infoRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error("[useCommissionPayment] Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async (payload: { amount: number; reference: string; notes?: string }) => {
    setSubmitting(true);
    try {
      const res = await commissionApi.submitPayment(payload);
      await refresh();
      return res.data;
    } finally {
      setSubmitting(false);
    }
  };

  return { info, payments, loading, submitting, refresh, submit };
}
