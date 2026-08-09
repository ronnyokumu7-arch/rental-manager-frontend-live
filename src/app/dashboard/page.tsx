// src/app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Activity, BarChart3,
  Car, Users, TrendingUp, Clock, CheckCircle2, Wrench, Plus
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import ActionCenterWidget from "@/components/dashboard/ActionCenterWidget";
import FleetCalendar from "@/components/calendar/FleetCalendar";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Bookings Calendar", icon: Activity },
  { id: "reports", label: "Analytics", icon: BarChart3 },
];

/* ────────────────────────────────────────────────────────────
   ✅ PREMIUM CHROME-LESS STAT TILE
   No card box, no sub-text — just tinted icon chip + value + label.
   The icon chip provides structure; whitespace does the rest.
   ──────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-3 lg:gap-4">
      <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xl lg:text-2xl font-extrabold tracking-tight text-[var(--color-ink)] tabular-nums truncate">
          {value}
        </p>
        <p className="text-[10px] lg:text-[11px] font-bold sentencecase tracking-wider text-[var(--color-ink-muted)] truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, stats, alerts, vehicles } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      
      {/* Premium Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <LayoutDashboard size={20} />
            </div>
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Real-time overview of your rental business
          </p>
        </div>

        {/* ✅ MOBILE: Tab switcher hidden on phones (Overview is the mobile default) */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
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

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* ✅ PREMIUM: chrome-less 2×2 stat grid on phones, 4-up strip on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              label="Active Bookings"
              value={String(stats.activeBookings)}
              icon={LayoutDashboard}
              iconClass="bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]"
            />
            <StatCard
              label="Fleet Size"
              value={String(stats.fleetSize)}
              icon={Car}
              iconClass="bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
            />
            <StatCard
              label="Total Clients"
              value={String(stats.totalClients)}
              icon={Users}
              iconClass="bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
            />
            <StatCard
              label="Revenue This Month"
              value={`KES ${stats.mtdRevenue.toLocaleString()}`}
              icon={TrendingUp}
              iconClass="bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column (2/3): Action Center Widget */}
            <div className="lg:col-span-2 min-w-0">
              <ActionCenterWidget />
            </div>

            {/* Right Column: Fleet Health & Alerts (stacked, full-size) */}
            <div className="space-y-6 min-w-0">
              
<div className="flex items-center justify-between mb-4">
  <div>
    <p className="text-[11px] font-bold text-[var(--color-ink-muted)] sentencecase tracking-wider">Fleet Status</p>
    {/* ✅ NEW: live operational summary (all vehicles not in maintenance) */}
    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
      {vehicles.filter((v) => v.status !== "maintenance").length}/{vehicles.length} vehicles operational
    </p>
  </div>
  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-bg)]">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
    </span>
    <span className="text-[10px] font-bold text-[var(--color-success-text)] sentencecase tracking-wide">Live</span>
  </div>
</div>

              {/* Needs Attention Card */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-[var(--color-ink-muted)] sentencecase tracking-wider">Needs Attention</p>
                  {(alerts.vehiclesDueService + alerts.overdueReturns) > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-danger-bg)] text-[10px] font-bold text-[var(--color-danger-text)] border border-[var(--color-danger-bg)]">
                      {alerts.vehiclesDueService + alerts.overdueReturns} Alerts
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  {alerts.vehiclesDueService > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-warning-bg)]/30 border border-[var(--color-warning-bg)]">
                      <div className="flex items-center gap-3">
                        <Wrench size={16} className="text-[var(--color-warning-text)]" />
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-warning-text)]">{alerts.vehiclesDueService} due service</p>
                          <p className="text-[10px] text-[var(--color-ink-muted)]">Within 1,000 km</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.overdueReturns > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-danger-bg)]/30 border border-[var(--color-danger-bg)]">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-[var(--color-danger-text)]" />
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-danger-text)]">{alerts.overdueReturns} overdue</p>
                          <p className="text-[10px] text-[var(--color-ink-muted)]">Past end date</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.vehiclesDueService === 0 && alerts.overdueReturns === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle2 size={24} className="text-[var(--color-success-text)] mb-2" />
                      <p className="text-xs font-medium text-[var(--color-ink-muted)]">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACTIVITY & BOOKINGS ── */}
      {activeTab === "activity" && (
        <div className="animate-in fade-in duration-300">
          <FleetCalendar />
        </div>
      )}

      {/* ── TAB 3: REPORTS ── */}
      {activeTab === "reports" && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-muted)] flex items-center justify-center mb-4">
              <BarChart3 size={32} className="text-[var(--color-primary-text)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
              Reports & Analytics
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              Deep dive into your revenue, fleet utilization, and client retention metrics. This module is currently under development.
            </p>
          </div>
        </div>
      )}

      {/* 🚀 PREMIUM FLOATING ACTION BUTTON */}
      <button
        onClick={() => router.push("/dashboard/bookings/new")}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 lg:bottom-8 lg:right-8 z-50 group flex items-center justify-center w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 ease-out"
        title="Create New Booking"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[var(--color-surface-border)]">
          New Booking
        </span>
      </button>

    </div>
  );
}
