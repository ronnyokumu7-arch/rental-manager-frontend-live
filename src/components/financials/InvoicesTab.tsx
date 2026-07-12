// src/components/financials/InvoicesTab.tsx
"use client";

import { useState } from "react";
import { Search, FileText, Plus } from "lucide-react";
import { useInvoices } from "@/hooks/financials/useInvoices";
import InvoicesTable from "./invoices/InvoicesTable";
import RecordPaymentModal from "./invoices/RecordPaymentModal";
import CreateInvoiceModal from "./invoices/CreateInvoiceModal";
import type { Invoice } from "@/lib/types";

export default function InvoicesTab() {
  const {
    invoices, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, totalItems,
    handleDownload, handleCopyLink, handleVoid, handleRecordPayment,
    refetch
  } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  return (
    <>
      {/* Premium Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or booking ID..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 text-sm rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none cursor-pointer transition-all appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="void">Void</option>
            </select>
          </div>
          
          {/* New Invoice Button */}
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all w-full sm:w-auto justify-center"
          >
            <Plus size={14} /> New Invoice
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
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
                : "Invoices will automatically appear here when bookings are confirmed."}
            </p>
          </div>
        ) : (
          <>
            <InvoicesTable 
              data={invoices}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              onVoid={handleVoid}
              onRecordPayment={openPaymentModal}
            />
            <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} invoices
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all"
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

      <RecordPaymentModal
        invoice={selectedInvoice}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={(amount) => selectedInvoice ? handleRecordPayment(selectedInvoice.id, amount) : Promise.resolve(false)}
      />
    </>
  );
}
