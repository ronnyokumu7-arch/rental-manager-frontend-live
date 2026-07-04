// src/hooks/public-docs/usePublicInvoice.ts
import { useState, useEffect, useCallback } from 'react';
import { invoicesApi } from '@/lib/api/invoices';
import toast from 'react-hot-toast';

export interface PublicInvoiceView {
  id: number;
  invoice_number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency_code: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
  client_name: string;
  tenant_name: string;
  booking_details: {
    vehicle: string;
    start_date: string;
    end_date: string;
  } | null;
}

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
      setInvoice(data as any);
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
      setInvoice(updatedInvoice as any);
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
