// src/components/financials/ContractsTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, FileText, Archive, Filter, ChevronDown, FileSignature, Send, CheckCircle2, XCircle } from "lucide-react";
import { useContracts } from "@/hooks/financials/useContracts";
import ContractsTable from "./contracts/ContractsTable";
import GenerateContractModal from "./contracts/GenerateContractModal";

export default function ContractsTab() {
  const {
    contracts, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    handleDownload, handleCopyLink, handleSend, handleVoid,
    refetch
  } = useContracts();

  const [view, setView] = useState<"open" | "closed">("open");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForId, setGenerateForId] = useState<number | null>(null); // ✅ Track which contract to generate for

  const pageSize = 7;

  // 1. Filter by View (Open vs Closed)
  const filteredByView = useMemo(() => {
    if (view === "closed") {
      return contracts.filter(c => c.status === "signed" || c.status === "void");
    }
    return contracts.filter(c => c.status === "draft" || c.status === "sent");
  }, [contracts, view]);

  // 2. Apply Search and Status Filter
  const displayedContracts = useMemo(() => {
    return filteredByView.filter(contract => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        contract.contract_number.toLowerCase().includes(searchLower) ||
        ('booking_ref' in contract && String((contract as any).booking_ref).toLowerCase().includes(searchLower)) ||
        ('client_name' in contract && String((contract as any).client_name).toLowerCase().includes(searchLower));
      
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [filteredByView, search, statusFilter]);

  // 3. Pagination Logic (7 per page)
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedContracts.slice(start, start + pageSize);
  }, [displayedContracts, currentPage]);

  const totalPages = Math.ceil(displayedContracts.length / pageSize);

  // Reset to page 1 when filters or view change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view, setCurrentPage]);

  // 4. Counters (Reflects the CURRENT view: Open or Closed)
  const draftCount = useMemo(() => filteredByView.filter(c => c.status === "draft").length, [filteredByView]);
  const sentCount = useMemo(() => filteredByView.filter(c => c.status === "sent").length, [filteredByView]);
  const signedCount = useMemo(() => filteredByView.filter(c => c.status === "signed").length, [filteredByView]);
  const voidCount = useMemo(() => filteredByView.filter(c => c.status === "void").length, [filteredByView]);

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

            {/* Contract Counters (Visible in BOTH tabs) */}
            <div className="hidden xl:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <FileSignature size={14} className="text-[var(--color-ink-muted)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Draft</span>
                <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{draftCount}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)]" />
              <div className="flex items-center gap-2">
                <Send size={14} className="text-[var(--color-primary-text)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Sent</span>
                <span className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">{sentCount}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)]" />
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[var(--color-success-text)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Signed</span>
                <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{signedCount}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)]" />
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-[var(--color-danger-text)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Void</span>
                <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{voidCount}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Search & Filter (Generate button removed from here) */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contract or booking ID..."
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
                <option value="signed">Signed</option>
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
        ) : displayedContracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <FileText size={32} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h4 className="text-base font-bold text-[var(--color-ink)] mb-1">
              No contracts found
            </h4>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              {search || statusFilter !== "all" 
                ? "Try adjusting your filters." 
                : view === "open" 
                  ? "Contracts will automatically appear here when bookings are confirmed."
                  : "Closed contracts will appear here once they are signed or voided."}
            </p>
          </div>
        ) : (
          <>
            <ContractsTable 
              data={paginatedContracts}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              onSend={handleSend}
              onVoid={handleVoid}
              onGenerate={(id) => {
                setGenerateForId(id);
                setShowGenerateModal(true);
              }}
            />
            <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedContracts.length)} of {displayedContracts.length} contracts
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
        // Note: If your GenerateContractModal accepts a pre-filled ID, pass it here:
        // initialContractId={generateForId || undefined} 
      />
    </>
  );
}
