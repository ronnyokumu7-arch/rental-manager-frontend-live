// src/components/financials/ContractsTab.tsx
"use client";

import { Search, FileText, Plus } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Pagination from "@/components/ui/Pagination";
import { useContracts } from "@/hooks/financials/useContracts";
import ContractsTable from "./contracts/ContractsTable";

export default function ContractsTab() {
  const {
    contracts, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, totalItems,
    handleDownload, handleCopyLink, handleSend, handleVoid
  } = useContracts();

  return (
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
              placeholder="Search contract or booking ID..."
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none w-64 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="signed">Signed</option>
            <option value="void">Void</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors">
          <Plus size={14} /> Generate Contract
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
        </div>
      ) : contracts.length === 0 ? (
        // ✅ FIXED: Premium Centered Empty State (Matches InvoicesTab)
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileText size={32} className="text-slate-400 dark:text-slate-600" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            No contracts found
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {search || statusFilter !== "all" 
              ? "Try adjusting your filters." 
              : "Contracts will automatically appear here when bookings are confirmed."}
          </p>
        </div>
      ) : (
        <>
          <ContractsTable 
            data={contracts}
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            onSend={handleSend}
            onVoid={handleVoid}
          />
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={10} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </SectionCard>
  );
}
