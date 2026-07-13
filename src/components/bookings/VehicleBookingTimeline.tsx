// src/components/bookings/VehicleBookingTimeline.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, FileText, CheckCircle2, PlayCircle, Flag, AlertCircle } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

interface VehicleBookingTimelineProps {
  vehicleId: number;
  currentBookingId?: number;
  currentStatus?: string;
  shareToken?: string | null;
  startDate: string;
  endDate: string;
}

export default function VehicleBookingTimeline({
  vehicleId,
  currentBookingId,
  currentStatus = "pending",
  shareToken,
  startDate,
  endDate,
}: VehicleBookingTimelineProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await bookingsApi.list({ vehicle_id: vehicleId });
        setBookings(data);
      } catch (error) {
        console.error("Failed to load timeline", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [vehicleId]);

  // ✅ PREMIUM SKELETON LOADER
  if (loading) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-hover)] animate-pulse" />
          <div className="h-5 w-48 bg-[var(--color-surface-hover)] rounded-lg animate-pulse" />
        </div>
        <div className="h-16 bg-[var(--color-surface-hover)] rounded-xl animate-pulse" />
        <div className="flex justify-between px-2">
          <div className="h-4 w-16 bg-[var(--color-surface-hover)] rounded animate-pulse" />
          <div className="h-4 w-16 bg-[var(--color-surface-hover)] rounded animate-pulse" />
          <div className="h-4 w-16 bg-[var(--color-surface-hover)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  // ✅ PREMIUM EMPTY STATE
  if (sortedBookings.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
          <Calendar size={28} className="text-[var(--color-ink-subtle)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-1">No Booking History</h3>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-sm mx-auto">
          This vehicle has not been assigned to any bookings yet. Timeline will appear here once scheduled.
        </p>
      </div>
    );
  }

  const minTime = Math.min(...sortedBookings.map((b) => new Date(b.start_date).getTime()));
  const maxTime = Math.max(...sortedBookings.map((b) => new Date(b.end_date).getTime()));
  const totalDuration = Math.max(maxTime - minTime, 1000 * 60 * 60 * 24); // Min 1 day to prevent div by zero
  
  const minDate = new Date(minTime);
  const maxDate = new Date(minTime + totalDuration);

  const getPosition = (dateStr: string) => ((new Date(dateStr).getTime() - minTime) / totalDuration) * 100;
  const getWidth = (start: string, end: string) =>
    Math.min(Math.max(((new Date(end).getTime() - new Date(start).getTime()) / totalDuration) * 100, 2), 100);

  const currentDuration = Math.max(
    1,
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  // ✅ LIFECYCLE LOGIC
  const journeySteps = [
    { id: "quotation", label: "Quotation", icon: FileText },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "active", label: "In Progress", icon: PlayCircle },
    { id: "completed", label: "Completed", icon: Flag },
  ];

  const getStepState = (stepId: string): 'completed' | 'current' | 'future' => {
    if (stepId === 'quotation' || stepId === 'confirmed') {
      if (['confirmed', 'active', 'completed'].includes(currentStatus)) return 'completed';
      if (currentStatus === 'pending' && shareToken) return 'current';
      return 'future';
    }
    if (stepId === 'active') {
      if (['active', 'completed'].includes(currentStatus)) return 'completed';
      if (currentStatus === 'confirmed') return 'current';
      return 'future';
    }
    if (stepId === 'completed') {
      if (currentStatus === 'completed') return 'completed';
      if (currentStatus === 'active') return 'current';
      return 'future';
    }
    return 'future';
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
            <Calendar size={18} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Vehicle Utilization Timeline</h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">Visualizing booking density and availability gaps</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* 2. PREMIUM TIMELINE TRACK */}
        <div className="relative">
          <div className="relative h-14 bg-[var(--color-surface-hover)]/40 rounded-xl border border-[var(--color-surface-border)] overflow-hidden shadow-inner">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-px h-full bg-[var(--color-surface-border)]/60" />
              ))}
            </div>
            
            {/* Booking Blocks */}
            {sortedBookings.map((booking) => {
              const isCurrent = booking.id === currentBookingId;
              const left = getPosition(booking.start_date);
              const width = getWidth(booking.start_date, booking.end_date); 
              
              let blockClass = "bg-[var(--color-primary)] text-white hover:brightness-110";
              if (isCurrent) {
                blockClass = "bg-gradient-to-r from-amber-500 to-orange-500 text-white ring-2 ring-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] z-10";
              } else if (booking.status === "completed" || booking.status === "cancelled") {
                blockClass = "bg-[var(--color-ink-subtle)] text-white opacity-40 hover:opacity-70";
              }
              
              return (
                <div
                  key={booking.id}
                  className={`absolute top-2 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wide shadow-sm transition-all duration-200 cursor-default ${blockClass}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`Booking #${booking.id} • ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`}
                >
                  <span className="truncate px-1">#{booking.id}</span>
                </div>
              );
            })}
          </div>

          {/* Date Axis */}
          <div className="relative h-6 mt-2 text-[10px] font-bold text-[var(--color-ink-subtle)] uppercase tracking-wider px-1">
            <div className="absolute left-0 -translate-x-1/4">{minDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
            <div className="absolute left-1/2 -translate-x-1/2">
              {new Date((minDate.getTime() + maxDate.getTime()) / 2).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div className="absolute right-0 translate-x-1/4">{maxDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
          </div each>
        </div>

        {/* 3. SPLIT BOTTOM ROW: Context & Journey */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-5 bg-[var(--color-surface-hover)]/30 rounded-2xl border border-[var(--color-surface-border)]">
          
          {/* Left: Current Booking Window */}
          <div className="flex items-start gap-4 flex-shrink-0 w-full lg:w-auto">
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex-shrink-0">
              <Clock size={20} className="text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1">Current Booking Window</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  {new Date(startDate).toLocaleDateString()} <span className="text-[var(--color-ink-subtle)] mx-1">→</span> {new Date(endDate).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                  {currentDuration} {currentDuration === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Horizontal Progress Nodes */}
          <div className="flex items-center justify-between w-full lg:flex-1 lg:pl-8 border-t lg:border-t-0 lg:border-l border-[var(--color-surface-border)] pt-5 lg:pt-0 lg:ml-4">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const state = getStepState(step.id);
              const isCompleted = state === 'completed';
              const isCurrent = state === 'current';
               
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none group">
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                          : isCurrent
                          ? "bg-amber-500/5 text-amber-500 border-amber-500/20 ring-2 ring-amber-500/10 shadow-sm"
                          : "bg-[var(--color-surface)] text-[var(--color-ink-subtle)] border-[var(--color-surface-border)] group-hover:border-[var(--color-ink-subtle)]"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                    </div>
                    <p
                      className={`text-[10px] font-bold mt-2.5 uppercase tracking-wider transition-colors ${
                        isCompleted || isCurrent ? "text-[var(--color-ink)]" : "text-[var(--color-ink-subtle)]"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  
                  {/* Connector Line */}
                  {index < journeySteps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[var(--color-surface-border)]" />
                      <div 
                        className={`absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-500 ${
                          isCompleted ? "w-full" : "w-0"
                        }`} 
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
