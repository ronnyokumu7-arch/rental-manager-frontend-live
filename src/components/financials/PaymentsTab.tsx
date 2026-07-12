// src/components/financials/PaymentsTab.tsx
"use client";

import { useState } from "react";
import { Search, Plus, CreditCard, Upload } from "lucide-react";
import { usePayments } from "@/hooks/financials/usePayments";
import PaymentsTable from "./payments/PaymentsTable";
import RecordPaymentModal from "./payments/RecordPaymentModal";

export default function PaymentsTab() {
  const {
    payments, loading, search, setSearch,
    methodFilter, setMethodFilter,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, totalItems,
    refetch
  } = usePayments();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleExportCSV = () => {
    if (payments.length === 0) return;
    
    const headers = ["ID", "Invoice ID", "Amount", "Currency", "Method", "Reference", "Status", "Date"];
    const rows = payments.map(p => [
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
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference or invoice ID..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
            
            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="px-4 py-2 text-sm rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none cursor-pointer transition-all appearance-none"
            >
              <option value="all">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="manual">Bank/Cash</option>
            </select>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 text-sm rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none cursor-pointer transition-all appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Export CSV Button */}
            <button 
              onClick={handleExportCSV}
              disabled={payments.length === 0}
              className="p-2.5 rounded-xl text-[var(--color-ink-muted)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to CSV"
            >
              <Upload size={16} />
            </button>
            
            {/* Record Payment Button */}
            <button 
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all flex-1 sm:flex-none justify-center"
            >
              <Plus size={14} /> Record Payment
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <CreditCard size={32} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h4 className="text-base font-bold text-[var(--color-ink)] mb-1">
              No payments found
            </h4>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              {search || methodFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Payment transactions will appear here when clients pay or when you record offline payments."}
            </p>
          </div>
        ) : (
          <>
            <PaymentsTable data={payments} />
            
            {/* Native Pagination */}
            <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex items-center justify-between">
              <p className="text-xs text-[var(--color-ink-muted)]">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} payments
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
          </>
        )}
      </div>

      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentRecorded={refetch}
      />
    </>
  );
}
