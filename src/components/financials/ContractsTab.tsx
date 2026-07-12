// src/components/financials/ContractsTab.tsx
"use client";

import { useState } from "react";
import { Search, FileText, Plus } from "lucide-react";
import { useContracts } from "@/hooks/financials/useContracts";
import ContractsTable from "./contracts/ContractsTable";
import GenerateContractModal from "./contracts/GenerateContractModal";

export default function ContractsTab() {
  const {
    contracts, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, totalItems,
    handleDownload, handleCopyLink, handleSend, handleVoid,
  } = useContracts();

  const [showGenerateModal, setShowGenerateModal] = useState(false);

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
                placeholder="Search contract or booking ID..."
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
              <option value="signed">Signed</option>
              <option value="void">Void</option>
            </select>
          </div>
          
          {/* Generate Contract Button */}
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all w-full sm:w-auto justify-center"
          >
            <Plus size={14} /> Generate Contract
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <FileText size={32} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h4 className="text-base font-bold text-[var(--color-ink)] mb-1">No contracts found</h4>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
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
            
            {/* Native Pagination */}
            <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex items-center justify-between">
              <p className="text-xs text-[var(--color-ink-muted)]">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} contracts
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

      <GenerateContractModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={() => setShowGenerateModal(false)}
      />
    </>
  );
}
