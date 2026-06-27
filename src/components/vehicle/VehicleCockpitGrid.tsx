"use client";

import { Car, Wrench, FileText, Banknote, Coins } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";
import ServiceHealthBar from "@/components/ui/ServiceHealthBar";

export default function VehicleCockpitGrid({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Core Details */}
      <SectionCard className="!p-3 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center"><Car size={12} className="text-blue-600" /></div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Core Details</h3>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Make</p>
              <p className="text-xs font-bold text-gray-900">{vehicle.make}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Model</p>
              <p className="text-xs font-bold text-gray-900">{vehicle.model}</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase text-blue-600 font-bold mb-0.5">Daily Rate</p>
              <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                <Banknote size={14} className="text-blue-600" /> {Number(vehicle.daily_rate).toLocaleString()} <span className="text-xs text-gray-500 font-normal">KES</span>
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Maintenance */}
      <SectionCard className="!p-3 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center"><Wrench size={12} className="text-amber-600" /></div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Maintenance</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] uppercase text-gray-500 font-bold mb-1">Current Mileage</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
              <Coins size={14} className="text-gray-400" /> {vehicle.current_mileage.toLocaleString()} <span className="text-xs text-gray-500 font-normal">km</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] uppercase text-gray-500 font-bold mb-2">Next Service Health</p>
            <ServiceHealthBar current_mileage={vehicle.current_mileage} next_service_km={vehicle.next_service_km} />
          </div>
        </div>
      </SectionCard>

      {/* Documents & Notes */}
      <SectionCard className="!p-3 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center"><FileText size={12} className="text-emerald-600" /></div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Documents & Notes</h3>
        </div>
        <div className="space-y-2">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-medium">Insurance</span>
            <span className="text-[10px] text-gray-400">{vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString() : "Not set"}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-medium">Registration</span>
            <span className="text-[10px] text-gray-400">{vehicle.registration_doc ? "Uploaded" : "Not set"}</span>
          </div>
          {vehicle.notes && (
            <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-[9px] uppercase text-amber-700 font-bold mb-1">Notes</p>
              <p className="text-xs text-gray-700 leading-relaxed">{vehicle.notes}</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
