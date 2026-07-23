// src/components/bookings/FleetTimelineCalendar.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Car, User, ExternalLink, HelpCircle } from "lucide-react";
import { Booking, Vehicle, Client } from "@/lib/types";

import TimelineHeader from "./timeline/TimelineHeader";
import { useTimelineCalendar } from "@/hooks/bookings/timeline/useTimelineCalendar";

interface FleetTimelineCalendarProps {
  bookings: Booking[];
  vehicleMap: Record<number, Vehicle> | Map<number, Vehicle> | Vehicle[];
  clientMap: Record<number, Client> | Map<number, Client> | Client[];
  onExtendBooking: (booking: Booking) => void;
  onCreateBooking: (payload: { vehicleId: number; startDate: string; endDate: string; clientId: number }) => Promise<void>;
}

export default function FleetTimelineCalendar({
  bookings = [],
  vehicleMap = {},
  clientMap = {},
  onExtendBooking,
  onCreateBooking,
}: FleetTimelineCalendarProps) {
  const {
    viewStartDate,
    viewEndDate,
    daysToShow,
    timelineDays,
    normalizedVehicles,
    normalizedClients,
    isCreateMode,
    schedulingStep,
    selectedStartDate,
    selectedEndDate,
    selectedClientId,
    setSelectedClientId,
    handleToggleCreateMode,
    handleCellClick,
    handleFinalizeBooking,
    calculatePosition,
    getCellHighlightClass,
    getClientFromRef,
    shiftWindow,
    jumpToToday,
  } = useTimelineCalendar({ bookings, vehicleMap, clientMap, onCreateBooking });

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(normalizedVehicles[0]?.id || null);

  const totalVehicles = normalizedVehicles.length;
  const vehiclesWithBookings = normalizedVehicles.filter(v => 
    bookings.some(b => String(b.vehicle_id ?? (b as any).vehicleId) === String(v.id))
  ).length;
  const availableVehicles = normalizedVehicles.filter(v => v.status === "available").length;
  const fleetUtilizationRate = totalVehicles > 0 ? Math.round((vehiclesWithBookings / totalVehicles) * 100) : 0;

  const selectedVehicle = normalizedVehicles.find(v => String(v.id) === String(selectedVehicleId));
  const selectedVehicleBookings = bookings.filter(b => 
    String(b.vehicle_id ?? (b as any).vehicleId) === String(selectedVehicleId)
  );
  
  const viewStart = new Date(viewStartDate);
  const viewEnd = new Date(viewEndDate);
  const totalDaysInView = Math.ceil((viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  let rentedDays = 0;
  selectedVehicleBookings.forEach(booking => {
    const bookingStart = new Date(booking.start_date || (booking as any).startDate);
    const bookingEnd = new Date(booking.end_date || (booking as any).endDate);
    
    const overlapStart = new Date(Math.max(viewStart.getTime(), bookingStart.getTime()));
    const overlapEnd = new Date(Math.min(viewEnd.getTime(), bookingEnd.getTime()));
    
    if (overlapStart <= overlapEnd) {
      const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      rentedDays += days;
    }
  });
  
  const vehicleUtilizationRate = totalDaysInView > 0 ? Math.round((rentedDays / totalDaysInView) * 100) : 0;

  return (
    <div className="space-y-6 antialiased">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
        
        {/* ✅ Top Bar: Clean Fleet-Wide Counters Only */}
        <TimelineHeader
          viewStartDate={viewStartDate}
          viewEndDate={viewEndDate}
          isCreateMode={isCreateMode}
          schedulingStep={schedulingStep}
          totalVehicles={totalVehicles}
          vehiclesWithBookings={vehiclesWithBookings}
          availableVehicles={availableVehicles}
          utilizationRate={fleetUtilizationRate}
          onShiftWindow={shiftWindow}
          onJumpToToday={jumpToToday}
          onToggleCreateMode={handleToggleCreateMode}
        />

        {schedulingStep === "link-client" && (
          <div className="bg-[var(--color-primary)]/[0.02] border-b border-[var(--color-surface-border)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="text-xs">
              <span className="font-bold text-[var(--color-ink)] block">Associate Contract Holder</span>
              <span className="text-[11px] text-[var(--color-ink-muted)] mt-0.5 block">
                Assign reservation window ({selectedStartDate} to {selectedEndDate}) to platform customer.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs font-semibold outline-none text-[var(--color-ink)] max-w-xs w-full shadow-sm"
                value={selectedClientId || ""}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
              >
                <option value="">-- Choose Client Profile --</option>
                {normalizedClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
              <button
                disabled={!selectedClientId}
                onClick={handleFinalizeBooking}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap active:scale-95 transition-transform"
              >
                Confirm Booking Payload
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1100px] flex flex-col relative">
            
            {/* Header Timeline Track Axis */}
            <div className="flex border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
              <div className="w-72 flex-shrink-0 p-4 border-r border-[var(--color-surface-border)] font-bold text-[11px] text-[var(--color-ink-muted)] uppercase tracking-widest bg-[var(--color-surface)] flex items-center justify-between sticky left-0 z-40">
                <span>Vehicle Fleet Asset</span>
                <HelpCircle size={13} className="text-[var(--color-ink-subtle)] opacity-60" />
              </div>
              <div className="flex flex-1">
                {timelineDays.map((day, i) => {
                  const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                  return (
                    <div key={i} style={{ width: `${100 / daysToShow}%` }} className={`p-3 text-center border-r border-[var(--color-surface-border)]/60 last:border-r-0 flex flex-col justify-center items-center relative ${isToday ? "bg-[var(--color-primary)]/[0.02]" : ""}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}`}>{format(day, "EEE")}</span>
                      <span className={`text-xs font-black mt-1 w-7 h-7 flex items-center justify-center rounded-xl ${isToday ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink)]"}`}>{format(day, "d")}</span>
                      {isToday && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-primary)]" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrix Row Track Loops */}
            <div className="divide-y divide-[var(--color-surface-border)] bg-[var(--color-surface)] max-h-[28rem] overflow-y-auto custom-scrollbar relative">
              {normalizedVehicles.map((vehicle) => {
                const vehicleBookings = bookings.filter((b) => String(b.vehicle_id ?? (b as any).vehicleId) === String(vehicle.id));
                const isLocked = vehicle.status !== "available";
                const isSelected = String(vehicle.id) === String(selectedVehicleId);

                return (
                  <div 
                    key={vehicle.id} 
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`flex h-16 relative group/row transition-colors shrink-0 cursor-pointer ${
                      isSelected ? "bg-[var(--color-primary)]/[0.03] border-l-4 border-l-[var(--color-primary)]" : ""
                    } ${
                      isLocked ? "bg-[var(--color-surface-hover)]/20" : "hover:bg-[var(--color-surface-hover)]/10"
                    }`}
                  >
                    
                    {/* Frozen Sidebar Asset Label Column */}
                    <div className="w-72 flex-shrink-0 p-3 border-r border-[var(--color-surface-border)] bg-[var(--color-surface)] z-20 flex items-center justify-between sticky left-0 shadow-[6px_0_12px_-6px_rgba(0,0,0,0.03)] group-hover/row:bg-[var(--color-surface-hover)]/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] shrink-0">
                          <Car size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">{vehicle.make} {vehicle.model}</h4>
                          <p className="text-[10px] font-mono font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mt-0.5">{vehicle.plate_number || "No Plate"}</p>
                        </div>
                      </div>
                      <div className="shrink-0 pl-2">
                        {isLocked ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 capitalize">
                            {vehicle.status.replace("_", " ")}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">Ready</span>
                        )}
                      </div>
                    </div>

                    {/* Continuous Gantt Bed Channel Timeline Layer */}
                    <div className="flex-1 relative min-h-full flex items-center">
                      
                      {/* Clickable Lane Cells Track Backdrop */}
                      <div className="absolute inset-0 flex">
                        {timelineDays.map((day, idx) => {
                          const dayStr = format(day, "yyyy-MM-dd");
                          const highlightClass = getCellHighlightClass(vehicle.id, dayStr);
                          return (
                            <div
                              key={idx}
                              style={{ width: `${100 / daysToShow}%` }}
                              onClick={() => !isLocked && handleCellClick(vehicle.id, dayStr)}
                              className={`border-r border-[var(--color-surface-border)]/40 h-full last:border-0 relative transition-colors ${
                                isLocked ? "cursor-not-allowed bg-striped-gray" : isCreateMode ? "cursor-crosshair hover:bg-[var(--color-primary)]/[0.05]" : ""
                              } ${highlightClass}`}
                            />
                          );
                        })}
                      </div>

                      {/* Display Existing Booking Cards Overlay */}
                      {vehicleBookings.map((booking) => {
                        const start = booking.start_date || (booking as any).startDate;
                        const end = booking.end_date || (booking as any).endDate;
                        const pos = calculatePosition(start, end);
                        if (!pos.visible) return null;

                        const client = getClientFromRef(booking.client_id || (booking as any).clientId);

                        return (
                          <div
                            key={booking.id}
                            style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
                            className={`absolute h-14 border rounded-lg p-2 mx-0.5 flex flex-col justify-between transition-all duration-200 shadow-sm z-20 overflow-hidden cursor-pointer pointer-events-auto ${
                              isCreateMode ? "opacity-30 pointer-events-none" : ""
                            } ${
                              booking.status === "active" ? "bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-800 dark:text-emerald-400" : "bg-blue-500/[0.06] border-blue-500/30 text-blue-800 dark:text-blue-400"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isCreateMode) onExtendBooking(booking);
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-extrabold truncate tracking-tight flex items-center gap-1.5">
                                <User size={10} className="opacity-70" />
                                {client?.full_name || booking.client?.full_name || "Active Contract"}
                              </span>
                              <ExternalLink size={10} className="opacity-0 group-hover/card:opacity-50 shrink-0" />
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-bold mt-0.5 opacity-90">
                              <span className="font-mono tracking-tight opacity-75">{format(new Date(start), "MMM d")} - {format(new Date(end), "MMM d")}</span>
                              <span className="uppercase text-[8px] font-black px-1 py-0.5 bg-white dark:bg-[var(--color-surface)] border border-black/5 dark:border-white/10 rounded-md tracking-wider">
                                {booking.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ✅ Bottom Bar: Selected Vehicle Details */}
        {selectedVehicle && (
          <div className="border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <Car size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-ink)]">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] font-mono">
                      {selectedVehicle.plate_number}
                    </p>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-[var(--color-surface-border)]" />
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Rented</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{rentedDays}d</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Utilization</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">{vehicleUtilizationRate}%</span>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                <span>Click any vehicle row to view details</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
