// src/components/financials/invoices/InvoicesTable.tsx
"use client";

import { Receipt, Download, Link2, Banknote, XCircle } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/types";

interface InvoicesTableProps {
  data: Invoice[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onVoid: (id: number) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export default function InvoicesTable({ data, onDownload, onCopyLink, onVoid, onRecordPayment }: InvoicesTableProps) {
  
  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case "paid": return "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
      case "overdue": return "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]";
      case "void": return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
      case "sent": return "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]";
      case "draft": return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
      default: return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
    }
  };

  return (
    <div className="overflow-x-auto dark:bg-[var(--color-surface-hover)]">
      <table className="w-full text-sm">
        {/* Header: Slightly darker in dark mode for contrast */}
        <thead className="bg-[var(--color-surface-hover)] dark:bg-[var(--color-surface)] border-b border-[var(--color-surface-border)]">
          <tr>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Invoice</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Amount</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Due Date</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
          </tr>
        </thead>
        
        {/* Body: Rows inherit the dark wrapper background, hover adjusts for dark mode */}
        <tbody className="divide-y divide-[var(--color-surface-border)]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-ink-muted)]">
                No invoices found.
              </td>
            </tr>
          ) : (
            data.map((inv) => {
              const date = new Date(inv.due_date);
              const isOverdue = date < new Date() && inv.status !== "paid" && inv.status !== "void";
              const isPaidOrVoid = inv.status === "paid" || inv.status === "void";
              const statusStyle = getStatusStyle(inv.status);

              return (
                <tr 
                  key={inv.id} 
                  className="hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface)] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                        <Receipt size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-ink)]">{inv.invoice_number}</p>
                        <p className="text-xs text-[var(--color-ink-muted)]">Booking #{inv.booking_id || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                      {inv.currency_code} {Number(inv.amount_due).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${isOverdue ? "text-[var(--color-danger-text)]" : "text-[var(--color-ink)]"}`}>
                      {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      {isOverdue && <span className="block text-[10px] font-bold uppercase text-[var(--color-danger-text)] mt-0.5">Overdue</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onDownload(inv.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all" 
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => onCopyLink(inv.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all" 
                        title="Copy Share Link"
                      >
                        <Link2 size={14} />
                      </button>
                      {!isPaidOrVoid && (
                        <>
                          <button 
                            onClick={() => onRecordPayment(inv)} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-success)] hover:text-white transition-all" 
                            title="Record Payment"
                          >
                            <Banknote size={14} />
                          </button>
                          <button 
                            onClick={() => onVoid(inv.id)} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-danger)] hover:text-white transition-all" 
                            title="Void Invoice"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
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
