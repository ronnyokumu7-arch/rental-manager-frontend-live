// src/components/financials/contracts/ContractsTable.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Added for navigation
import { createPortal } from "react-dom";
import { FileText, Download, Copy, Send, XCircle, MoreVertical, ExternalLink } from "lucide-react"; // ✅ Added ExternalLink
import type { Contract } from "@/lib/types";

interface ContractsTableProps {
  data: Contract[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onSend: (id: number) => void;
  onVoid: (id: number) => void;
  onGenerate?: (bookingId: number) => void; // Kept in props to prevent parent breakage
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  sent: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  signed: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  void: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function ContractsTable({ 
  data, 
  onDownload, 
  onCopyLink, 
  onSend, 
  onVoid, 
  onGenerate 
}: ContractsTableProps) {
  const router = useRouter(); // ✅ Initialize router
  
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [portalPosition, setPortalPosition] = useState<{ top: number; right: number } | null>(null);
  
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Click outside to close the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdownId !== null) {
        const button = buttonRefs.current.get(openDropdownId);
        const dropdown = dropdownRef.current;
        
        if (
          button &&
          dropdown &&
          !button.contains(event.target as Node) &&
          !dropdown.contains(event.target as Node)
        ) {
          setOpenDropdownId(null);
          setPortalPosition(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // ✅ SMART POSITIONING: Prevents clipping on bottom rows and anchors perfectly
  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setPortalPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeight = 160; // Approximate height of the remaining 3-4 menu items
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      
      // Flip above if not enough space below
      const positionAbove = spaceBelow < menuHeight;
      
      setPortalPosition({
        top: positionAbove 
          ? rect.top + window.scrollY - menuHeight - 4 // Bottom of menu aligns with top of button (minus 4px gap)
          : rect.bottom + window.scrollY + 4, // Top of menu aligns with bottom of button (plus 4px gap)
        right: window.innerWidth - rect.right,
      });
      setOpenDropdownId(id);
    }
  };

  const setButtonRef = (id: number) => (el: HTMLButtonElement | null) => {
    if (el) {
      buttonRefs.current.set(id, el);
    } else {
      buttonRefs.current.delete(id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
          <tr>
            {/* ✅ EXACT REQUESTED COLUMN ORDER */}
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Contract</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Booking Ref</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Contract Status</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Date Signed</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Client</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-surface-border)]">
          {data.map((contract) => {
            const style = statusStyles[contract.status] || statusStyles.draft;
            const signedDate = contract.client_signed_at || contract.signed_at;

            // ✅ Safe fallbacks for nested/flat client and booking data
            const clientName = contract.client_name || "Unknown Client";
            const clientId = (contract as any).client?.id || (contract as any).client_id;
            const bookingRef = (contract as any).booking?.booking_number || (contract as any).booking_number || (contract as any).booking_ref || `Booking #${contract.booking_id || "N/A"}`;
            const bookingId = (contract as any).booking?.id || (contract as any).booking_id;

            return (
              <tr key={contract.id} className="hover:bg-[var(--color-surface-hover)] transition-colors group">
                
                {/* 1. Contract */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">{contract.contract_number}</p>
                    </div>
                  </div>
                </td>

                {/* 2. Booking Ref (Hyperlinked, Black Color) */}
                <td className="px-6 py-4">
                  {bookingId ? (
                    <button
                      onClick={() => router.push(`/dashboard/bookings/${bookingId}`)}
                      className="group flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-ink)] hover:underline transition-all text-left font-mono"
                      title="View Booking Details"
                    >
                      {bookingRef}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ) : (
                    <span className="text-sm text-[var(--color-ink-muted)] italic">Orphaned</span>
                  )}
                </td>

                {/* 3. Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    {contract.status}
                  </span>
                </td>

                {/* 4. Date Signed */}
                <td className="px-6 py-4">
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {formatDate(signedDate)}
                  </p>
                </td>

                {/* 5. Client (Hyperlinked, Black Color) */}
                <td className="px-6 py-4">
                  {clientId ? (
                    <button
                      onClick={() => router.push(`/dashboard/clients/${clientId}`)}
                      className="group flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-ink)] hover:underline transition-all text-left"
                      title="View Client Profile"
                    >
                      {clientName}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ) : (
                    <span className="text-sm text-[var(--color-ink-muted)] italic">Unknown</span>
                  )}
                </td>

                {/* 6. Manage */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* ✅ Standalone Download Button (Next to 3-dots) */}
                    <button
                      onClick={() => onDownload(contract.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all"
                      title="Download Contract"
                    >
                      <Download size={14} />
                    </button>

                    {/* ✅ Send Button (Only for drafts) */}
                    {contract.status === "draft" && (
                      <button
                        onClick={() => onSend(contract.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-primary-text)] hover:bg-[var(--color-primary-muted)] transition-all"
                        title="Send to Client"
                      >
                        <Send size={14} />
                      </button>
                    )}
                    
                    <div className="relative">
                      <button
                        ref={setButtonRef(contract.id)}
                        onClick={(e) => handleToggleMenu(e, contract.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                        title="More Actions"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {/* ✅ SMART PORTAL DROPDOWN */}
                      {openDropdownId === contract.id && portalPosition && typeof window !== "undefined" && createPortal(
                        <div 
                          ref={dropdownRef}
                          className="fixed w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                          style={{ 
                            top: `${portalPosition.top}px`, 
                            right: `${portalPosition.right}px` 
                          }}
                        >
                          <button
                            onClick={() => { onDownload(contract.id); setOpenDropdownId(null); setPortalPosition(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                          >
                            <Download size={14} /> Download PDF
                          </button>
                          
                          <button
                            onClick={() => { onCopyLink(contract.id); setOpenDropdownId(null); setPortalPosition(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                          >
                            <Copy size={14} /> Copy Share Link
                          </button>
                          
                          {(contract.status === "draft" || contract.status === "sent") && (
                            <button
                              onClick={() => { onVoid(contract.id); setOpenDropdownId(null); setPortalPosition(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors border-t border-[var(--color-surface-border)]"
                            >
                              <XCircle size={14} /> Void Contract
                            </button>
                          )}
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
