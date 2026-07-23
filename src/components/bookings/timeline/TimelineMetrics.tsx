// src/components/bookings/timeline/TimelineMetrics.tsx
"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Booking, Vehicle } from "@/lib/types";

interface TimelineMetricsProps {
  vehicles: Vehicle[];
  bookings: Booking[];
}

export default function TimelineMetrics({ vehicles, bookings }: TimelineMetricsProps) {
  const stats = useMemo(() => {
    const total = vehicles.length;
    let rentedNow = 0;
    const todayStr = format(new Date(), "yyyy-MM-dd");

    bookings.forEach((b) => {
      const start = format(new Date(b.start_date || (b as any).startDate), "yyyy-MM-dd");
      const end = format(new Date(b.end_date || (b as any).endDate), "yyyy-MM-dd");
      if (todayStr >= start && todayStr <= end && b.status === "active") {
        rentedNow++;
      }
    });

    return {
      total,
      rented: rentedNow,
      available: Math.max(0, total - rentedNow),
      utilizationRate: total > 0 ? Math.round((rentedNow / total) * 100) : 0
    };
  }, [vehicles, bookings]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">Active Capacity</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">{stats.total}</span>
          <span className="text-xs font-semibold text-[var(--color-ink-subtle)]">Registered Units</span>
        </div>
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">With Bookings</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.rented}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10">Leased Fleet</span>
        </div>
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Available Base</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">{stats.available}</span>
          <span className="text-xs font-semibold text-[var(--color-ink-subtle)]">Unassigned</span>
        </div>
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">Utilization Rate</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">{stats.utilizationRate}%</span>
          <div className="w-full bg-[var(--color-surface-hover)] h-1.5 rounded-full overflow-hidden mt-1 max-w-[100px] border border-[var(--color-surface-border)]">
            <div style={{ width: `${stats.utilizationRate}%` }} className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
