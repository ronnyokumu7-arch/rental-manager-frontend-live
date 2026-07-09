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
  BarChart3,
  LayoutDashboard,
  Plus,
  Download,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";

// ✅ Import the modular tab components
import InvoicesTab from "@/components/financials/InvoicesTab";
import ContractsTab from "@/components/financials/ContractsTab";
import PaymentsTab from "@/components/financials/PaymentsTab";

// ✅ FIXED: Removed all trailing spaces from tab IDs and labels
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "payments", label: "Payments", icon: DollarSign },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export default function FinancialsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Unified Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Financials
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage contracts, invoices, and payments in one place
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Persistent Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="KES 128.5K"
          subtitle="This month"
          icon={TrendingUp}
          variant="success"
          trend={{ value: "12.5%", isPositive: true }}
        />
        <StatCard
          title="Pending Payments"
          value="KES 45.2K"
          subtitle="5 invoices"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Overdue Invoices"
          value="5"
          subtitle="Requires action"
          icon={AlertCircle}
          variant="danger"
        />
        <StatCard
          title="Active Contracts"
          value="12"
          subtitle="+2 this month"
          icon={FileText}
          variant="accent"
          trend={{ value: "2", isPositive: true }}
        />
      </div>

      {/* Tab Content Area */}
      <div className="animate-in fade-in duration-300">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Recent Invoices
                  </h3>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { id: "T1-001", client: "John Doe", amount: "KES 15,000", status: "paid", date: "Oct 24" },
                    { id: "T1-002", client: "Jane Smith", amount: "KES 8,500", status: "pending", date: "Oct 23" },
                    { id: "T1-003", client: "Acme Corp", amount: "KES 45,000", status: "overdue", date: "Oct 20" },
                  ].map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{inv.id}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{inv.client} • {inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {inv.amount}
                        </p>
                        <Badge
                          variant={
                            inv.status === "paid"
                              ? "success"
                              : inv.status === "pending"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
            <div className="space-y-6">
              <SectionCard>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm">
                      <Plus size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Create Invoice</p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">Bill a client instantly</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-600 shadow-sm">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Record Payment</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Log offline transactions</p>
                    </div>
                  </button>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ✅ TAB 2: INVOICES (PLUGGED IN) */}
        {activeTab === "invoices" && <InvoicesTab />}

        {/* ✅ TAB 3: CONTRACTS (PLUGGED IN) */}
        {activeTab === "contracts" && <ContractsTab />}

        {/* ✅ TAB 4: PAYMENTS (PLUGGED IN) */}
        {activeTab === "payments" && <PaymentsTab />}

        {/* TAB 5: REPORTS (Placeholder) */}
        {activeTab === "reports" && (
          <SectionCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Financial Analytics
              </h3>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Download size={14} /> Export Report
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <BarChart3 size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                Reports & Analytics Module
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Revenue charts, fleet utilization metrics, and client retention reports will be mounted here.
              </p>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
