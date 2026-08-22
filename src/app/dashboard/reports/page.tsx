// src/app/dashboard/reports/page.tsx
"use client";

import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
            <BarChart3 size={20} />
          </div>
          <span>Reports</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
          Business intelligence, revenue analytics, and operational insights.
        </p>
      </div>

      <div className="p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] animate-in fade-in duration-300">
        <BarChart3 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Reports & Analytics Hub</h3>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
          Revenue dashboards, vehicle utilization reports, client retention metrics, and operational KPIs coming soon.
        </p>
      </div>
    </div>
  );
}
