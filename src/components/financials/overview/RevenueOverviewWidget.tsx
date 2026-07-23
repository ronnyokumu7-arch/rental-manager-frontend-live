// src/components/financials/overview/RevenueOverviewWidget.tsx
import { TrendingUp } from "lucide-react";
import type { RevenueOverview } from "@/hooks/financials/useFinancialOverview";

interface Props {
  data: RevenueOverview;
}

export default function RevenueOverviewWidget({ data }: Props) {
  const maxAmount = Math.max(...data.monthly_trend.map(m => m.amount), 1);

  // ✅ Smart formatting: removes .00 for whole numbers, keeps 2 decimals for cents
  const formatCurrency = (amount: number) => {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded === Math.floor(rounded)) {
      // It's a whole number, no decimals needed
      return `KES ${rounded.toLocaleString()}`;
    } else {
      // Has cents, show exactly 2 decimals
      return `KES ${rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Avg Monthly */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Avg. Monthly Revenue</p>
          <p className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">{formatCurrency(data.avg_monthly_revenue)}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-success-text)] font-semibold">
            <TrendingUp size={12} />
            <span>Stable</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">{formatCurrency(data.total_revenue)}</p>
        </div>

        {/* Total Pending */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Total Pending</p>
          <p className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">{formatCurrency(data.total_pending)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-40 flex items-end justify-between gap-2 pt-4 border-t border-[var(--color-surface-border)]">
        {data.monthly_trend.map((item, index) => {
          const heightPercent = (item.amount / maxAmount) * 100;
          const isLast = index === data.monthly_trend.length - 1;
          
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full relative flex items-end h-24">
                <div 
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isLast 
                      ? "bg-[var(--color-primary)]" 
                      : "bg-[var(--color-primary)]/20 group-hover:bg-[var(--color-primary)]/40"
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${isLast ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"}`}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
