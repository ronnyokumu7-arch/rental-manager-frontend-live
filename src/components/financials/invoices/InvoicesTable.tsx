// src/components/financials/invoices/InvoicesTable.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { FileText, Download, Copy, DollarSign, XCircle, MoreVertical, ExternalLink, Hash } from "lucide-react";
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
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
};

export default function InvoicesTable({ 
  data, 
  onDownload, 
  onCopyLink, 
  onVoid, 
  onRecordPayment, 
  onCreate: _onCreate 
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
    <div className="w-full">
      {/* ── MOBILE CARD VIEW ── */}
      <div className="block md:hidden p-4 space-y-3">
        {data.map((invoice) => {
          const style = statusStyles[invoice.status] || statusStyles.draft;
          const clientName = (invoice as any).client?.full_name || (invoice as any).client_name || "Unknown Client";
          const bookingRef = (invoice as any).booking?.booking_number || (invoice as any).booking_number || (invoice as any).booking_ref || `#${invoice.booking_id || "N/A"}`;

          return (
            <div
              key={invoice.id}
              className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[var(--color-ink)] truncate leading-tight">
                      {invoice.invoice_number}
                    </h4>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5 font-medium">
                      {clientName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Options Menu Button */}
                  <button
                    ref={setButtonRef(invoice.id)}
                    onClick={(e) => handleToggleMenu(e, invoice.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
                    title="Actions"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Booking Ref */}
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-ink-subtle)] flex items-center gap-1">
                      <Hash size={10} /> Booking Ref
                    </p>
                    <p className="font-bold text-[var(--color-ink)] truncate mt-0.5">
                      {bookingRef}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-ink-subtle)] flex items-center gap-1">
                      <DollarSign size={10} /> Amount
                    </p>
                    <p className="font-bold text-[var(--color-ink)] truncate mt-0.5 tabular-nums">
                      {invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}
                    </p>
                  </div>

                  {/* Status + Icon-Only Action Buttons */}
                  <div className="col-span-2 border-t border-[var(--color-surface-border)]/60 pt-3 mt-3 flex items-center justify-between">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}
                    >
                      {invoice.status.replace("_", " ")}
                    </span>

                    {/* Plain Icon-Only Action Buttons: Copy (Left) + Download (Right) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyLink(invoice.id);
                        }}
                        className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-all cursor-pointer"
                        title="Copy Share Link"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(invoice.id);
                        }}
                        className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portal Dropdown for Mobile */}
              {openDropdownId === invoice.id && portalPosition && typeof window !== "undefined" && createPortal(
                <div 
                  ref={dropdownRef}
                  className="fixed w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                  style={{ 
                    top: `${portalPosition.top}px`, 
                    right: `${portalPosition.right}px` 
                  }}
                  onClick={(e) => e.stopPropagation()}
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
          );
        })}
      </div>

      {/* ── DESKTOP TABLE VIEW ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
            <tr>
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
              const clientName = (invoice as any).client?.full_name || (invoice as any).client_name || "Unknown Client";
              const clientId = (invoice as any).client?.id || (invoice as any).client_id;
              const bookingRef = (invoice as any).booking?.booking_number || (invoice as any).booking_number || (invoice as any).booking_ref || `#${invoice.booking_id || "N/A"}`;
              const bookingId = (invoice as any).booking?.id || (invoice as any).booking_id;

              return (
                <tr key={invoice.id} className="hover:bg-[var(--color-surface-hover)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{invoice.invoice_number}</p>
                      </div>
                    </div>
                  </td>

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

                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                      {invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className={`text-sm tabular-nums ${invoice.status === 'overdue' ? 'font-semibold text-[var(--color-danger-text)]' : 'text-[var(--color-ink-muted)]'}`}>
                      {formatDate(invoice.due_date)}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                      {invoice.status.replace("_", " ")}
                    </span>
                  </td>

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
                          className="fixed w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                          style={{ 
                            top: `${portalPosition.top}px`, 
                            right: `${portalPosition.right}px` 
                          }}
                          onClick={(e) => e.stopPropagation()}
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
    </div>
  );
}
