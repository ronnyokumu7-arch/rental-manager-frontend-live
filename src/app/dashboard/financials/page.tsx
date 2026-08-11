"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Receipt,
  DollarSign,
  LayoutDashboard,
} from "lucide-react";

import InvoicesTab from "@/components/financials/InvoicesTab";
import ContractsTab from "@/components/financials/ContractsTab";
import PaymentsTab from "@/components/financials/PaymentsTab";
import OverviewTab from "@/components/financials/OverviewTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "payments", label: "Payments", icon: DollarSign },
];

export default function FinancialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Synchronize state if query param changes directly
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard/financials?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header & Tab Switcher (Unified with Clients page header design) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
              <DollarSign size={20} />
            </div>
            <span>Financials</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            Manage contracts, invoices, and payments in one place
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm self-start sm:self-auto overflow-x-auto max-w-full custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Breakdown Counter Bar (Restored from Clients design, hidden on mobile to eliminate void space) */}
      <div className="hidden sm:flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            Total Records
          </span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">
            Financials
          </span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            Active Contracts
          </span>
          <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">
            Contracts
          </span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            Pending Invoices
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            Invoices
          </span>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="animate-in fade-in duration-150 min-h-[400px]">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "contracts" && <ContractsTab />}
        {activeTab === "payments" && <PaymentsTab />}
      </div>
    </div>
  );
}
