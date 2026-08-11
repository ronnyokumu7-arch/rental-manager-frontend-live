import { confirmAction } from "@/lib/utils/confirmAction";
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
      // ✅ FIXED: Backend enforces page_size <= 200 (le=200).
      // 200 covers client-side search/filter/pagination for current tenant volumes.
      const params = {
        page_size: 200,
        ...(statusFilter !== "all" && { status: statusFilter })
      };
      
      const data = await invoicesApi.list(params);
      
      // ✅ FIXED: Added safe fallback to guarantee 'invoices' state is always an array
      setInvoices(data || []);
    } catch (error) {
      console.error("Failed to load invoices", error);
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
    } catch {
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  const handleCopyLink = async (id: number) => {
    try {
      const res = await invoicesApi.generateShareLink(id);
      await navigator.clipboard.writeText(res.share_token);
      
      setInvoices(prev => prev.map(i => 
        i.id === id ? { ...i, share_token: res.share_token } : i
      ));
      
      toast.success("Invoice share link copied to clipboard!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to generate link");
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirmAction("Are you sure you want to void this invoice? This action cannot be undone.")) return;
    try {
      const updated = await invoicesApi.void(id);
      
      setInvoices(prev => prev.map(i => i.id === id ? updated : i));
      
      toast.success("Invoice voided successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to void invoice");
    }
  };

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
    refetch: fetchInvoices,
  };
}
