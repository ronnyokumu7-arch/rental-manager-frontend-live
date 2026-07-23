// src/hooks/bookings/timeline/useTimelineCalendar.ts
"use client";

import { useState, useMemo } from "react";
import { format, addDays, subDays, startOfDay, differenceInDays } from "date-fns";
import { Booking, Vehicle, Client } from "@/lib/types";

interface UseTimelineCalendarProps {
  bookings: Booking[];
  vehicleMap: Record<number, Vehicle> | Map<number, Vehicle> | Vehicle[];
  clientMap: Record<number, Client> | Map<number, Client> | Client[];
  onCreateBooking: (payload: { vehicleId: number; startDate: string; endDate: string; clientId: number }) => Promise<void>;
}

export function useTimelineCalendar({
  bookings = [],
  vehicleMap = {},
  clientMap = {},
  onCreateBooking,
}: UseTimelineCalendarProps) {
  const [viewStartDate, setViewStartDate] = useState(() => startOfDay(new Date()));
  const daysToShow = 14;

  // Real-time scheduling wizard states
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [schedulingStep, setSchedulingStep] = useState<"select-vehicle" | "select-start" | "select-end" | "link-client" | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Core Calendar Computations
  const timelineDays = useMemo(() => {
    return Array.from({ length: daysToShow }).map((_, i) => addDays(viewStartDate, i));
  }, [viewStartDate, daysToShow]);

  const viewEndDate = useMemo(() => addDays(viewStartDate, daysToShow - 1), [viewStartDate, daysToShow]);

  const normalizedVehicles = useMemo(() => {
    if (!vehicleMap) return [];
    if (vehicleMap instanceof Map) return Array.from(vehicleMap.values());
    if (Array.isArray(vehicleMap)) return vehicleMap;
    return Object.values(vehicleMap);
  }, [vehicleMap]);

  const normalizedClients = useMemo(() => {
    if (!clientMap) return [];
    if (clientMap instanceof Map) return Array.from(clientMap.values());
    if (Array.isArray(clientMap)) return clientMap;
    return Object.values(clientMap);
  }, [clientMap]);

  // Lock Guard validation lookup helper
  const isVehicleUnavailable = (vehicleId: number): boolean => {
    const vehicle = normalizedVehicles.find(v => v.id === vehicleId);
    return !vehicle || vehicle.status !== "available";
  };

  const getClientFromRef = (clientId: number): Client | undefined => {
    if (!clientMap || !clientId) return undefined;
    if (clientMap instanceof Map) return clientMap.get(clientId);
    if (Array.isArray(clientMap)) return clientMap.find((c) => c.id === clientId);
    return (clientMap as Record<number, Client>)[clientId];
  };

  const resetSchedulingState = () => {
    setIsCreateMode(false);
    setSchedulingStep(null);
    setSelectedVehicleId(null);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedClientId(null);
  };

  const handleToggleCreateMode = () => {
    if (isCreateMode) {
      resetSchedulingState();
    } else {
      setIsCreateMode(true);
      setSchedulingStep("select-vehicle");
    }
  };

  const handleCellClick = (vehicleId: number, dateStr: string) => {
    // 🚫 BLOCK: Prevent picking slots if vehicle state is not explicitly "available"
    if (isVehicleUnavailable(vehicleId)) return;

    if (!isCreateMode) return;

    if (schedulingStep === "select-vehicle") {
      setSelectedVehicleId(vehicleId);
      setSelectedStartDate(dateStr);
      setSchedulingStep("select-end");
    } else if (schedulingStep === "select-end") {
      if (vehicleId !== selectedVehicleId) {
        setSelectedVehicleId(vehicleId);
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
        return;
      }

      if (new Date(dateStr) < new Date(selectedStartDate!)) {
        setSelectedStartDate(dateStr);
        return;
      }

      setSelectedEndDate(dateStr);
      setSchedulingStep("link-client");
    }
  };

  const handleFinalizeBooking = async () => {
    if (selectedVehicleId && selectedStartDate && selectedEndDate && selectedClientId) {
      await onCreateBooking({
        vehicleId: selectedVehicleId,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        clientId: selectedClientId,
      });
      resetSchedulingState();
    }
  };

  const calculatePosition = (startDateStr: string, endDateStr: string) => {
    const start = startOfDay(new Date(startDateStr));
    const end = startOfDay(new Date(endDateStr));
    const activeStart = start < viewStartDate ? viewStartDate : start;
    const activeEnd = end > viewEndDate ? viewEndDate : end;

    if (activeEnd < viewStartDate || activeStart > viewEndDate) {
      return { visible: false, left: 0, width: 0, isCutStart: false, isCutEnd: false };
    }

    const leftOffsetDays = differenceInDays(activeStart, viewStartDate);
    const durationDays = differenceInDays(activeEnd, activeStart) + 1;
    return {
      visible: true,
      left: leftOffsetDays * (100 / daysToShow),
      width: durationDays * (100 / daysToShow),
      isCutStart: start < viewStartDate,
      isCutEnd: end > viewEndDate,
    };
  };

  const getCellHighlightClass = (vehicleId: number, dayStr: string) => {
    if (!isCreateMode || selectedVehicleId !== vehicleId) return "";
    if (selectedStartDate === dayStr && !selectedEndDate) {
      return "bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)] z-10";
    }
    
    if (selectedStartDate && selectedEndDate) {
      const current = new Date(dayStr);
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      if (current >= start && current <= end) {
        return "bg-[var(--color-primary)]/15 border-y border-[var(--color-primary)]/30 z-10";
      }
    }
    return "";
  };

  const shiftWindow = (dir: "forward" | "backward") => {
    setViewStartDate((prev) => (dir === "forward" ? addDays(prev, 7) : subDays(prev, 7)));
  };

  const jumpToToday = () => {
    setViewStartDate(startOfDay(new Date()));
  };

  return {
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
    isVehicleUnavailable,
  };
}
