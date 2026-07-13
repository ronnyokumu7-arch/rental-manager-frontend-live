// src/components/ui/QuickGarageModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Wrench,
  Gauge,
  Car,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Activity,
  ArrowRight,
} from "lucide-react";
import type { Vehicle, VehicleUpdate } from "@/lib/types";

interface QuickGarageModalProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: VehicleUpdate) => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm font-medium";
const selectClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer";
const labelClass =
  "block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function QuickGarageModal({
  vehicle,
  open,
  onClose,
  onSave,
}: QuickGarageModalProps) {
  const [formData, setFormData] = useState({
    status: "available",
    current_mileage: 0,
    next_service_km: 0,
  });

  useEffect(() => {
    if (vehicle && open) {
      setFormData({
        status: vehicle.status,
        current_mileage: vehicle.current_mileage,
        next_service_km: vehicle.next_service_km || 0,
      });
    }
  }, [vehicle, open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  // Prevent auto-submit: Move focus on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.querySelectorAll("input, select"));
        const currentIndex = inputs.indexOf(e.currentTarget);
        if (currentIndex < inputs.length - 1) {
          (inputs[currentIndex + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    onSave({
      status: formData.status as Vehicle["status"],
      current_mileage: Number(formData.current_mileage),
      next_service_km: Number(formData.next_service_km),
    });
  };

  if (!vehicle || !open) return null;

  // Operational Intelligence Calculations
  const currentMileageNum = Number(formData.current_mileage) || 0;
  const kmToService = formData.next_service_km - currentMileageNum;
  const isOverdue = formData.next_service_km > 0 && kmToService <= 0;
  const isWarning = formData.next_service_km > 0 && kmToService > 0 && kmToService <= 1000;

  return (
    <>
      {/* ✅ SELF-CONTAINED BACKDROP */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* ✅ MODAL CONTENT - Centered, Wide Layout */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-3xl bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                <Wrench size={24} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-ink)] tracking-tight">
                  Quick Garage
                </h2>
                <p className="text-xs font-medium text-[var(--color-ink-muted)] mt-0.5">
                  Update vehicle telemetry and operational status
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
              
              {/* LEFT COLUMN: Vehicle Identity & Status (Span 5) */}
              <div className="md:col-span-5 space-y-6">
                {/* Vehicle Identity Badge */}
                <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink)] shadow-sm">
                      <Car size={28} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[var(--color-ink)]">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <span className="text-xs font-mono font-semibold text-[var(--color-ink-muted)] mt-1.5 inline-block px-2 py-0.5 rounded border border-[var(--color-surface-border)] bg-[var(--color-surface)]">
                        {vehicle.plate_number}
                      </span>
                    </div>
                  </div>
                  
                  {/* ✅ LIVE ODOMETER PREVIEW: Updates instantly as user types */}
                  <div className="pt-4 border-t border-[var(--color-surface-border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
                      Live Odometer Reading
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-ink)] font-mono tracking-tight">
                      {currentMileageNum.toLocaleString()}{" "}
                      <span className="text-sm font-medium text-[var(--color-ink-muted)]">KM</span>
                    </p>
                  </div>
                </div>

                {/* Operational Status Selector */}
                <div>
                  <label className={labelClass}>Operational Status</label>
                  <div className="relative group">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={`${selectClass} pr-10`}
                    >
                      <option value="available">Available (In Fleet)</option>
                      <option value="rented">Rented (On Trip)</option>
                      <option value="maintenance">Maintenance (In Shop)</option>
                      <option value="retired">Retired (Decommissioned)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink)] transition-colors">
                      <ArrowRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Telemetry & Health (Span 7) */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <label className={labelClass}>Service Telemetry</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 block">
                        Current Mileage
                      </label>
                      <div className="relative">
                        <Gauge className="absolute left-3 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                        <input
                          type="number"
                          value={formData.current_mileage || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, current_mileage: Number(e.target.value) })
                          }
                          min={0}
                          className={`${inputClass} pl-10 font-mono`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 block">
                        Next Service Target
                      </label>
                      <div className="relative">
                        <Activity className="absolute left-3 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                        <input
                          type="number"
                          value={formData.next_service_km || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, next_service_km: Number(e.target.value) })
                          }
                          min={0}
                          placeholder="e.g. 15000"
                          className={`${inputClass} pl-10 font-mono`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ LIVE MAINTENANCE TELEMETRY CARD */}
                {formData.next_service_km > 0 && (
                  <div
                    className={`p-5 rounded-2xl border transition-all duration-300 ${
                      isOverdue
                        ? "bg-[var(--color-danger-bg)]/40 border-[var(--color-danger)]/40"
                        : isWarning
                        ? "bg-[var(--color-warning-bg)]/40 border-[var(--color-warning)]/40"
                        : "bg-[var(--color-success-bg)]/40 border-[var(--color-success)]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isOverdue
                              ? "bg-[var(--color-danger)]/20 text-[var(--color-danger-text)]"
                              : isWarning
                              ? "bg-[var(--color-warning)]/20 text-[var(--color-warning-text)]"
                              : "bg-[var(--color-success)]/20 text-[var(--color-success-text)]"
                          }`}
                        >
                          {isOverdue ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isOverdue
                                ? "text-[var(--color-danger-text)]"
                                : isWarning
                                ? "text-[var(--color-warning-text)]"
                                : "text-[var(--color-success-text)]"
                            }`}
                          >
                            {isOverdue
                              ? "Service Overdue"
                              : isWarning
                              ? "Service Due Soon"
                              : "Health Optimal"}
                          </p>
                          <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
                            {isOverdue
                              ? "Immediate attention required"
                              : "Vehicle is within safe operating limits"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold font-mono tracking-tight ${
                            isOverdue
                              ? "text-[var(--color-danger-text)]"
                              : isWarning
                              ? "text-[var(--color-warning-text)]"
                              : "text-[var(--color-success-text)]"
                          }`}
                        >
                          {isOverdue
                            ? `-${Math.abs(kmToService).toLocaleString()}`
                            : kmToService.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                          KM to Service
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions - Full Width Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-surface-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <Check size={16} /> Save Telemetry
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
