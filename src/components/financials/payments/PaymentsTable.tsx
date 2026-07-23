// src/components/financials/payments/PaymentsTable.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Receipt, CreditCard, Banknote, Upload, MoreVertical, FileText, RotateCcw, ExternalLink } from "lucide-react";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";

interface PaymentsTableProps {
  data: Payment[];
  onExportCsv?: (id: number) => void;
  onDownloadPdf?: (id: number) => void;
  onIssueRefund?: (id: number) => void;
}

export default function PaymentsTable({ 
  data, 
  onExportCsv, 
  onDownloadPdf, 
  onIssueRefund 
}: PaymentsTableProps) {
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "mpesa": return <CreditCard size={14} className="text-[var(--color-success-text)]" />;
      case "manual": return <Banknote size={14} className="text-[var(--color-ink-muted)]" />;
      default: return <Receipt size={14} className="text-[var(--color-ink-muted)]" />;
    }
  };

  const getMethodStyle = (method: PaymentMethod) => {
    if (method === "mpesa") return "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
    return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
  };

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case "completed": return "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
      case "failed": return "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]";
      case "pending": return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
      default: return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
          <tr>
            {/* ✅ EXACT REQUESTED COLUMN ORDER */}
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Invoice Ref</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Payment Method</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Amount</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Client</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Payment Status</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Date Received</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-[var(--color-surface-border)]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-ink-muted)]">
                No payments found.
              </td>
            </tr>
          ) : (
            data.map((p) => {
              const date = p.paid_at ? new Date(p.paid_at) : new Date(p.created_at);
              const methodStyle = getMethodStyle(p.method);
              const statusStyle = getStatusStyle(p.status);

              // ✅ Safe fallbacks for nested/flat data
              const clientName = (p as any).client?.full_name || (p as any).client_name || "Unknown Client";
              const clientId = (p as any).client?.id || (p as any).client_id;
              const invoiceRef = (p as any).invoice?.invoice_number || (p as any).invoice_number || `Invoice #${p.invoice_id || "N/A"}`;
              
              // ✅ UPDATED: Cleanly catch the booking_id from the new computed field we added to types/schema
              const bookingId = p.booking_id || (p as any).invoice?.booking_id;

              return (
                <tr 
                  key={p.id} 
                  className="hover:bg-[var(--color-surface-hover)] transition-colors group"
                >
                  {/* 1. Invoice Ref (LINKED TO BOOKING PROFILE) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-[var(--color-ink-subtle)]" />
                      </div>
                      <div className="min-w-0">
                        {bookingId ? (
                          <button
                            onClick={() => router.push(`/dashboard/bookings/${bookingId}`)}
                            className="group flex items-center gap-1.5 text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-ink)] hover:underline transition-all text-left"
                            title="View Booking Profile"
                          >
                            {invoiceRef}
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <span className="text-sm font-bold text-[var(--color-ink)]">{invoiceRef}</span>
                        )}
                        
                        {/* ✅ Rich Subtitle: Shows the Payment Ref (e.g., M-Pesa Code) */}
                        {p.reference && (
                          <p className="text-[11px] text-[var(--color-ink-muted)] truncate font-mono mt-0.5">
                            Ref: {p.reference}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* 2. Payment Method */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${methodStyle}`}>
                      {getMethodIcon(p.method)}
                      {p.method}
                    </span>
                  </td>

                  {/* 3. Amount */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                      {p.currency_code || "KES"} {Number(p.amount).toLocaleString()}
                    </span>
                  </td>

                  {/* 4. Client (Hyperlinked, Black Color) */}
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

                  {/* 5. Payment Status */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle}`}>
                      {p.status}
                    </span>
                  </td>

                  {/* 6. Date Received */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--color-ink-muted)]">
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </td>
                  
                  {/* 7. Manage */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onExportCsv && (
                        <button
                          onClick={() => onExportCsv(p.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all"
                          title="Export CSV"
                        >
                          <Upload size={14} />
                        </button>
                      )}

                      <button
                        ref={setButtonRef(p.id)}
                        onClick={(e) => handleToggleMenu(e, p.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                        title="More Actions"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openDropdownId === p.id && portalPosition && typeof window !== "undefined" && createPortal(
                        <div 
                          ref={dropdownRef}
                          className="fixed w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                          style={{ 
                            top: `${portalPosition.top}px`, 
                            right: `${portalPosition.right}px` 
                          }}
                        >
                          {onExportCsv && (
                            <button
                              onClick={() => { onExportCsv(p.id); setOpenDropdownId(null); setPortalPosition(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                              <Upload size={14} /> Export CSV
                            </button>
                          )}
                          
                          {onDownloadPdf && (
                            <button
                              onClick={() => { onDownloadPdf(p.id); setOpenDropdownId(null); setPortalPosition(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                            >
                              <FileText size={14} /> Download PDF
                            </button>
                          )}
                          
                          {onIssueRefund && (
                            <button
                              onClick={() => { onIssueRefund(p.id); setOpenDropdownId(null); setPortalPosition(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors border-t border-[var(--color-surface-border)]"
                            >
                              <RotateCcw size={14} /> Issue Refund
                            </button>
                          )}
                        </div>,
                        document.body
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
