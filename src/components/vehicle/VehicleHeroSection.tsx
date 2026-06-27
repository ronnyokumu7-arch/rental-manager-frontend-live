"use client";

import { Car, Banknote, CalendarDays, TrendingUp } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import Badge from "@/components/ui/Badge";

const statusColors: Record<string, "success" | "accent" | "warning" | "neutral"> = {
  available: "success", rented: "accent", maintenance: "warning", retired: "neutral"
};

interface VehicleHeroProps {
  vehicle: Vehicle;
  stats: { totalRevenue: number; totalDaysBooked: number; utilizationRate: number };
}

export default function VehicleHeroSection({ vehicle, stats }: VehicleHeroProps) {
  const formatKES = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Vehicle Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Car size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {vehicle.make} {vehicle.model}
              <Badge variant={statusColors[vehicle.status]} className="text-xs">{vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}</Badge>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="font-medium text-gray-700">{vehicle.plate_number}</span>
              <span>•</span>
              <span>{vehicle.year}</span>
              <span>•</span>
              <span className="text-gray-400">VIN: {vehicle.vin || "N/A"}</span>
            </p>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
            <Banknote size={18} className="text-emerald-600 mb-1" />
            <p className="text-[10px] uppercase text-emerald-700 font-semibold tracking-wide">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900">{formatKES(stats.totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
            <CalendarDays size={18} className="text-blue-600 mb-1" />
            <p className="text-[10px] uppercase text-blue-700 font-semibold tracking-wide">Days Booked</p>
            <p className="text-lg font-bold text-gray-900">{stats.totalDaysBooked}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
            <TrendingUp size={18} className="text-amber-600 mb-1" />
            <p className="text-[10px] uppercase text-amber-700 font-semibold tracking-wide">Utilization</p>
            <p className="text-lg font-bold text-gray-900">{Math.min(100, Math.round(stats.utilizationRate))}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}