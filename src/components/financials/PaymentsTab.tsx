// src/components/financials/PaymentsTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, ChevronDown, CheckCircle2, Clock, AlertCircle, Upload } from "lucide-react";
import { usePayments } from "@/hooks/financials/usePayments";
import PaymentsTable from "./payments/PaymentsTable";

export default function PaymentsTab() {
  const {
    payments, loading, search, setSearch,
    methodFilter, setMethodFilter,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    refetch
  } = usePayments();

  const pageSize = 7;

  // 1. Apply Search, Method, and Status Filters directly to ALL payments
  const displayedPayments = useMemo(() => {
    return payments.filter(payment => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        (payment.reference && payment.reference.toLowerCase().includes(searchLower)) ||
        payment.id.toString().includes(searchLower) ||
        payment.invoice_id.toString().includes(searchLower);
      
      const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [payments, search, methodFilter, statusFilter]);

  // 2. Pagination Logic (7 per page)
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedPayments.slice(start, start + pageSize);
  }, [displayedPayments, currentPage]);

  const totalPages = Math.ceil(displayedPayments.length / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, methodFilter, statusFilter, setCurrentPage]);

  // 3. Counters (Reflects ALL payments, filtered by search/method/status)
  const pendingCount = useMemo(() => displayedPayments.filter(p => p.status === "pending").length, [displayedPayments]);
  const completedCount = useMemo(() => displayedPayments.filter(p => p.status === "completed").length, [displayedPayments]);
  const failedCount = useMemo(() => displayedPayments.filter(p => p.status === "failed").length, [displayedPayments]);

  // --- Action Handlers ---
  const handleDownloadPdf = (id: number) => {
    console.log(`Download PDF for payment ${id}`);
  };

  const handleIssueRefund = (id: number) => {
    console.log(`Issue refund for payment ${id}`);
  };

  const handleExportSingleCsv = (id: number) => {
    console.log(`Export CSV/Receipt for payment ${id}`);
  };

  const handleExportAllCsv = () => {
    if (displayedPayments.length === 0) return;
    
    const headers = ["ID", "Invoice ID", "Amount", "Currency", "Method", "Reference", "Status", "Date"];
    const rows = displayedPayments.map(p => [
      p.id,
      p.invoice_id,
      p.amount,
      p.currency_code,
      p.method,
      p.reference || "N/A",
      p.status,
      new Date(p.paid_at || p.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Premium Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Left Side: Counters Only */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="hidden md:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[var(--color-success-text)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Completed</span>
                <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{completedCount}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)]" />
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[var(--color-warning-text)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Pending</span>
                <span className="text-xs font-bold text-[var(--color-warning-text)] tabular-nums">{pendingCount}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)]" />
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-[var(--color-danger-text)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Failed</span>
                <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{failedCount}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Search, Filters & Export All */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ref or invoice ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>
            
            <div className="relative w-full lg:w-40">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="manual">Bank/Cash</option>
              </select>
            </div>

            <div className="relative w-full lg:w-40">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <button 
              onClick={handleExportAllCsv}
              disabled={displayedPayments.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-ink-muted)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Export All to CSV"
            >
              <Upload size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : displayedPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <Clock size={32} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h4 className="text-base font-bold text-[var(--color-ink)] mb-1">
              No payments found
            </h4>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              {search || methodFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Payment transactions will appear here once recorded."}
            </p>
          </div>
        ) : (
          <>
            <PaymentsTable 
              data={paginatedPayments}
              onExportCsv={handleExportSingleCsv}
              onDownloadPdf={handleDownloadPdf}
              onIssueRefund={handleIssueRefund}
            />
            
            {/* Native Pagination */}
            <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex items-center justify-between">
              <p className="text-xs text-[var(--color-ink-muted)]">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedPayments.length)} of {displayedPayments.length} payments
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
