// src/components/calendar/CalendarGrid.tsx
"use client";

import { useMemo } from "react";
import type { Booking, Vehicle } from "@/lib/types";
import BookingChip from "./BookingChip";

interface CalendarGridProps {
  currentDate: Date;
  bookingsByDay: Map<string, Booking[]>;
  vehicles: Vehicle[];
  onBookingClick: (booking: Booking) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({ currentDate, bookingsByDay, vehicles, onBookingClick }: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: (Date | null)[] = [];
    // Padding for previous month
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const today = new Date().toDateString();

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden shadow-[var(--shadow-card)]">
      
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
        {DAYS.map((day) => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {calendarDays.map((date, idx) => {
          if (!date) return <div key={idx} className="bg-[var(--color-surface-hover)]/30 border-b border-r border-[var(--color-surface-border)]" />;
          
          const dateKey = date.toDateString();
          const dayBookings = bookingsByDay.get(dateKey) || [];
          const isToday = dateKey === today;

          return (
            <div
              key={idx}
              className={`min-h-[120px] p-2 border-b border-r border-[var(--color-surface-border)] transition-colors hover:bg-[var(--color-surface-hover)]/50 ${
                isToday ? "bg-[var(--color-primary)]/5" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${
                  isToday 
                    ? "bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center" 
                    : "text-[var(--color-ink)]"
                }`}>
                  {date.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[10px] text-[var(--color-ink-subtle)] font-medium">
                    {dayBookings.length} trip{dayBookings.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
                  <BookingChip
                    key={booking.id}
                    booking={booking}
                    vehicle={vehicleMap.get(booking.vehicle_id)}
                    onClick={() => onBookingClick(booking)}
                  />
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-[10px] font-bold text-[var(--color-ink-muted)] pl-2 pt-1">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
