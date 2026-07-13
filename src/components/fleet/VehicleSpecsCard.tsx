// src/components/fleet/VehicleSpecsCard.tsx
"use client";

import { Gauge, DollarSign, Shield, Calendar, Activity } from "lucide-react";
import type { Vehicle, VehicleUpdate } from "@/lib/types";

interface VehicleSpecsCardProps {
  vehicle: Vehicle;
  isEditing: boolean;
  onSave: (data: VehicleUpdate) => void;
  actionLoading: string | null;
}

const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block";
const valueClass = "text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2";
const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-mono";

export default function VehicleSpecsCard({ vehicle, isEditing, onSave, actionLoading }: VehicleSpecsCardProps) {
  const isInsuranceExpired = vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry) < new Date() : false;

  if (isEditing) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-6">
        <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
          <Activity size={16} className="text-[var(--color-primary)]" /> Edit Telemetry & Compliance
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ current_mileage: vehicle.current_mileage, next_service_km: vehicle.next_service_km, insurance_expiry: vehicle.insurance_expiry }); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Current Mileage (KM)</label>
            <input type="number" defaultValue={vehicle.current_mileage} onChange={(e) => {/* handle local state in real app */}} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Next Service Target (KM)</label>
            <input type="number" defaultValue={vehicle.next_service_km || ""} className={`${inputClass} placeholder-[var(--color-ink-subtle)]`} placeholder="e.g., 15000" />
          </div>
          <div>
            <label className={labelClass}>Insurance Policy Number</label>
            <input type="text" defaultValue={vehicle.insurance_number || ""} className={inputClass.replace("font-mono", "")} placeholder="Policy ID" />
          </div>
          <div>
            <label className={labelClass}>Insurance Expiry Date</label>
            <input type="date" defaultValue={vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toISOString().split('T')[0] : ""} className={inputClass.replace("font-mono", "")} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button type="button" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={actionLoading === "update"} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 disabled:opacity-50">
              {actionLoading === "update" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 mb-6">
        <Activity size={16} className="text-[var(--color-primary)]" /> Telemetry & Compliance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Current Mileage</label>
            <p className={valueClass}><Gauge size={14} className="text-[var(--color-ink-subtle)]" /> {vehicle.current_mileage.toLocaleString()} KM</p>
          </div>
          <div>
            <label className={labelClass}>Next Service Target</label>
            <p className={valueClass}><Activity size={14} className="text-[var(--color-ink-subtle)]" /> {vehicle.next_service_km ? `${vehicle.next_service_km.toLocaleString()} KM` : "Not set"}</p>
          </div>
          <div>
            <label className={labelClass}>Daily Rental Rate</label>
            <p className={valueClass}><DollarSign size={14} className="text-[var(--color-ink-subtle)]" /> KES {Number(vehicle.daily_rate).toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Insurance Policy</label>
            <p className={valueClass}><Shield size={14} className="text-[var(--color-ink-subtle)]" /> {vehicle.insurance_number || "Not provided"}</p>
          </div>
          <div>
            <label className={labelClass}>Insurance Expiry</label>
            <p className={`text-sm font-semibold flex items-center gap-2 ${isInsuranceExpired ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--color-ink)]'}`}>
              <Calendar size={14} className={isInsuranceExpired ? 'text-rose-500' : 'text-[var(--color-ink-subtle)]'} /> 
              {vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString() : "Not set"}
              {isInsuranceExpired && <span className="text-[10px] font-bold uppercase bg-rose-500/10 px-1.5 py-0.5 rounded text-rose-600 dark:text-rose-400">Expired</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
