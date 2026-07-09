// src/components/financials/InvoicesTab.tsx
import { useState } from "react";
import { Search, Filter, FileText, Receipt } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { useInvoices } from "@/hooks/financials/useInvoices";
import InvoicesTable from "./invoices/InvoicesTable";
import RecordPaymentModal from "./invoices/RecordPaymentModal";
import type { Invoice } from "@/lib/types";

export default function InvoicesTab() {
  const {
    invoices, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, totalItems,
    handleDownload, handleCopyLink, handleVoid, handleRecordPayment
  } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  return (
    <>
      <SectionCard padding={false}>
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or booking ID..."
                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="void">Void</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
            <FileText size={14} /> New Invoice
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          // ✅ FIXED: Premium Centered Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Receipt size={32} className="text-slate-400 dark:text-slate-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              No invoices found
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
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
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={10} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </SectionCard>

      <RecordPaymentModal
        invoice={selectedInvoice}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={(amount) => selectedInvoice ? handleRecordPayment(selectedInvoice.id, amount) : Promise.resolve(false)}
      />
    </>
  );
}
