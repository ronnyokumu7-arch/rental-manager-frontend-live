// src/hooks/financials/useInvoices.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { invoicesApi } from "@/lib/api/invoices";
import type { Invoice, InvoiceStatus } from "@/lib/types";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
      const data = await invoicesApi.list(params);
      
      // ✅ REMOVED: Old data normalization logic that was overriding backend status
      // Now we trust the backend's status field completely
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Client-side filtering
  const filteredInvoices = useMemo(() => {
    let result = invoices;
    
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === statusFilter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          i.booking_id?.toString().includes(q) ||
          ('booking_ref' in i && String((i as any).booking_ref).toLowerCase().includes(q)) ||
          ('client_name' in i && String((i as any).client_name).toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [invoices, search, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when filters change
  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, statusFilter]);

  // Actions
  const handleDownload = async (id: number) => {
    try {
      toast.loading("Generating PDF...");
      const res = await invoicesApi.downloadPdf(id);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${id}.pdf`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  const handleCopyLink = async (id: number) => {
    try {
      const res = await invoicesApi.generateShareLink(id);
      await navigator.clipboard.writeText(res.share_url);
      
      setInvoices(prev => prev.map(i => 
        i.id === id ? { ...i, share_token: res.share_token } : i
      ));
      
      toast.success("Invoice share link copied to clipboard!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to generate link");
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirm("Are you sure you want to void this invoice? This action cannot be undone.")) return;
    try {
      const updated = await invoicesApi.void(id);
      
      setInvoices(prev => prev.map(i => i.id === id ? updated : i));
      
      toast.success("Invoice voided successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to void invoice");
    }
  };

  // ✅ REMOVED: handleRecordPayment is no longer needed here
  // The RecordPaymentModal calls invoicesApi.recordPayment directly and triggers refetch
  
  return {
    invoices: paginatedInvoices,
    loading,
    search, 
    setSearch,
    statusFilter, 
    setStatusFilter,
    currentPage, 
    setCurrentPage,
    totalPages,
    totalItems: filteredInvoices.length,
    handleDownload,
    handleCopyLink,
    handleVoid,
    // ✅ REMOVED: handleRecordPayment
    refetch: fetchInvoices,
  };
}
