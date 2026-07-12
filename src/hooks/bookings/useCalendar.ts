// src/hooks/bookings/useCalendar.ts
import { useState, useEffect, useMemo } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, Vehicle } from "@/lib/types";

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    Promise.all([bookingsApi.list(), vehiclesApi.list()])
      .then(([bData, vData]) => {
        setBookings(bData);
        setVehicles(vData);
        // Default to showing all vehicles
        setSelectedVehicleIds(new Set(vData.map((v) => v.id)));
      })
      .finally(() => setLoading(false));
  }, []);

  // Navigation
  const goToPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter bookings by selected vehicles and current month
  const filteredBookings = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return bookings.filter((b) => {
      const startDate = new Date(b.start_date);
      const isSameMonth = startDate.getFullYear() === year && startDate.getMonth() === month;
      const isVehicleSelected = selectedVehicleIds.has(b.vehicle_id);
      return isSameMonth && isVehicleSelected;
    });
  }, [bookings, currentDate, selectedVehicleIds]);

  // Group bookings by day for the grid
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    filteredBookings.forEach((b) => {
      const dateKey = new Date(b.start_date).toDateString();
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(b);
    });
    return map;
  }, [filteredBookings]);

  const toggleVehicle = (id: number) => {
    const next = new Set(selectedVehicleIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedVehicleIds(next);
  };

  return {
    currentDate,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    vehicles,
    selectedVehicleIds,
    toggleVehicle,
    bookingsByDay,
    loading,
  };
}
