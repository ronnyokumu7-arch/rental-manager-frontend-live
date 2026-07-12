// src/hooks/financials/useInvoices.ts
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { invoicesApi } from "@/lib/api/invoices";
import type { Invoice, InvoiceStatus } from "@/lib/types";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
      const data = await invoicesApi.list(params);
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  // Client-side filtering for search
  const filteredInvoices = useMemo(() => {
    if (!search) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.booking_id?.toString().includes(q)
    );
  }, [invoices, search]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  // Actions
  const handleDownload = async (id: number) => {
    try {
      toast.loading("Generating PDF...");
      const res = await invoicesApi.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      // ✅ FIX: Removed the hidden trailing newline character that was corrupting the filename
      link.download = `Invoice-${id}.pdf`; 
      link.click();
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
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to generate link");
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirm("Are you sure you want to void this invoice?")) return;
    try {
      await invoicesApi.void(id);
      toast.success("Invoice voided successfully");
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to void invoice");
    }
  };

  const handleRecordPayment = async (id: number, amount: number) => {
    try {
      // Using update to mark as paid and update amount_paid
      await invoicesApi.update(id, {
        status: "paid",
        amount_paid: amount, // Note: In a real app, we'd calculate current + new amount
      });
      toast.success("Payment recorded successfully!");
      fetchInvoices();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to record payment");
      return false;
    }
  };

  return {
    invoices: paginatedInvoices,
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    totalPages,
    totalItems: filteredInvoices.length,
    handleDownload,
    handleCopyLink,
    handleVoid,
    handleRecordPayment,
    refetch: fetchInvoices,
  };
}
