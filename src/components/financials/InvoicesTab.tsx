// src/components/financials/InvoicesTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, FileText, Archive, Filter, ChevronDown, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useInvoices } from "@/hooks/financials/useInvoices";
import InvoicesTable from "./invoices/InvoicesTable";
import RecordPaymentModal from "./invoices/RecordPaymentModal";
import CreateInvoiceModal from "./invoices/CreateInvoiceModal";
import type { Invoice } from "@/lib/types";

export default function InvoicesTab() {
  const {
    invoices, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    handleDownload, handleCopyLink, handleVoid,
    refetch
  } = useInvoices();

  const [view, setView] = useState<"open" | "closed">("open");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const pageSize = 7;

  // 1. Filter by View (Open vs Closed)
  const filteredByView = useMemo(() => {
    if (view === "closed") {
      return invoices.filter(i => i.status === "paid" || i.status === "void");
    }
    return invoices.filter(i => i.status !== "paid" && i.status !== "void");
  }, [invoices, view]);

  // 2. Apply Search and Status Filter
  const displayedInvoices = useMemo(() => {
    return filteredByView.filter(invoice => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        ('booking_ref' in invoice && String((invoice as any).booking_ref).toLowerCase().includes(searchLower)) ||
        ('client_name' in invoice && String((invoice as any).client_name).toLowerCase().includes(searchLower));
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [filteredByView, search, statusFilter]);

  // 3. Pagination Logic (7 per page)
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedInvoices.slice(start, start + pageSize);
  }, [displayedInvoices, currentPage]);

  const totalPages = Math.ceil(displayedInvoices.length / pageSize);

  // Reset to page 1 when filters or view change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view, setCurrentPage]);

  // 4. Counters (Reflects the CURRENT view: Open or Closed)
  const paidCount = useMemo(() => filteredByView.filter(i => i.status === "paid").length, [filteredByView]);
  // ✅ UPDATED: Include partially_paid in pending count
  const pendingCount = useMemo(() => filteredByView.filter(i => i.status === "sent" || i.status === "draft" || i.status === "partially_paid").length, [filteredByView]);
  const overdueCount = useMemo(() => filteredByView.filter(i => i.status === "overdue").length, [filteredByView]);

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  return (
    <>
      {/* Premium Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Left Side: View Toggle & Counters */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] flex-shrink-0">
              <button
                onClick={() => setView("open")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "open" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setView("closed")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  view === "closed" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Archive size={12} /> Closed
              </button>
            </div>

            {/* Invoice Counters (Visible in BOTH tabs) */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[var(--color-success-text)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Paid</span>
                <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{paidCount}</span>
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
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Overdue</span>
                <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{overdueCount}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Search & Filter */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or booking ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>
            
            <div className="relative w-full lg:w-48">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="partially_paid">Partially Paid</option> {/* ✅ NEW */}
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="void">Void</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : displayedInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <FileText size={32} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h4 className="text-base font-bold text-[var(--color-ink)] mb-1">
              No invoices found
            </h4>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              {search || statusFilter !== "all" 
                ? "Try adjusting your filters." 
                : view === "open" 
                  ? "Invoices will automatically appear here when bookings are confirmed."
                  : "Closed invoices will appear here once the trip has ended and they are paid or voided."}
            </p>
          </div>
        ) : (
          <>
            <InvoicesTable 
              data={paginatedInvoices}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              onVoid={handleVoid}
              onRecordPayment={openPaymentModal}
              onCreate={() => setCreateModalOpen(true)}
            />
            <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedInvoices.length)} of {displayedInvoices.length} invoices
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
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refetch}
      />

      {/* ✅ UPDATED: Wired to new RecordPaymentModal interface */}
      <RecordPaymentModal
        invoice={selectedInvoice}
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onPaymentRecorded={() => {
          refetch();
        }}
      />
    </>
  );
}
