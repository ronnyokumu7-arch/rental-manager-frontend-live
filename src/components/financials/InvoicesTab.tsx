// src/app/dashboard/financials/InvoicesTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, FileText, Filter, FileSignature } from "lucide-react";
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

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const pageSize = 7;

  const displayedInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        ('booking_ref' in invoice && String((invoice as any).booking_ref).toLowerCase().includes(searchLower)) ||
        ('client_name' in invoice && String((invoice as any).client_name).toLowerCase().includes(searchLower));
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedInvoices.slice(start, start + pageSize);
  }, [displayedInvoices, currentPage]);

  const totalPages = Math.ceil(displayedInvoices.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, setCurrentPage]);

  // Handle click outside for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFilterDropdown && !target.closest('[data-filter-container]')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterDropdown]);

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar - DNA matched to Contracts/Clients page */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          
          {/* Metrics Breakdown Panel - Draft | Sent | Paid (Evenly Distributed) */}
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Draft</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{invoices.filter(i => i.status === "draft").length}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Sent</span>
              <span className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">{invoices.filter(i => i.status === "sent").length}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Paid</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{invoices.filter(i => i.status === "paid").length}</span>
            </div>
          </div>

          {/* Controls: Search + Icon-Only Filter + Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 sm:w-80">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search invoice or booking ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                />
              </div>

              {/* ✅ PREMIUM ICON-ONLY FILTER DROPDOWN */}
              <div className="relative flex-shrink-0" data-filter-container>
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    statusFilter !== "all"
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }`}
                  title="Filter by status"
                >
                  <Filter size={15} />
                </button>

                {showFilterDropdown && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="py-1">
                        {/* "All Statuses" - clears filter */}
                        <button
                          onClick={() => { setStatusFilter("all"); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                            statusFilter === "all"
                              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                          }`}
                        >
                          All Statuses
                        </button>
                        <div className="h-px bg-[var(--color-surface-border)]" />
                        
                        {/* Filter options */}
                        {["draft", "sent", "partially_paid", "paid", "overdue", "void"].map((value) => (
                          <button
                            key={value}
                            onClick={() => { setStatusFilter(value); setShowFilterDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize ${
                              statusFilter === value
                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                            }`}
                          >
                            {value.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Generate Invoice Button */}
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <FileSignature size={14} strokeWidth={2.5} />
              Generate Invoice
            </button>
          </div>
        </div>

        {/* Content Area - Edge-to-edge table */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            Loading invoices...
          </div>
        ) : displayedInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No invoices found</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Invoices are now created manually. Click 'Generate Invoice' to create one for an orphaned booking."}
            </p>
          </div>
        ) : (
          <>
            {/* ✅ EDGE-TO-EDGE TABLE: No p-4 wrapper */}
            <InvoicesTable 
              data={paginatedInvoices}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              onVoid={handleVoid}
              onRecordPayment={openPaymentModal}
              onCreate={() => setCreateModalOpen(true)} 
            />

            {/* Pagination Footer */}
            <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedInvoices.length)} of {displayedInvoices.length} invoices
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                >
                  Next
                </button>
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

      <RecordPaymentModal
        invoice={selectedInvoice}
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onPaymentRecorded={refetch}
      />
    </>
  );
}
