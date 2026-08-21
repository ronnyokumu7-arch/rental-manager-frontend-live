// src/components/bookings/BookingSummary.tsx
"use client";

import { User, Car, CalendarDays, DollarSign, Phone, Loader2, ShieldCheck } from 'lucide-react';
import type { Client, Vehicle, ServiceType, PricingResult } from '@/lib/types';

interface BookingSummaryProps {
  client: Client | undefined;
  vehicle: Vehicle | undefined;
  startDate: string;
  endDate: string;
  totalAmount: number;
  // ✅ MILESTONE 1 (optional → backward compatible with any other usage)
  serviceType?: ServiceType;
  quote?: PricingResult | null;
  quoteLoading?: boolean;
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  selfdrive: "Self Drive",
  chauffeur_pro_driver: "Chauffeur · Pro Driver",
  chauffeur_wedding: "Chauffeur · Wedding",
  chauffeur_hourly: "Chauffeur · Hourly",
  corporate: "Corporate Transport",
  city_excursion: "City Excursion",
  airport_transfer: "Airport Transfer",
  chauffeur_taxi: "Taxi",
  route_stops_service: "Places-Visited Tour",
};

const fmtMoney = (v: number | string) => Number(v).toLocaleString();

const fmtDateTime = (v: string) => {
  const d = new Date(v);
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
};

export default function BookingSummary({
  client,
  vehicle,
  startDate,
  endDate,
  totalAmount,
  serviceType = "selfdrive",
  quote = null,
  quoteLoading = false,
}: BookingSummaryProps) {
  // ✅ Fallback aligned to the 24h rule (removed the inclusive "+1" overlap)
  const getDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // ✅ Engine is source of truth when quote is available
  const days = quote ? quote.included_days : getDays();

  return (
    <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] p-4">
      
      {/* Header + Service Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
          Booking Summary
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] font-bold uppercase tracking-wide">
          {SERVICE_LABELS[serviceType]}
        </span>
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

      {/* Dates + Times */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Period</span>
        </div>
        {startDate && endDate ? (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Pickup</span>
              <span className="font-medium text-[var(--color-ink)]">{fmtDateTime(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Return</span>
              <span className="font-medium text-[var(--color-ink)]">{fmtDateTime(endDate)}</span>
            </div>
            <div className="pt-1 border-t border-[var(--color-surface-border)] flex justify-between items-center">
              <span className="text-[var(--color-ink-muted)]">Duration</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {days} day{days !== 1 ? "s" : ""} × {quote ? quote.day_hours : 24}h
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No dates selected</div>
        )}
      </div>

      {/* ✅ MILESTONE 1: Live Pricing Breakdown (from /quote) */}
      {quote && (
        <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-[var(--color-primary)]" />
            <span className="text-xs font-semibold text-[var(--color-ink)]">Pricing Breakdown</span>
            {quoteLoading && <Loader2 size={10} className="animate-spin text-[var(--color-ink-muted)]" />}
          </div>
          <div className="space-y-1.5">
            {quote.lines.map((line, i) => (
              <div key={i} className="flex justify-between gap-2 text-xs">
                <span className="text-[var(--color-ink-muted)]">
                  {line.description} <span className="opacity-70">· {line.quantity}</span>
                </span>
                <span className="font-medium text-[var(--color-ink)] whitespace-nowrap">
                  KES {fmtMoney(line.amount)}
                </span>
              </div>
            ))}
            {quote.grace_used_minutes > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                <ShieldCheck size={10} />
                {quote.grace_used_minutes} min grace applied (free)
              </div>
            )}
            {quote.extra_hours > 0 && quote.overtime_waivable && (
              <div className="text-[10px] text-[var(--color-ink-muted)]">
                Extra hours may be forgiven as a discount at invoice time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--color-ink-muted)]">Total Amount</span>
          {quoteLoading && !quote && <Loader2 size={12} className="animate-spin text-[var(--color-ink-muted)]" />}
        </div>
        <div className="text-2xl font-bold text-[var(--color-ink)]">
          KES {totalAmount.toLocaleString()}
        </div>
        {quote ? (
          <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">
            {quote.included_days} day(s) × {quote.day_hours}h · {SERVICE_LABELS[serviceType]}
            {Number(quote.driver_charge) > 0 && " · includes driver fees"}
          </div>
        ) : (
          days > 0 && vehicle && (
            <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">
              {days} days × KES {Number(vehicle.daily_rate).toLocaleString()}/day
            </div>
          )
        )}
      </div>
    </div>
  );
}
