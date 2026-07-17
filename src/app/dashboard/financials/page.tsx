// src/app/dashboard/financials/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  LayoutDashboard,
  Plus,
} from "lucide-react";

// ✅ Import the modular tab components
import InvoicesTab from "@/components/financials/InvoicesTab";
import ContractsTab from "@/components/financials/ContractsTab";
import PaymentsTab from "@/components/financials/PaymentsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "payments", label: "Payments", icon: DollarSign },
];

export default function FinancialsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for Overview tab
  const recentInvoices = [
    { id: "INV-2401", client: "John Doe", amount: "KES 15,000", status: "paid", date: "Oct 24" },
    { id: "INV-2402", client: "Jane Smith", amount: "KES 8,500", status: "pending", date: "Oct 23" },
    { id: "INV-2403", client: "Acme Corp", amount: "KES 45,000", status: "overdue", date: "Oct 20" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Premium Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <DollarSign size={20} />
            </div>
            Financials
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Manage contracts, invoices, and payments in one place
          </p>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="animate-in fade-in duration-300">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <>
            {/* Stat Cards - Now ONLY visible on the Overview tab */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Revenue */}
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Total Revenue</p>
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success-text)]">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">KES 128.5K</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--color-success-text)] font-semibold">+12.5%</span>
                  <span className="text-xs text-[var(--color-ink-muted)]">This month</span>
                </div>
              </div>

              {/* Pending Payments */}
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Pending Payments</p>
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-warning-bg)] flex items-center justify-center text-[var(--color-warning-text)]">
                    <Clock size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">KES 45.2K</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">5 invoices awaiting clearance</p>
              </div>

              {/* Overdue Invoices */}
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Overdue Invoices</p>
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-danger-bg)] flex items-center justify-center text-[var(--color-danger-text)]">
                    <AlertCircle size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">5</p>
                <p className="text-xs text-[var(--color-danger-text)] font-semibold mt-1">Requires immediate action</p>
              </div>

              {/* Active Contracts */}
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Active Contracts</p>
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-muted)] flex items-center justify-center text-[var(--color-primary-text)]">
                    <FileText size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">12</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--color-success-text)] font-semibold">+2</span>
                  <span className="text-xs text-[var(--color-ink-muted)]">Added this month</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Invoices List */}
              <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
                <div className="p-5 border-b border-[var(--color-surface-border)] flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Recent Invoices</h3>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
                  >
                    View all
                  </button>
                </div>
                <div className="divide-y divide-[var(--color-surface-border)]">
                  {recentInvoices.map((inv) => {
                    let statusStyle = "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
                    if (inv.status === "pending") statusStyle = "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
                    if (inv.status === "overdue") statusStyle = "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]";

                    return (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)]">
                            <Receipt size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--color-ink)]">{inv.id}</p>
                            <p className="text-xs text-[var(--color-ink-muted)]">{inv.client} • {inv.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                            {inv.amount}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden p-5 h-fit">
                <h3 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab("invoices")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/10 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                      <Plus size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">Create Invoice</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">Bill a client instantly</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab("payments")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-success-bg)]/30 border border-[var(--color-success-bg)] hover:bg-[var(--color-success-bg)]/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-success-text)] shadow-sm">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">Record Payment</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">Log offline transactions</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: INVOICES */}
        {activeTab === "invoices" && <InvoicesTab />}

        {/* TAB 3: CONTRACTS */}
        {activeTab === "contracts" && <ContractsTab />}

        {/* TAB 4: PAYMENTS */}
        {activeTab === "payments" && <PaymentsTab />}
      </div>
    </div>
  );
}
