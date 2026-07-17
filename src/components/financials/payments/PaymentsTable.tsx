// src/components/financials/payments/PaymentsTable.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Receipt, CreditCard, Banknote, Download, MoreVertical, FileText, RotateCcw } from "lucide-react";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";

interface PaymentsTableProps {
  data: Payment[];
  onExportCsv?: (id: number) => void;
  onRecordPayment?: (id: number) => void;
  onDownloadPdf?: (id: number) => void;
  onIssueRefund?: (id: number) => void;
}

export default function PaymentsTable({ 
  data, 
  onExportCsv, 
  onRecordPayment, 
  onDownloadPdf, 
  onIssueRefund 
}: PaymentsTableProps) {
  
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

  // ✅ Calculate position to break out of overflow-x-auto clipping
const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
  e.stopPropagation();
  if (openDropdownId === id) {
    setOpenDropdownId(null);
    setPortalPosition(null);
  } else {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 200; // Approximate height of the dropdown menu
    const viewportBottom = window.innerHeight;
    const spaceBelow = viewportBottom - rect.bottom;
    
    // ✅ SMART POSITIONING: Flip above if not enough space below
    const positionAbove = spaceBelow < menuHeight;
    
    setPortalPosition({
      top: positionAbove 
        ? rect.top + window.scrollY - menuHeight - 2 // Position above with 4px gap
        : rect.bottom + window.scrollY + 2, // Position below with 4px gap
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

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "mpesa":
        return <CreditCard size={14} className="text-[var(--color-success-text)]" />;
      case "manual":
        return <Banknote size={14} className="text-[var(--color-ink-muted)]" />;
      default:
        return <Receipt size={14} className="text-[var(--color-ink-muted)]" />;
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
    <div className="overflow-x-auto dark:bg-[var(--color-surface-hover)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface-hover)] dark:bg-[var(--color-surface)] border-b border-[var(--color-surface-border)]">
          <tr>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Payment Ref</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Method</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Invoice #</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Amount</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Date</th>
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

              return (
                <tr 
                  key={p.id} 
                  className="hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface)] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0">
                        {getMethodIcon(p.method)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                          {p.reference || `Payment #${p.id}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${methodStyle}`}>
                      {getMethodIcon(p.method)}
                      {p.method}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--color-ink)]">
                      {p.invoice_number || "—"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                      {p.currency_code} {Number(p.amount).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle}`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--color-ink-muted)]">
                      {date.toLocaleDateString("en-GB", { 
                        day: "2-digit", 
                        month: "short", 
                        year: "numeric" 
                      })}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onExportCsv && (
                        <button
                          onClick={() => onExportCsv(p.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all"
                          title="Export CSV"
                        >
                          <Download size={14} />
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
                          {/* ✅ REMOVED p.status === "pending" check so it's always visible */}
                          {onRecordPayment && (
                            <button
                              onClick={() => { onRecordPayment(p.id); setOpenDropdownId(null); setPortalPosition(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-success-text)] hover:bg-[var(--color-success-bg)] transition-colors"
                            >
                              <CreditCard size={14} /> Record Payment
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
