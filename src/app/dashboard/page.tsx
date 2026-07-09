"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Activity, BarChart3,
  Car, Users, TrendingUp, Clock, CheckCircle2, Wrench
} from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard";
import StatCard from "@/components/ui/StatCard";
import SectionCard from "@/components/ui/SectionCard";
import ActionCenterWidget from "@/components/dashboard/ActionCenterWidget";

// ✅ UPDATED: Removed the Calendar tab
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Activity & Bookings", icon: Activity },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { loading, stats, alerts, vehicles } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─ Unified Header with Title & Tabs ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your rental operations at a glance</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
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

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Premium Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Bookings" value={stats.activeBookings} subtitle="Currently ongoing" icon={LayoutDashboard} variant="accent" />
            <StatCard title="Fleet Size" value={stats.fleetSize} subtitle="Total vehicles" icon={Car} variant="default" />
            <StatCard title="Total Clients" value={stats.totalClients} subtitle="Registered users" icon={Users} variant="success" />
            <StatCard title="Revenue (MTD)" value={`KES ${stats.mtdRevenue.toLocaleString()}`} subtitle="This month" icon={TrendingUp} variant="warning" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column (2/3): The New Action Center Widget */}
            <div className="lg:col-span-2">
              <ActionCenterWidget />
            </div>

            {/* Right Column (1/3): Fleet Health & Alerts */}
            <div className="space-y-6">
              {/* 1. Fleet Health (Top) */}
              <div className="relative group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fleet Health</p>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Live</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Available</span>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {vehicles.filter((v) => v.status === "available").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Rented</span>
                    </div>
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {vehicles.filter((v) => v.status === "rented").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Maintenance</span>
                    </div>
                    <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                      {vehicles.filter((v) => v.status === "maintenance").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Needs Attention (Bottom) */}
              <div className="relative group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Needs Attention</p>
                  {(alerts.vehiclesDueService + alerts.overdueReturns) > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/20 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50">
                      {alerts.vehiclesDueService + alerts.overdueReturns} Alerts
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  {alerts.vehiclesDueService > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                      <div className="flex items-center gap-3">
                        <Wrench size={16} className="text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">{alerts.vehiclesDueService} due service</p>
                          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Within 1,000 km</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.overdueReturns > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-rose-600 dark:text-rose-400" />
                        <div>
                          <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">{alerts.overdueReturns} overdue</p>
                          <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70">Past end date</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.vehiclesDueService === 0 && alerts.overdueReturns === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACTIVITY & BOOKINGS (Consolidated) ── */}
      {activeTab === "activity" && (
        <div className="animate-in fade-in duration-300">
          <SectionCard className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <Activity size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Activity, Bookings & Calendar
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              This unified tab will soon house your real-time activity feed, upcoming bookings list, and the interactive booking calendar.
            </p>
          </SectionCard>
        </div>
      )}

      {/* ── TAB 3: REPORTS (Placeholder) ── */}
      {activeTab === "reports" && (
        <div className="animate-in fade-in duration-300">
          <SectionCard className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
              <BarChart3 size={32} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Reports & Analytics
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Deep dive into your revenue, fleet utilization, and client retention metrics. This module is currently under development.
            </p>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
