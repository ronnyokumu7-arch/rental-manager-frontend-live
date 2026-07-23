// src/components/financials/overview/InvoiceStatusWidget.tsx
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { InvoiceStatusSummary } from "@/hooks/financials/useFinancialOverview";

interface Props {
  data: InvoiceStatusSummary;
}

export default function InvoiceStatusWidget({ data }: Props) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-6 flex flex-col h-full">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-4">Invoice Status</h3>
      
      {/* 3 Colored Boxes */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Paid */}
        <div className="bg-[var(--color-success-bg)]/50 border border-[var(--color-success-bg)] rounded-xl p-3 flex flex-col items-center text-center">
          <CheckCircle2 className="text-[var(--color-success-text)] mb-1" size={16} />
          <p className="text-lg font-bold text-[var(--color-ink)] tabular-nums">{data.paid_count}</p>
          <p className="text-[10px] font-medium text-[var(--color-success-text)]">{data.paid_percentage}% Paid</p>
        </div>

        {/* Pending */}
        <div className="bg-[var(--color-warning-bg)]/50 border border-[var(--color-warning-bg)] rounded-xl p-3 flex flex-col items-center text-center">
          <Clock className="text-[var(--color-warning-text)] mb-1" size={16} />
          <p className="text-lg font-bold text-[var(--color-ink)] tabular-nums">{data.pending_count}</p>
          <p className="text-[10px] font-medium text-[var(--color-warning-text)]">{data.pending_percentage}% Pending</p>
        </div>

        {/* Overdue */}
        <div className="bg-[var(--color-danger-bg)]/50 border border-[var(--color-danger-bg)] rounded-xl p-3 flex flex-col items-center text-center">
          <AlertTriangle className="text-[var(--color-danger-text)] mb-1" size={16} />
          <p className="text-lg font-bold text-[var(--color-ink)] tabular-nums">{data.overdue_count}</p>
          <p className="text-[10px] font-medium text-[var(--color-danger-text)]">{data.overdue_percentage}% Overdue</p>
        </div>
      </div>

      {/* Collection Rate */}
      <div className="mt-auto pt-4 border-t border-[var(--color-surface-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Collection Rate</span>
          <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">{data.collection_rate}%</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-success-text)] rounded-full transition-all duration-1000"
            style={{ width: `${data.collection_rate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
