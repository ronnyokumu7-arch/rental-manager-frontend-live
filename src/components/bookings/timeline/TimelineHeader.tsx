// src/components/bookings/timeline/TimelineHeader.tsx
"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface TimelineHeaderProps {
  viewStartDate: Date;
  viewEndDate: Date;
  isCreateMode: boolean;
  schedulingStep: "select-vehicle" | "select-start" | "select-end" | "link-client" | null;
  onShiftWindow: (direction: "forward" | "backward") => void;
  onJumpToToday: () => void;
  onToggleCreateMode: () => void;
  
  // ✅ Fleet-wide metrics ONLY
  totalVehicles: number;
  vehiclesWithBookings: number;
  availableVehicles: number;
  utilizationRate: number;
}

export default function TimelineHeader({
  viewStartDate,
  viewEndDate,
  isCreateMode,
  schedulingStep,
  onShiftWindow,
  onJumpToToday,
  onToggleCreateMode,
  totalVehicles,
  vehiclesWithBookings,
  availableVehicles,
  utilizationRate,
}: TimelineHeaderProps) {
  const formattedStart = format(viewStartDate, "MMM dd, yyyy");
  const formattedEnd = format(viewEndDate, "MMM dd, yyyy");

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] gap-4 z-40 relative">
      
      {/* Left: Date and Step Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/10">
          <Calendar size={18} />
        </div>
        <div>
          <span className="text-sm font-bold text-[var(--color-ink)] block">
            {formattedStart} to {formattedEnd}
          </span>
          {isCreateMode ? (
            <span className="text-[11px] text-[var(--color-primary)] font-bold block mt-0.5 animate-pulse uppercase tracking-wider">
              {schedulingStep === "select-vehicle" && "✨ Step 1: Select a vehicle grid channel"}
              {schedulingStep === "select-start" && " Step 2: Click start date on timeline lane"}
              {schedulingStep === "select-end" && "📅 Step 3: Click end date to lock booking window"}
              {schedulingStep === "link-client" && "👤 Step 4: Finalize client link payload"}
            </span>
          ) : (
            <span className="text-[11px] text-[var(--color-ink-muted)] font-medium block mt-0.5">Continuous 14-Day Tactical Window</span>
          )}
        </div>
      </div>

      {/* Middle: Clean Fleet-Wide Counters ONLY */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Total Fleet</span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalVehicles}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">With Bookings</span>
          <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{vehiclesWithBookings}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Available</span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{availableVehicles}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-ink-muted)]" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Utilization</span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{utilizationRate}%</span>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onJumpToToday}
          className="px-3.5 py-2 text-xs font-bold border border-[var(--color-surface-border)] rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-ink)] transition-all shadow-sm bg-[var(--color-surface)] active:scale-95"
        >
          Today
        </button>

        <div className="h-6 w-px bg-[var(--color-surface-border)] mx-1" />

        <div className="flex rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-hidden bg-[var(--color-surface)]">
          <button onClick={() => onShiftWindow("backward")} className="p-2 hover:bg-[var(--color-surface-hover)] border-r border-[var(--color-surface-border)] text-[var(--color-ink-muted)] transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => onShiftWindow("forward")} className="p-2 hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={onToggleCreateMode}
          className={`ml-2 px-3.5 py-2 text-xs font-bold border border-[var(--color-surface-border)] rounded-xl bg-[var(--color-surface)] shadow-sm transition-all active:scale-95 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] ${
            isCreateMode 
              ? "text-red-600 border-red-500/20 bg-red-500/5" 
              : "text-[var(--color-ink)]"
          }`}
        >
          {isCreateMode ? "Cancel Mode" : "+ New Booking"}
        </button>
      </div>
    </div>
  );
}
