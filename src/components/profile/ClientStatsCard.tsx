// src/components/profile/ClientStatsCard.tsx
"use client";

import { Calendar, TrendingUp } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { ClientStats } from "@/hooks/useClientProfile";

interface ClientStatsCardProps {
  stats: ClientStats;
}

export default function ClientStatsCard({ stats }: ClientStatsCardProps) {
  // ✅ BRAND TOKENS: Consistent with all profile components
  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1 block";
  const valueClass = "text-sm font-semibold text-[var(--color-ink)]";
  const rowClass = "flex items-center justify-between py-4 border-b border-[var(--color-surface-border)] last:border-b-0";

  return (
    <SectionCard className="!p-0 overflow-hidden">
      
      {/* Unified Header */}
      <div className="flex items-center gap-3 p-6 pb-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
          <TrendingUp size={18} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Client Overview</h3>
          <p className="text-[11px] text-[var(--color-ink-muted)]">Lifetime engagement and revenue metrics</p>
        </div>
      </div>

      {/* Dense Data Rows */}
      <div className="px-6 divide-y divide-[var(--color-surface-border)]">
        
        {/* Total Bookings Row */}
        <div className={rowClass}>
          <div>
            <p className={labelClass}>Total Bookings</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar size={14} className="text-[var(--color-ink-subtle)]" />
              <p className="text-lg font-bold text-[var(--color-ink)]">
                {stats.totalBookings.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Context Badge */}
          <div className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Lifetime
          </div>
        </div>

        {/* Total Revenue Row */}
        <div className={`${rowClass} border-b-0`}>
          <div>
            <p className={labelClass}>Total Revenue</p>
            <div className="flex items-center gap-2 mt-0.5">
              <TrendingUp size={14} className="text-emerald-500" />
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {stats.currencyCode} {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Context Badge */}
          <div className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">
            Gross
          </div>
        </div>

      </div>
    </SectionCard>
  );
}
