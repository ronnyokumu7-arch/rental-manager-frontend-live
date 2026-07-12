// src/components/financials/payments/PaymentsTable.tsx
"use client";

import { Receipt, CreditCard, Banknote } from "lucide-react";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";

interface PaymentsTableProps {
  data: Payment[];
}

export default function PaymentsTable({ data }: PaymentsTableProps) {
  
  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "mpesa":
        return <CreditCard size={16} className="text-[var(--color-success-text)]" />;
      case "manual":
        return <Banknote size={16} className="text-[var(--color-ink-muted)]" />;
      default:
        return <Receipt size={16} className="text-[var(--color-ink-muted)]" />;
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
        {/* Header: Slightly darker in dark mode for contrast */}
        <thead className="bg-[var(--color-surface-hover)] dark:bg-[var(--color-surface)] border-b border-[var(--color-surface-border)]">
          <tr>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Reference</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Amount</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Method</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Date</th>
          </tr>
        </thead>
        
        {/* Body: Rows inherit the dark wrapper background, hover adjusts for dark mode */}
        <tbody className="divide-y divide-[var(--color-surface-border)]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-ink-muted)]">
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
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          Invoice #{p.invoice_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                      {p.currency_code} {Number(p.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${methodStyle}`}>
                      {p.method}
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
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
