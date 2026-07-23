// src/hooks/bookings/useBookingsPage.ts
"use client";

import { useState } from "react";
import { useBookingsList } from "@/hooks/bookings/useBookingsList";
import { useBookingsReferenceData } from "@/hooks/bookings/useBookingsReferenceData";
import { useExtendBooking } from "@/hooks/bookings/useExtendBooking";
import { bookingsApi } from "@/lib/api/bookings";
import { BookingCreate } from "@/lib/types";
import { differenceInDays } from "date-fns";

export type TabMode = "list" | "calendar";

export function useBookingsPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("list");

  const bookingsData = useBookingsList();
  const { clientMap, vehicleMap, isLoading: isRefDataLoading } = useBookingsReferenceData();
  
  const {
    isOpen: isExtendModalOpen,
    selectedBooking,
    isLoading: isExtending,
    openModal: openExtendModal,
    closeExtendModal,
    handleExtend,
  } = useExtendBooking(bookingsData.refetch || (() => {}));

  const handleCreateBookingFromCalendar = async (payload: {
    vehicleId: number;
    startDate: string;
    endDate: string;
    clientId: number;
  }) => {
    try {
      const days = differenceInDays(new Date(payload.endDate), new Date(payload.startDate)) + 1;

      const targetVehicle = Array.isArray(vehicleMap)
        ? vehicleMap.find((v) => v.id === payload.vehicleId)
        : vehicleMap instanceof Map
        ? vehicleMap.get(payload.vehicleId)
        : vehicleMap?.[payload.vehicleId];

      const dailyRate = targetVehicle?.daily_rate || (targetVehicle as any)?.dailyRate || 0;

      const bookingPayload: BookingCreate & { total_amount: number } = {
        vehicle_id: payload.vehicleId,
        client_id: payload.clientId,
        start_date: `${payload.startDate}T00:00:00Z`,
        end_date: `${payload.endDate}T23:59:59Z`,
        total_amount: days * dailyRate, 
        notes: "Created via Operational Fleet Timeline Grid",
      };

      await bookingsApi.create(bookingPayload);

      if (bookingsData.refetch) {
        await bookingsData.refetch();
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.detail || error.message;
      console.error("Server validation rejection details:", serverMessage);
      alert(`Could not save reservation: ${JSON.stringify(serverMessage)}`);
    }
  };

  return {
    activeTab,
    setActiveTab,
    bookingsData,
    clientMap,
    vehicleMap,
    isRefDataLoading,
    isExtendModalOpen,
    selectedBooking,
    isExtending,
    openExtendModal, // ✅ FIXED: Removed the 'openModal:' alias
    closeExtendModal,
    handleExtend,
    handleCreateBookingFromCalendar,
  };
}
