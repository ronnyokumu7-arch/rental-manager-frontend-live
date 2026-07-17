// src/hooks/bookings/useExtendBooking.ts
import { useState } from "react";
import toast from "react-hot-toast";
import { bookingsApi, ExtendBookingPayload } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

export function useExtendBooking(onSuccess: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedBooking(null);
  };

  const handleExtend = async (payload: ExtendBookingPayload) => {
    if (!selectedBooking) return;

    setIsLoading(true);
    try {
      await bookingsApi.extend(selectedBooking.id, payload);
      toast.success("Booking extended successfully!");
      closeModal();
      onSuccess(); // Trigger parent refetch
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to extend booking");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    selectedBooking,
    isLoading,
    openModal,
    closeModal,
    handleExtend,
  };
}
