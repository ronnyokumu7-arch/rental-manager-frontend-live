// src/components/bookings/BookingSummary.tsx
"use client";

import { User, Car, CalendarDays, DollarSign, Phone } from 'lucide-react';
import type { Client, Vehicle } from '@/lib/types';

interface BookingSummaryProps {
  client: Client | undefined;
  vehicle: Vehicle | undefined;
  startDate: string;
  endDate: string;
  totalAmount: number;
}

export default function BookingSummary({
  client,
  vehicle,
  startDate,
  endDate,
  totalAmount
}: BookingSummaryProps) {
  const getDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const days = getDays();

  return (
    <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">
        Booking Summary
      </div>
      
      {/* Client Info */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <User size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Client</span>
        </div>
        {client ? (
          <div>
            <div className="text-sm font-medium text-[var(--color-ink)] mb-1">{client.full_name}</div>
            <div className="flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
              <Phone size={10} />
              <span>{client.phone}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No client selected</div>
        )}
      </div>

      {/* Vehicle Info */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <Car size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Vehicle</span>
        </div>
        {vehicle ? (
          <div>
            <div className="text-sm font-medium text-[var(--color-ink)]">{vehicle.make} {vehicle.model}</div>
            <div className="text-xs text-[var(--color-ink-muted)] font-mono">{vehicle.plate_number}</div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No vehicle selected</div>
        )}
      </div>

      {/* Dates */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Period</span>
        </div>
        {startDate && endDate ? (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Start</span>
              <span className="font-medium text-[var(--color-ink)]">
                {new Date(startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">End</span>
              <span className="font-medium text-[var(--color-ink)]">
                {new Date(endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="pt-1 border-t border-[var(--color-surface-border)] flex justify-between items-center">
              <span className="text-[var(--color-ink-muted)]">Duration</span>
              <span className="font-semibold text-[var(--color-ink)]">{days} days</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No dates selected</div>
        )}
      </div>

      {/* Total */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--color-ink-muted)]">Total Amount</span>
          <DollarSign size={14} className="text-[var(--color-primary)]" />
        </div>
        <div className="text-2xl font-bold text-[var(--color-ink)]">
          KES {totalAmount.toLocaleString()}
        </div>
        {days > 0 && vehicle && (
          <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">
            {days} days × KES {Number(vehicle.daily_rate).toLocaleString()}/day
          </div>
        )}
      </div>
    </div>
  );
}
