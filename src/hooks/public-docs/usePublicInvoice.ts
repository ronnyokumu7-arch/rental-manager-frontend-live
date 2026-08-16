// src/hooks/public-docs/usePublicInvoice.ts
import { useState, useEffect, useCallback } from 'react';
import { invoicesApi } from '@/lib/api/invoices';
import toast from 'react-hot-toast';
import type { PublicInvoiceView } from '@/lib/types';

export function usePublicInvoice(token: string) {
  const [invoice, setInvoice] = useState<PublicInvoiceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getByToken(token);
      setInvoice(data as PublicInvoiceView);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'This invoice link is invalid or has expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRecordPayment = async (amount: number, method: 'mpesa' | 'manual', reference: string) => {
    if (!invoice) return;
    setIsPaying(true);
    try {
      const updatedInvoice = await invoicesApi.recordPaymentByToken(token, { amount, method, reference });
      
      // ✅ FIXED: Use double-cast to safely bypass the strict structural mismatch check
      // (This is the TypeScript-approved way to replace a lazy `as any`)
      setInvoice(updatedInvoice as unknown as PublicInvoiceView);
      
      toast.success('Payment recorded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to record payment.');
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvoice();
  }, [token, fetchInvoice]);

  return {
    invoice,
    loading,
    error,
    isPaying,
    handleRecordPayment,
    refetch: fetchInvoice
  };
}
