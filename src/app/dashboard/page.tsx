// src/app/dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  LayoutDashboard, Activity, BarChart3,
  Car, Users, TrendingUp, Clock, CheckCircle2, Wrench
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import ActionCenterWidget from "@/components/dashboard/ActionCenterWidget";
import FleetCalendar from "@/components/calendar/FleetCalendar";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Bookings Calendar", icon: Activity },
  { id: "reports", label: "Analytics", icon: BarChart3 },
];

export default function DashboardPage() {
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
    <div className="space-y-6">
      
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
            Your rental operations at a glance
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

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Premium Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Bookings */}
            <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Active Bookings</p>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-muted)] flex items-center justify-center text-[var(--color-primary-text)]">
                  <LayoutDashboard size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)]">{stats.activeBookings}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">Currently ongoing</p>
            </div>

            {/* Fleet Size */}
            <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Fleet Size</p>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-ink-muted)]">
                  <Car size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)]">{stats.fleetSize}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">Total vehicles</p>
            </div>

            {/* Total Clients */}
            <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Total Clients</p>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success-text)]">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)]">{stats.totalClients}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">Registered users</p>
            </div>

            {/* Revenue (MTD) */}
            <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Revenue (MTD)</p>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-warning-bg)] flex items-center justify-center text-[var(--color-warning-text)]">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)]">KES {stats.mtdRevenue.toLocaleString()}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">This month</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column (2/3): Action Center Widget */}
            <div className="lg:col-span-2">
              <ActionCenterWidget />
            </div>

            {/* Right Column (1/3): Fleet Health & Alerts */}
            <div className="space-y-6">
              
              {/* Fleet Health Card */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Fleet Health</p>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-bg)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-success-text)] uppercase tracking-wide">Live</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                      <span className="text-xs font-semibold text-[var(--color-ink)]">Available</span>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--color-success-text)] tabular-nums">
                      {vehicles.filter((v) => v.status === "available").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                      <span className="text-xs font-semibold text-[var(--color-ink)]">Rented</span>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--color-primary-text)] tabular-nums">
                      {vehicles.filter((v) => v.status === "rented").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
                      <span className="text-xs font-semibold text-[var(--color-ink)]">Maintenance</span>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--color-warning-text)] tabular-nums">
                      {vehicles.filter((v) => v.status === "maintenance").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Needs Attention Card */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Needs Attention</p>
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
    </div>
  );
}
