// src/components/fleet/VehicleHeader.tsx
"use client";

import { Car, Pencil, Save, X, Archive, AlertTriangle, CheckCircle, RotateCcw, Flag, RotateCw } from "lucide-react";
import type { Vehicle } from "@/lib/types";

interface VehicleHeaderProps {
  vehicle: Vehicle;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  actionLoading: string | null;
  // ✅ Added "restore" to the allowed actions
  onAction: (action: "activate" | "maintenance" | "reactivate" | "retire" | "archive" | "restore") => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending_activation: { label: "Pending Activation", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
  available: { label: "Available", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
  rented: { label: "Rented", color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]/5", border: "border-[var(--color-primary)]/20" },
  awaiting_mileage: { label: "Awaiting Mileage", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
  maintenance: { label: "In Maintenance", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
  retired: { label: "Retired", color: "text-[var(--color-ink-muted)]", bg: "bg-[var(--color-surface-hover)]", border: "border-[var(--color-surface-border)]" },
  archived: { label: "Archived", color: "text-[var(--color-ink-muted)]", bg: "bg-[var(--color-surface-hover)]", border: "border-[var(--color-surface-border)]" }, // ✅ Added
};

export default function VehicleHeader({ vehicle, isEditing, setIsEditing, actionLoading, onAction }: VehicleHeaderProps) {
  // ✅ Check is_archived FIRST to override any underlying status
  const isArchived = vehicle.is_archived;
  const config = isArchived ? statusConfig.archived : (statusConfig[vehicle.status] || statusConfig.available);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Identity */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            <Car size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--color-ink-muted)]">
              <span className="font-mono font-semibold text-[var(--color-ink)] bg-[var(--color-surface-hover)] px-2 py-0.5 rounded border border-[var(--color-surface-border)]">
                {vehicle.plate_number}
              </span>
              <span>{vehicle.year}</span>
              {vehicle.vin && <span className="hidden sm:inline">• VIN: {vehicle.vin}</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95"
              >
                <X size={18} />
              </button>
              <button 
                form="vehicle-edit-form" 
                type="submit" 
                disabled={actionLoading === "update"}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading === "update" ? <span className="animate-spin">⟳</span> : <Save size={16} />} Save Changes
              </button>
            </>
          ) : (
            <>
              {/* ✅ ARCHIVED STATE: Only show Restore button */}
              {isArchived ? (
                <button 
                  onClick={() => onAction("restore")} 
                  disabled={!!actionLoading} 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading === "restore" ? <span className="animate-spin">⟳</span> : <RotateCw size={16} />} Restore to Fleet
                </button>
              ) : (
                /* ✅ ACTIVE STATE: Show normal lifecycle buttons */
                <>
                  <button onClick={() => setIsEditing(true)} className="p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all active:scale-95" title="Edit Details">
                    <Pencil size={18} />
                  </button>
                  
                  {vehicle.status === "pending_activation" && (
                    <button onClick={() => onAction("activate")} disabled={!!actionLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
                      {actionLoading === "activate" ? <span className="animate-spin">⟳</span> : <CheckCircle size={16} />} Activate
                    </button>
                  )}
                  {vehicle.status === "available" && (
                    <button onClick={() => onAction("maintenance")} disabled={!!actionLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 transition-all active:scale-95 disabled:opacity-50">
                      <AlertTriangle size={16} /> Maintenance
                    </button>
                  )}
                  {vehicle.status === "maintenance" && (
                    <button onClick={() => onAction("reactivate")} disabled={!!actionLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
                      {actionLoading === "reactivate" ? <span className="animate-spin">⟳</span> : <RotateCcw size={16} />} Reactivate
                    </button>
                  )}
                  {vehicle.status !== "retired" && vehicle.status !== "pending_activation" && (
                    <button onClick={() => onAction("retire")} disabled={!!actionLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink-muted)] hover:text-rose-500 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/20 transition-all active:scale-95 disabled:opacity-50">
                      <Flag size={16} /> Retire
                    </button>
                  )}
                  <button onClick={() => onAction("archive")} disabled={!!actionLoading} className="p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95" title="Archive">
                    <Archive size={18} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
