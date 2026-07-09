// src/hooks/financials/usePayments.ts
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { paymentsApi } from "@/lib/api/payments";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsApi.list();
      setPayments(data);
    } catch (error) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Client-side filtering
  const filteredPayments = useMemo(() => {
    let result = payments;
    
    if (methodFilter !== "all") {
      result = result.filter(p => p.method === methodFilter);
    }
    
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p => p.reference?.toLowerCase().includes(q) || 
             p.invoice_id.toString().includes(q)
      );
    }
    
    return result;
  }, [payments, search, methodFilter, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, methodFilter, statusFilter]);

  return {
    payments: paginatedPayments,
    loading,
    search, setSearch,
    methodFilter, setMethodFilter,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    totalPages,
    totalItems: filteredPayments.length,
    refetch: fetchPayments,
  };
}
