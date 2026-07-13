// src/components/profile/viewers/booking/BookingHero.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Pencil, X, Play, UserX,
  Loader2, Save, MoreVertical, Phone,
  Car, Gauge, Link, ArrowUpRight
} from "lucide-react";
import type { Booking, Client, Vehicle, Contract } from "@/lib/types";

interface BookingHeroProps {
  booking: Booking;
  client: Client | null;
  vehicle: Vehicle | null;
  isEditing: boolean;
  isSaving: boolean;
  isActionLoading: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onAction: (action: "confirm" | "activate" | "complete" | "cancel" | "no_show") => void;
  onSendInvoice: () => void;
  onSendContract: () => void;
  contract?: Contract | null;
}

export default function BookingHero({
  booking, client, vehicle,
  isEditing, isSaving, isActionLoading,
  onEdit, onCancelEdit, onSave, onAction,
  onSendInvoice, onSendContract, contract
}: BookingHeroProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = client?.full_name 
    ? client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : "??";

  return (
    <div className="p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
      <div className="flex items-start justify-between gap-6">
        
        {/* LEFT: Identity & Context */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xl ring-4 ring-[var(--color-surface)] shadow-sm flex-shrink-0">
            {initials}
          </div>
          
          <div className="space-y-2 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[var(--color-ink)] truncate">
                {client?.full_name || "Unknown Client"}
              </h2>
              <span className="px-2 py-0.5 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] text-[10px] font-mono font-bold border border-[var(--color-surface-border)]">
                #{booking.booking_number}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 text-xs text-[var(--color-ink-muted)]">
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-[var(--color-ink-subtle)]" /> 
                {client?.phone || "No phone provided"}
              </span>
              
              {vehicle && (
                <div className="flex flex-col gap-0.5 mt-0.5 pl-0.5">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5">
                      <Car size={12} className="text-[var(--color-ink-subtle)]" /> 
                      {vehicle.make} {vehicle.model}
                    </span>
                    <span className="font-mono text-[var(--color-ink-subtle)]">{vehicle.plate_number}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Gauge size={12} className="text-[var(--color-ink-subtle)]" /> 
                    {vehicle.current_mileage.toLocaleString()} km
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions & Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button 
                onClick={onCancelEdit} 
                className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <X size={16} />
              </button>
              <button 
                onClick={onSave} 
                disabled={isSaving} 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 shadow-sm active:scale-95"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onEdit} 
                className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
              >
                <Pencil size={16} />
              </button>
              
              {booking.status === "confirmed" && (
                <button 
                  onClick={() => onAction("activate")} 
                  disabled={isActionLoading} 
                  className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 transition-colors disabled:opacity-50"
                  title="Activate Booking"
                >
                  {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                </button>
              )}
              {booking.status === "active" && (
                <button 
                  onClick={() => onAction("complete")} 
                  disabled={isActionLoading} 
                  className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 transition-colors disabled:opacity-50"
                  title="Complete Booking"
                >
                  {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                </button>
              )}
              
              {/* 3-DOTS ACTION MENU */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1.5">
                      
                      {/* Cancel Booking */}
                      {(booking.status === "confirmed" || booking.status === "pending") && (
                        <button 
                          onClick={() => { onAction("cancel"); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/5 transition-colors"
                        >
                          <X size={14} /> Cancel Booking
                        </button>
                      )}
                      
                      {/* Mark as No-Show */}
                      {booking.status === "confirmed" && (
                        <button 
                          onClick={() => { onAction("no_show"); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 transition-colors"
                        >
                          <UserX size={14} /> Mark as No-Show
                        </button>
                      )}
                      
                      <div className="border-t border-[var(--color-surface-border)] my-1.5" />
                      
                      {/* Share Contract Link */}
                      {contract && (
                        <button 
                          onClick={() => { onSendContract(); setIsMenuOpen(false); }} 
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors group"
                        >
                          <span className="flex items-center gap-3"><Link size={14} /> Share Contract</span>
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                      
                      {/* Send Invoice */}
                      {booking.invoices && booking.invoices.length > 0 && (
                        <button 
                          onClick={() => { onSendInvoice(); setIsMenuOpen(false); }} 
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/5 transition-colors group"
                        >
                          <span className="flex items-center gap-3"><Link size={14} /> Copy Invoice Link</span>
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
