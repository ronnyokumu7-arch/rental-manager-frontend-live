// src/components/bookings/BookingManifestCards.tsx
"use client";

import { User, Car, Receipt, Edit2, MapPin, Phone } from "lucide-react";
import type { Booking, Client, Vehicle } from "@/lib/types";

interface BookingManifestCardsProps {
  booking: Booking;
  client: Client | null;
  vehicle: Vehicle | null;
  isEditable: boolean;
  onChangeClient: () => void;
  onChangeVehicle: () => void;
}

export default function BookingManifestCards({
  booking, client, vehicle, isEditable, onChangeClient, onChangeVehicle
}: BookingManifestCardsProps) {
  
  const duration = Math.max(1, Math.ceil(
    (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Client Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-5 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm shrink-0">
              {client?.full_name?.charAt(0) || "C"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--color-ink)] truncate">{client?.full_name || "Unknown Client"}</p>
              <p className="text-xs text-[var(--color-ink-muted)] truncate">{client?.email || "No email on file"}</p>
            </div>
          </div>
          {isEditable && (
            <button 
              onClick={onChangeClient} 
              className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all active:scale-95" 
              title="Change Client"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-[var(--color-ink-muted)]">
            <Phone size={14} className="text-[var(--color-ink-subtle)] shrink-0" />
            <span className="truncate">{client?.phone || "No phone number"}</span>
          </div>
          {client?.residential_address && (
            <div className="flex items-start gap-2.5 text-[var(--color-ink-muted)]">
              <MapPin size={14} className="text-[var(--color-ink-subtle)] shrink-0 mt-0.5" />
              <span className="truncate leading-snug">{client.residential_address}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Vehicle Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-5 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] shrink-0">
              <Car size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--color-ink)] truncate">{vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}</p>
              <p className="text-xs text-[var(--color-ink-muted)] truncate font-mono">{vehicle?.plate_number} • {vehicle?.year}</p>
            </div>
          </div>
          {isEditable && (
            <button 
              onClick={onChangeVehicle} 
              className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all active:scale-95" 
              title="Change Vehicle"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
          <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Current Status</p>
          <p className="text-sm font-semibold text-[var(--color-ink)] mt-1 capitalize">{vehicle?.status?.replace("_", " ") || "N/A"}</p>
        </div>
      </div>

      {/* 3. Financial Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-5 hover:border-emerald-500/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Receipt size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-ink)]">Financials</p>
              <p className="text-xs text-[var(--color-ink-muted)]">Total Contract Value</p>
            </div>
          </div>
        </div>
        
        <p className="text-2xl font-bold text-[var(--color-ink)] mb-4 tracking-tight">
          {booking.currency_code} {Number(booking.total_amount).toLocaleString()}
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Duration</p>
            <p className="text-sm font-semibold text-[var(--color-ink)] mt-1">{duration} Days</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Daily Rate</p>
            <p className="text-sm font-semibold text-[var(--color-ink)] mt-1">
              {booking.currency_code} {Math.round(Number(booking.total_amount) / duration).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
