"use client";

import { FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Main Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-[var(--color-primary)]" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-3">
            Reports & Analytics
          </h1>

          {/* Description */}
          <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto mb-8 leading-relaxed">
            Comprehensive reporting dashboards with revenue analytics, fleet utilization metrics, 
            booking trends, and financial performance insights are currently under development.
          </p>

          {/* Feature Preview List */}
          <div className="bg-[var(--color-surface-hover)]/50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4">
              Coming Soon
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                <span className="text-sm text-[var(--color-ink)]">
                  Revenue reports with monthly/quarterly breakdowns
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                <span className="text-sm text-[var(--color-ink)]">
                  Fleet utilization and maintenance cost analysis
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                <span className="text-sm text-[var(--color-ink)]">
                  Client booking frequency and retention metrics
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                <span className="text-sm text-[var(--color-ink)]">
                  Exportable PDF and CSV reports for accounting
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
