// src/components/ui/QuickGarageModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Car, Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal"; // Assuming you have this generic modal wrapper
import type { Vehicle } from "@/lib/types";

interface QuickGarageModalProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: { current_mileage: number; next_service_km?: number | null }) => Promise<void>;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function QuickGarageModal({ vehicle, open, onClose, onSave }: QuickGarageModalProps) {
  const [newMileage, setNewMileage] = useState<string>("");
  const [nextService, setNextService] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Reset form state when modal opens/closes or vehicle changes
  useEffect(() => {
    if (open && vehicle) {
      setNewMileage(vehicle.current_mileage.toString());
      setNextService(vehicle.next_service_km ? vehicle.next_service_km.toString() : "");
      setError("");
    } else {
      setNewMileage("");
      setNextService("");
      setError("");
    }
  }, [open, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    const mileageNum = parseInt(newMileage, 10);
    const serviceNum = nextService ? parseInt(nextService, 10) : undefined;

    // ✅ STRICT VALIDATION: Odometer must move forward
    if (isNaN(mileageNum) || mileageNum <= vehicle.current_mileage) {
      setError(`New mileage (${mileageNum.toLocaleString()} KM) must be strictly greater than current mileage (${vehicle.current_mileage.toLocaleString()} KM).`);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await onSave({
        current_mileage: mileageNum,
        next_service_km: serviceNum ?? null,
      });
    } catch (err) {
      // Error is handled by the hook (toast), but we keep the modal open for retry
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick Garage Update"
      subtitle={vehicle ? `Updating ${vehicle.make} ${vehicle.model} (${vehicle.plate_number})` : ""}
      size="md"
    >
      {!vehicle ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle size={32} className="text-[var(--color-warning-text)] mb-3" />
          <p className="text-sm text-[var(--color-ink-muted)]">No vehicle selected.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <Wrench size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Awaiting Mileage Update</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                This vehicle is currently locked from new bookings. Enter the latest odometer reading to return it to the available fleet.
              </p>
            </div>
          </div>

          {/* Current Mileage Reference */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Current Recorded Mileage:</span>
            <span className="text-sm font-bold text-[var(--color-ink)] font-mono">
              {vehicle.current_mileage.toLocaleString()} KM
            </span>
          </div>

          {/* New Mileage Input */}
          <div>
            <label className={labelClass}>
              New Odometer Reading (KM) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="relative">
              <Car size={16} className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)]" />
              <input
                type="number"
                value={newMileage}
                onChange={(e) => setNewMileage(e.target.value)}
                className={`${inputClass} pl-10 font-mono`}
                placeholder="e.g., 45200"
                min={vehicle.current_mileage + 1}
                required
              />
            </div>
            {error && (
              <p className="mt-2 text-xs font-medium text-[var(--color-danger-text)] flex items-center gap-1.5">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>

          {/* Next Service Input (Optional) */}
          <div>
            <label className={labelClass}>Next Service Interval (KM) <span className="text-[var(--color-ink-subtle)] font-normal normal-case">(Optional)</span></label>
            <div className="relative">
              <CheckCircle2 size={16} className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)]" />
              <input
                type="number"
                value={nextService}
                onChange={(e) => setNextService(e.target.value)}
                className={`${inputClass} pl-10 font-mono`}
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
              {isLoading ? "Processing..." : "Update & Release to Fleet"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
