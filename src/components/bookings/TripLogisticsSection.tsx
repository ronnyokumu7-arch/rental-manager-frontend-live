// src/components/bookings/TripLogisticsSection.tsx
"use client";

import { useState } from "react";
import { MapPin, Edit2, Save, X, Navigation } from "lucide-react";
import type { Booking } from "@/lib/types";

interface TripLogisticsSectionProps {
  booking: Booking;
  isEditable: boolean;
  tripDates: { start: string; end: string };
  setTripDates: (dates: { start: string; end: string }) => void;
  destination: string;
  setDestination: (dest: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const LOCAL_SUGGESTIONS = ["Nairobi", "Mombasa", "Diani Beach", "Kisumu", "Maasai Mara", "Naivasha", "Nakuru", "Eldoret"];

// ✅ BRAND TOKENS: Consistent with all profile components
const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block";
const valueClass = "text-sm font-semibold text-[var(--color-ink)]";

export default function TripLogisticsSection({
  booking, isEditable, tripDates, setTripDates, destination, setDestination, onSave, isSaving
}: TripLogisticsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = LOCAL_SUGGESTIONS.filter((loc) =>
    loc.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0
  );

  // ✅ EDIT MODE
  if (isEditing) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
              <MapPin size={18} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Edit Trip Logistics</h3>
          </div>
          <button 
            onClick={() => setIsEditing(false)} 
            className="text-xs font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X size={12} /> Cancel
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Pickup Date</label>
              <input 
                type="date" 
                value={tripDates.start} 
                onChange={(e) => setTripDates({ ...tripDates, start: e.target.value })} 
                className={inputClass} 
              />
            </div>
            <div>
              <label className={labelClass}>Return Date</label>
              <input 
                type="date" 
                value={tripDates.end} 
                onChange={(e) => setTripDates({ ...tripDates, end: e.target.value })} 
                className={inputClass} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Pickup Location</label>
              <input 
                type="text" 
                value={booking.pickup_location || ""} 
                disabled 
                className={`${inputClass} bg-[var(--color-surface-hover)] cursor-not-allowed opacity-70`} 
              />
            </div>
            <div>
              <label className={labelClass}>Return Location</label>
              <input 
                type="text" 
                value={booking.return_location || ""} 
                disabled 
                className={`${inputClass} bg-[var(--color-surface-hover)] cursor-not-allowed opacity-70`} 
              />
            </div>
          </div>

          <div className="relative">
            <label className={labelClass}>Destination / Area of Use</label>
            <div className="relative">
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g., Maasai Mara, Diani Beach" 
                className={`${inputClass} pl-10`} 
              />
              <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
            </div>
            
            {/* Premium Suggestion Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                {filteredSuggestions.map((loc) => (
                  <button 
                    key={loc} 
                    type="button" 
                    onMouseDown={() => { setDestination(loc); setShowSuggestions(false); }} 
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2"
                  >
                    <MapPin size={14} className="text-[var(--color-ink-subtle)]" />
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onSave} 
            disabled={isSaving} 
            className="w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-primary)]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm shadow-[var(--color-primary)]/20"
          >
            {isSaving ? <Save size={14} className="animate-spin" /> : <Save size={14} />} 
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  // ✅ VIEW MODE
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
            <MapPin size={18} className="text-[var(--color-primary)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Trip Logistics</h3>
        </div>
        
        {isEditable && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary)]/5 transition-all active:scale-95"
          >
            <Edit2 size={12} /> Edit Trip
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-5">
          <div>
            <p className={labelClass}>Trip Duration</p>
            <p className={valueClass}>
              {new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className={labelClass}>Destination</p>
            <p className={`${valueClass} ${!booking.destination ? 'text-[var(--color-ink-subtle)] italic font-normal' : ''}`}>
              {booking.destination || "Not specified"}
            </p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <p className={labelClass}>Pickup Point</p>
            <p className={`${valueClass} ${!booking.pickup_location ? 'text-[var(--color-ink-subtle)] italic font-normal' : ''}`}>
              {booking.pickup_location || "TBD"}
            </p>
          </div>
          <div>
            <p className={labelClass}>Return Point</p>
            <p className={`${valueClass} ${!booking.return_location ? 'text-[var(--color-ink-subtle)] italic font-normal' : ''}`}>
              {booking.return_location || "TBD"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
