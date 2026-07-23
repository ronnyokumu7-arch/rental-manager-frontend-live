// src/components/financials/invoices/InvoicesTable.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { FileText, Download, Copy, DollarSign, XCircle, MoreVertical, ExternalLink } from "lucide-react";
import type { Invoice } from "@/lib/types";

interface InvoicesTableProps {
  data: Invoice[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onVoid: (id: number) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onCreate?: () => void;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  sent: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  partially_paid: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  paid: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  overdue: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
  void: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function InvoicesTable({ 
  data, 
  onDownload, 
  onCopyLink, 
  onVoid, 
  onRecordPayment, 
  onCreate 
}: InvoicesTableProps) {
  const router = useRouter();
  
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [portalPosition, setPortalPosition] = useState<{ top: number; right: number } | null>(null);
  
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setPortalPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeight = 200;
      const viewportBottom = window.innerHeight;
      const spaceBelow = viewportBottom - rect.bottom;
      
      const positionAbove = spaceBelow < menuHeight;
      
      setPortalPosition({
        top: positionAbove 
          ? rect.top + window.scrollY - menuHeight - 4
          : rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      });
      setOpenDropdownId(id);
    }
  };

  const setButtonRef = (id: number) => (el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(id, el);
    else buttonRefs.current.delete(id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
          <tr>
            {/* ✅ UPDATED COLUMN ORDER: Amount & Due Date swapped */}
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Invoice #</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Booking Ref</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Amount</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Due Date</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Payment Status</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Client</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-surface-border)]">
          {data.map((invoice) => {
            const style = statusStyles[invoice.status] || statusStyles.draft;
            
            // Safe fallbacks for nested/flat client and booking data
            const clientName = (invoice as any).client?.full_name || (invoice as any).client_name || "Unknown Client";
            const clientId = (invoice as any).client?.id || (invoice as any).client_id;
            const bookingRef = (invoice as any).booking?.booking_number || (invoice as any).booking_number || (invoice as any).booking_ref || `#${invoice.booking_id || "N/A"}`;
            const bookingId = (invoice as any).booking?.id || (invoice as any).booking_id;

            return (
              <tr key={invoice.id} className="hover:bg-[var(--color-surface-hover)] transition-colors group">
                
                {/* 1. Invoice # */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">{invoice.invoice_number}</p>
                    </div>
                  </div>
                </td>

                {/* 2. Booking Ref */}
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

                {/* 3. Amount (SWAPPED) */}
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                    {invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}
                  </p>
                </td>

                {/* 4. Due Date (SWAPPED) */}
                <td className="px-6 py-4">
                  <p className={`text-sm tabular-nums ${invoice.status === 'overdue' ? 'font-semibold text-[var(--color-danger-text)]' : 'text-[var(--color-ink-muted)]'}`}>
                    {formatDate(invoice.due_date)}
                  </p>
                </td>

                {/* 5. Payment Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    {invoice.status.replace("_", " ")}
                  </span>
                </td>

                {/* 6. Client */}
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

                {/* 7. Manage */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDownload(invoice.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all"
                      title="Download Invoice"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      ref={setButtonRef(invoice.id)}
                      onClick={(e) => handleToggleMenu(e, invoice.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                      title="More Actions"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {openDropdownId === invoice.id && portalPosition && typeof window !== "undefined" && createPortal(
                      <div 
                        ref={dropdownRef}
                        className="fixed w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        style={{ 
                          top: `${portalPosition.top}px`, 
                          right: `${portalPosition.right}px` 
                        }}
                      >
                        <button
                          onClick={() => { onDownload(invoice.id); setOpenDropdownId(null); setPortalPosition(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <Download size={14} /> Download PDF
                        </button>
                        
                        <button
                          onClick={() => { onCopyLink(invoice.id); setOpenDropdownId(null); setPortalPosition(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                        >
                          <Copy size={14} /> Copy Share Link
                        </button>
                        
                        {invoice.status !== "paid" && invoice.status !== "void" && (
                          <>
                            <button
                              onClick={() => { onRecordPayment(invoice); setOpenDropdownId(null); setPortalPosition(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-success-text)] hover:bg-[var(--color-success-bg)] transition-colors border-t border-[var(--color-surface-border)]"
                            >
                              <DollarSign size={14} /> Record Offline Payment
                            </button>
                            
                            <button
                              onClick={() => { onVoid(invoice.id); setOpenDropdownId(null); setPortalPosition(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors border-t border-[var(--color-surface-border)]"
                            >
                              <XCircle size={14} /> Void Invoice
                            </button>
                          </>
                        )}
                      </div>,
                      document.body
                    )}
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
