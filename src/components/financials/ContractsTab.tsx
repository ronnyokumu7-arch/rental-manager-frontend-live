"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, FileText, Filter, ChevronDown, FileSignature } from "lucide-react";
import { useContracts } from "@/hooks/financials/useContracts";
import ContractsTable from "./contracts/ContractsTable";
import GenerateContractModal from "./contracts/GenerateContractModal";

export default function ContractsTab() {
  const {
    contracts,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    handleDownload,
    handleCopyLink,
    handleSend,
    handleVoid,
    refetch,
  } = useContracts();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [_generateForId, setGenerateForId] = useState<number | null>(null);

  const pageSize = 7;

  // 1. Filter contracts by search query
  const searchFilteredContracts = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return contracts;

    return contracts.filter((contract) => {
      const contractNum = contract.contract_number?.toLowerCase() || "";
      const bookingRef = "booking_ref" in contract ? String((contract as any).booking_ref).toLowerCase() : "";
      const clientName = "client_name" in contract ? String((contract as any).client_name).toLowerCase() : "";

      return contractNum.includes(searchLower) || bookingRef.includes(searchLower) || clientName.includes(searchLower);
    });
  }, [contracts, search]);

  // 2. Filter search-filtered contracts by selected status
  const displayedContracts = useMemo(() => {
    if (statusFilter === "all") return searchFilteredContracts;
    return searchFilteredContracts.filter((contract) => contract.status === statusFilter);
  }, [searchFilteredContracts, statusFilter]);

  // 3. Status Badge Counters
  const draftCount = useMemo(() => searchFilteredContracts.filter((c) => c.status === "draft").length, [searchFilteredContracts]);
  const sentCount = useMemo(() => searchFilteredContracts.filter((c) => c.status === "sent").length, [searchFilteredContracts]);
  const signedCount = useMemo(() => searchFilteredContracts.filter((c) => c.status === "signed").length, [searchFilteredContracts]);
  const voidCount = useMemo(() => searchFilteredContracts.filter((c) => c.status === "void").length, [searchFilteredContracts]);

  // 4. Pagination (Used for Desktop Table View)
  const totalPages = Math.max(1, Math.ceil(displayedContracts.length / pageSize));

  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedContracts.slice(start, start + pageSize);
  }, [displayedContracts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, setCurrentPage]);

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-xs overflow-hidden">
        
        {/* Toolbar Header */}
        <div className="p-3 sm:p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 space-y-2.5 sm:space-y-3">
          
          {/* Status Bar Pill (Void hidden on mobile) */}
          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-5 py-2 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-[var(--color-ink-muted)]">Draft</span>
              <span className="text-[var(--color-ink)] font-bold tabular-nums">{draftCount}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-[var(--color-ink-muted)]">Sent</span>
              <span className="text-[var(--color-primary-text)] font-bold tabular-nums">{sentCount}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[var(--color-ink-muted)]">Signed</span>
              <span className="text-[var(--color-success-text)] font-bold tabular-nums">{signedCount}</span>
            </div>

            {/* Hidden on mobile, visible on sm and up */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-[var(--color-ink-muted)]">Void</span>
              <span className="text-[var(--color-danger-text)] font-bold tabular-nums">{voidCount}</span>
            </div>
          </div>

          {/* Controls: Search + Responsive Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contract or booking..."
                className="w-full pl-9 pr-3 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-xs sm:text-sm"
              />
            </div>

            {/* Mobile Icon-Only Filter */}
            <div className="relative shrink-0 sm:hidden">
              <div className="w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-ink-muted)] relative">
                <Filter size={15} />
                {statusFilter !== "all" && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
                title="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="signed">Signed</option>
                <option value="void">Void</option>
              </select>
            </div>

            {/* Desktop Full Select Filter */}
            <div className="hidden sm:block relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-10 pl-8 pr-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs sm:text-sm font-medium text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all appearance-none cursor-pointer"
                title="Filter by status"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="signed">Signed</option>
                <option value="void">Void</option>
              </select>
              <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => {
              setGenerateForId(null);
              setShowGenerateModal(true);
            }}
            className="w-full h-10 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
          >
            <FileSignature size={15} />
            <span>Generate Contract</span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-3 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : displayedContracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-3">
              <FileText size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h4 className="text-sm font-bold text-[var(--color-ink)] mb-1">
              No contracts found
            </h4>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-xs">
              {search || statusFilter !== "all" 
                ? "Try adjusting your search query or status filter." 
                : "Click 'Generate Contract' above to create contracts for pending or confirmed bookings."}
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 sm:p-4">
              <ContractsTable 
                data={paginatedContracts}
                allData={displayedContracts}
                onDownload={handleDownload}
                onCopyLink={handleCopyLink}
                onSend={handleSend}
                onVoid={handleVoid}
                onGenerate={(id) => {
                  setGenerateForId(id);
                  setShowGenerateModal(true);
                }}
              />
            </div>

            {/* Desktop-Only Pagination Footer */}
            <div className="hidden sm:block p-3 sm:p-3.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
                <p className="text-[11px] text-[var(--color-ink-muted)]">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedContracts.length)} of {displayedContracts.length} contracts
                </p>
                <div className="flex items-center justify-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--color-primary)] text-white">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <GenerateContractModal
        open={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setGenerateForId(null);
        }}
        onGenerated={() => {
          setShowGenerateModal(false);
          setGenerateForId(null);
          refetch();
        }}
      />
    </>
  );
}
