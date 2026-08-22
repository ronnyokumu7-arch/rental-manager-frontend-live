// src/components/bookings/booking_list/types.ts
/** Shared types for the bookings list modules. */

import type { Booking, Client, Vehicle } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BookingsData = any;

export interface BookingsListProps {
  bookingsData: BookingsData;
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  isReferenceDataLoading: boolean;
  onExtendBooking: (booking: Booking) => void;
}
