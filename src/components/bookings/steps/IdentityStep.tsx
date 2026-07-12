// src/components/bookings/steps/IdentityStep.tsx
"use client";

import { User, Car } from "lucide-react";

interface IdentityStepProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

// Design System Constants (Shared across steps)
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function IdentityStep({ formData, updateField }: IdentityStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-[var(--color-ink)]">Booking Identity</h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-2">Select the client and vehicle for this rental.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Client Select */}
        <div className="md:col-span-2">
          <label className={labelClass}>Client <span className="text-[var(--color-danger)]">*</span></label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
            <select 
              value={formData.client_id} 
              onChange={(e) => updateField("client_id", e.target.value)}
              className={`${inputClass} pl-11 appearance-none`}
            >
              <option value="">Select a client...</option>
              {/* Map your clients here */}
            </select>
          </div>
        </div>

        {/* Vehicle Select */}
        <div className="md:col-span-2">
          <label className={labelClass}>Vehicle <span className="text-[var(--color-danger)]">*</span></label>
          <div className="relative">
            <Car className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
            <select 
              value={formData.vehicle_id} 
              onChange={(e) => updateField("vehicle_id", e.target.value)}
              className={`${inputClass} pl-11 appearance-none`}
            >
              <option value="">Select a vehicle...</option>
              {/* Map your vehicles here */}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
