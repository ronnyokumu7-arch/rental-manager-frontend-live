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
import Modal from "@/components/ui/Modal";

interface QuickGarageModalProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: VehicleUpdate) => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm font-medium";
const selectClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm font-medium appearance-none";
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

  if (!vehicle) return null;

  // Operational Intelligence Calculations
  const kmToService = formData.next_service_km - formData.current_mileage;
  const isOverdue = formData.next_service_km > 0 && kmToService <= 0;
  const isWarning = formData.next_service_km > 0 && kmToService > 0 && kmToService <= 1000;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 sm:p-8 space-y-6 max-w-lg w-full mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-surface-border)] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shadow-sm">
              <Wrench size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-ink)] tracking-tight">
                Quick Garage
              </h2>
              <p className="text-xs font-medium text-[var(--color-ink-muted)] mt-0.5">
                Service Telemetry & Fleet Health
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Vehicle Identity Badge */}
          <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)]">
                <Car size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {vehicle.make} {vehicle.model}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[var(--color-surface)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                    {vehicle.plate_number}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] block">
                Current Odometer
              </span>
              <span className="text-sm font-bold text-[var(--color-ink)] font-mono">
                {formData.current_mileage.toLocaleString()} KM
              </span>
            </div>
          </div>

          {/* Operational Status Selector */}
          <div>
            <label className={labelClass}>Vehicle Status</label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={selectClass}
              >
                <option value="available">Available (In Fleet)</option>
                <option value="rented">Rented (On Trip)</option>
                <option value="maintenance">Maintenance (In Shop)</option>
                <option value="retired">Retired (Decommissioned)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-ink-subtle)]">
                <ArrowRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>

          {/* Telemetry Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Current Mileage (KM)</label>
              <div className="relative">
                <Gauge className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                <input
                  type="number"
                  value={formData.current_mileage || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, current_mileage: Number(e.target.value) })
                  }
                  min={0}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Next Service Target (KM)</label>
              <div className="relative">
                <Activity className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                <input
                  type="number"
                  value={formData.next_service_km || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, next_service_km: Number(e.target.value) })
                  }
                  min={0}
                  placeholder="e.g. 15000"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>

          {/* Live Maintenance Telemetry Card */}
          {formData.next_service_km > 0 && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isOverdue
                  ? "bg-[var(--color-danger-bg)] border-[var(--color-danger)]/30 text-[var(--color-danger-text)]"
                  : isWarning
                  ? "bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink)]"
                  : "bg-[var(--color-success-bg)] border-[var(--color-success-text)]/20 text-[var(--color-success-text)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOverdue ? (
                    <AlertTriangle size={16} className="text-[var(--color-danger)]" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isOverdue
                      ? "Service Overdue"
                      : isWarning
                      ? "Service Due Soon"
                      : "Health Optimal"}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold">
                  {isOverdue
                    ? `${Math.abs(kmToService).toLocaleString()} KM Overdue`
                    : `${kmToService.toLocaleString()} KM Remaining`}
                </span>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all"
            >
              <Check size={16} /> Save Telemetry
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
