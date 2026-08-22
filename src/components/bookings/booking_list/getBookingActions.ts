// src/components/bookings/booking_list/getBookingActions.ts
/**
 * Shared row-actions factory — consumed by both CardGrid (mobile) and
 * DataTable (desktop) so behaviour is identical across breakpoints.
 */
import {
  Link as LinkIcon, Ban, XCircle, FileText, CalendarPlus, Shield, ShieldAlert,
} from "lucide-react";
import type { RowAction } from "@/components/ui/DataTable";
import type { Booking } from "@/lib/types";

export interface BookingActionsContext {
  routerPush: (href: string) => void;
  onExtendBooking: (booking: Booking) => void;
  handleConfirm: (id: number) => void;
  handleStartTrip: (id: number) => void;
  handleCompleteTrip: (id: number) => void;
  handleCancel: (id: number) => void;
  handleNoShow: (id: number) => void;
  handleCopyContractLink: (id: number) => void;
}

export const getBookingActions = (
  booking: Booking,
  ctx: BookingActionsContext,
): RowAction<Booking>[] => {
  const {
    routerPush, onExtendBooking, handleConfirm, handleStartTrip,
    handleCompleteTrip, handleCancel, handleNoShow, handleCopyContractLink,
  } = ctx;

  const actions: RowAction<Booking>[] = [
    { label: "Manage Booking", icon: FileText, onClick: () => routerPush(`/dashboard/bookings/${booking.id}`) },
    { label: "Send Contract", icon: LinkIcon, onClick: () => handleCopyContractLink(booking.id) },
  ];

  if (booking.status === "pending") {
    actions.push(
      { label: "Confirm Booking", icon: ShieldAlert, variant: "primary", onClick: () => handleConfirm(booking.id) },
      { label: "Cancel Booking", icon: Ban, variant: "danger", onClick: () => handleCancel(booking.id) },
    );
  }

  if (booking.status === "confirmed") {
    actions.push(
      { label: "Start Trip", icon: Shield, variant: "primary", onClick: () => handleStartTrip(booking.id) },
      { label: "Mark No-Show", icon: XCircle, variant: "default", onClick: () => handleNoShow(booking.id) },
      { label: "Cancel Booking", icon: Ban, variant: "danger", onClick: () => handleCancel(booking.id) },
    );
  }

  if (booking.status === "active") {
    actions.push(
      { label: "Complete Trip", icon: Shield, variant: "primary", onClick: () => handleCompleteTrip(booking.id) },
      { label: "Extend Booking", icon: CalendarPlus, variant: "default", onClick: () => onExtendBooking(booking) },
    );
  }

  if (booking.status === "completed") {
    actions.push({ label: "Extend Booking", icon: CalendarPlus, variant: "default", onClick: () => onExtendBooking(booking) });
  }

  return actions;
};
