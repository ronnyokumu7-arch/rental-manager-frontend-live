// src/app/dashboard/financials/ContractsTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, FileText, Filter, FileSignature } from "lucide-react";
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
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const pageSize = 7;

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

  const displayedContracts = useMemo(() => {
    if (statusFilter === "all") return searchFilteredContracts;
    return searchFilteredContracts.filter((contract) => contract.status === statusFilter);
  }, [searchFilteredContracts, statusFilter]);

  const draftCount = useMemo(() => searchFilteredContracts.filter((c) => c.status === "draft").length, [searchFilteredContracts]);
  const sentCount = useMemo(() => searchFilteredContracts.filter((c) => c.status === "sent").length, [searchFilteredContracts]);
  const signedCount = useMemo(() => searchFilteredContracts.filter((c) => c.status === "signed").length, [searchFilteredContracts]);

  const totalPages = Math.max(1, Math.ceil(displayedContracts.length / pageSize));
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedContracts.slice(start, start + pageSize);
  }, [displayedContracts, currentPage]);

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

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Toolbar - DNA matched to Clients page */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          
          {/* Metrics Breakdown Panel - Draft | Sent | Signed (Evenly Distributed) */}
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Draft</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{draftCount}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Sent</span>
              <span className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">{sentCount}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Signed</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{signedCount}</span>
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
                  placeholder="Search contract or booking..."
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
                        {["draft", "sent", "signed", "void"].map((value) => (
                          <button
                            key={value}
                            onClick={() => { setStatusFilter(value as any); setShowFilterDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize ${
                              statusFilter === value
                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Generate Contract Button */}
            <button
              type="button"
              onClick={() => {
                setGenerateForId(null);
                setShowGenerateModal(true);
              }}
              className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <FileSignature size={14} strokeWidth={2.5} />
              Generate Contract
            </button>
          </div>
        </div>

        {/* Content Area - REMOVED p-4 wrapper for edge-to-edge table */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            Loading contracts...
          </div>
        ) : displayedContracts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No contracts found</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Click 'Generate Contract' above to create contracts for pending or confirmed bookings."}
            </p>
          </div>
        ) : (
          <>
            {/* ✅ EDGE-TO-EDGE TABLE: No p-4 wrapper */}
            <ContractsTable
              data={paginatedContracts as any}
              allData={displayedContracts as any}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              onSend={handleSend}
              onVoid={handleVoid}
              onGenerate={(id) => {
                setGenerateForId(id);
                setShowGenerateModal(true);
              }}
            />

            {/* Pagination Footer */}
            <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedContracts.length)} of {displayedContracts.length} contracts
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
