// src/hooks/bookings/useBookingLifecycle.ts
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

export function useBookingLifecycle(
  booking: Booking | null | undefined,
  onRefresh?: () => void
) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const executeLifecycleAction = async (
    actionName: string,
    apiCall: (id: number) => Promise<any>,
    successMessage: string
  ) => {
    if (!booking) return;
    setLoadingAction(actionName);
    try {
      await apiCall(booking.id);
      toast.success(successMessage);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to ${actionName} booking`);
    } finally {
      setLoadingAction(null);
    }
  };

  const confirmBooking = () =>
    executeLifecycleAction("confirm", bookingsApi.confirm, "Booking confirmed!");

  const activateBooking = () =>
    executeLifecycleAction("activate", bookingsApi.activate, "Trip started & booking activated!");

  const completeBooking = () =>
    executeLifecycleAction("complete", bookingsApi.complete, "Booking completed! Vehicle awaiting mileage update.");

  const cancelBooking = () =>
    executeLifecycleAction("cancel", bookingsApi.cancel, "Booking cancelled successfully.");

  const noShowBooking = () =>
    executeLifecycleAction("noShow", bookingsApi.noShow, "Booking marked as no-show.");

  const archiveBooking = () =>
    executeLifecycleAction("archive", bookingsApi.archive, "Booking archived.");

  const restoreBooking = () =>
    executeLifecycleAction("restore", bookingsApi.restore, "Booking restored.");

  return {
    loadingAction,
    confirmBooking,
    activateBooking,
    completeBooking,
    cancelBooking,
    noShowBooking,
    archiveBooking,
    restoreBooking,
  };
}
