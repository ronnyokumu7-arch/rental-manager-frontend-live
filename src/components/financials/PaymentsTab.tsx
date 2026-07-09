// src/components/financials/PaymentsTab.tsx
"use client";

import { useState } from "react";
import { Search, Filter, Plus, CreditCard } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Pagination from "@/components/ui/Pagination";
import { usePayments } from "@/hooks/financials/usePayments";
import PaymentsTable from "./payments/PaymentsTable";
import RecordPaymentModal from "./payments/RecordPaymentModal";

export default function PaymentsTab() {
  const {
    payments, loading, search, setSearch,
    methodFilter, setMethodFilter,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, totalItems
  } = usePayments();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  return (
    <>
      <SectionCard padding={false}>
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference or invoice ID..."
                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none w-64 transition-all"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="manual">Bank/Cash</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button 
            onClick={() => setPaymentModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Plus size={14} /> Record Payment
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          // ✅ Premium Centered Empty State (Matches Invoices & Contracts)
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <CreditCard size={32} className="text-slate-400 dark:text-slate-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              No payments found
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              {search || methodFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Payment transactions will appear here when clients pay or when you record offline payments."}
            </p>
          </div>
        ) : (
          <>
            <PaymentsTable data={payments} />
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={10} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </SectionCard>

      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentRecorded={() => {
          setPaymentModalOpen(false);
          // Trigger refetch - you might want to add this to usePayments hook
        }}
      />
    </>
  );
}
