"use client";
import { Calendar, TrendingUp } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { ClientStats } from "@/hooks/useClientProfile";

interface ClientStatsCardProps {
  stats: ClientStats;
}

export default function ClientStatsCard({ stats }: ClientStatsCardProps) {
  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* Header: Matches ClientStatusCard exactly */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            {/* ✅ Replaced DollarSign with TrendingUp (the inverted Z growth icon) */}
            <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Client Overview
          </h3>
        </div>
      </div>

      {/* Body: Matches ClientStatusCard row layout */}
      <div className="px-5 py-4 space-y-3">
        {/* Total Bookings Row */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
              <Calendar size={16} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">
                Total Bookings
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {stats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue Row */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
              <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">
                Total Revenue
              </p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {stats.currencyCode} {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
