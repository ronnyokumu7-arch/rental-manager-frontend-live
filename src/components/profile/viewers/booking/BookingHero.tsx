// src/components/profile/viewers/booking/BookingHero.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Pencil, X, Play, UserX,
  Loader2, Save, MoreVertical, Phone,
  Car, Gauge, Link
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

  const initials = client?.full_name ? client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "??";

  return (
    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg ring-2 ring-white dark:ring-slate-800 shadow-sm flex-shrink-0 mt-0.5">
            {initials}
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {client?.full_name || "Unknown Client"}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="text-[8px]">#</span> {booking.booking_number}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {client?.phone || "No phone"}</span>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5"><Car size={12} className="text-slate-400" /> {vehicle?.make} {vehicle?.model}</span>
                  <span className="flex items-center gap-1.5 font-mono">{vehicle?.plate_number || "N/A"}</span>
                </span>
                <span className="flex items-center gap-1.5"><Gauge size={12} className="text-slate-400" /> {vehicle?.current_mileage.toLocaleString() || 0} km</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button onClick={onCancelEdit} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={16} /></button>
              <button onClick={onSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
              </button>
            </>
          ) : (
            <>
              <button onClick={onEdit} className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all"><Pencil size={16} /></button>
              {booking.status === "confirmed" && (
                <button onClick={() => onAction("activate")} disabled={isActionLoading} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors">
                  {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                </button>
              )}
              {booking.status === "active" && (
                <button onClick={() => onAction("complete")} disabled={isActionLoading} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
                  {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                </button>
              )}
              
              {/* 3-DOTS ACTION MENU */}
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <MoreVertical size={16} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                      {/* Cancel Booking */}
                      {(booking.status === "confirmed" || booking.status === "pending") && (
                        <button 
                          onClick={() => { onAction("cancel"); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <X size={14} /> Cancel Booking
                        </button>
                      )}
                      
                      {/* Mark as No-Show */}
                      {booking.status === "confirmed" && (
                        <button 
                          onClick={() => { onAction("no_show"); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <UserX size={14} /> Mark as No-Show
                        </button>
                      )}
                      
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                      
                      {/* Share Contract Link */}
                      {contract && (
                        <button 
                          onClick={() => { onSendContract(); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <Link size={14} /> Share Contract Link
                        </button>
                      )}
                      
                      {/* Send Invoice */}
                      {booking.invoices && booking.invoices.length > 0 && (
                        <button 
                          onClick={() => { onSendInvoice(); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          <Link size={14} /> Send Invoice (Copy Link)
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
