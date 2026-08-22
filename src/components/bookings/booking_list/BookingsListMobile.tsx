// src/components/bookings/booking_list/BookingsListMobile.tsx
"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Phone } from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { formatDateShort, statusDotColors, statusLabels } from "./constants";

interface BookingsListMobileProps {
  bookings: Booking[];
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number) => void;
  actionsCtx: Omit<BookingActionsContext, "routerPush">;
}

const getClient = (map: Map<number, Client>, id: number) => map.get(id) || map.get(Number(id));
const getVehicle = (map: Map<number, Vehicle>, id: number) => map.get(id) || map.get(Number(id));

export default function BookingsListMobile({
  bookings, clientMap, vehicleMap,
  currentPage, totalPages, setCurrentPage, actionsCtx,
}: BookingsListMobileProps) {
  const router = useRouter();
  const fullCtx: BookingActionsContext = { ...actionsCtx, routerPush: (h) => router.push(h) };
  const getRowActions = (b: Booking) => getBookingActions(b, fullCtx);

  return (
    <div className="block md:hidden">
      <CardGrid
        data={bookings}
        getCardId={(booking) => booking.id}
        renderCardHeader={({ item }) => {
          const statusColor = statusDotColors[item.status] || "bg-gray-400";
          const isPulsing = item.status === "confirmed" || item.status === "active";
          return (
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                  <CalendarDays size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/bookings/${item.id}`); }}
                    className="text-sm font-bold text-[var(--color-ink)] truncate cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                  >
                    {item.booking_number || `BK-${item.id}`}
                  </h4>
                  <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5 font-medium">
                    {formatDateShort(item.start_date)} – {formatDateShort(item.end_date)}
                  </p>
                </div>
              </div>
              <div className="relative flex-shrink-0 ml-2">
                {isPulsing && <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${statusColor} animate-ping opacity-50`} />}
                <div className={`w-2.5 h-2.5 rounded-full ${statusColor} ${isPulsing ? "animate-pulse" : ""}`} title={statusLabels[item.status]} />
              </div>
            </div>
          );
        }}
        renderCardBody={({ item }) => {
          const client = getClient(clientMap, item.client_id);
          const vehicle = getVehicle(vehicleMap, item.vehicle_id);
          return (
            <>
              <div className="border-t border-[var(--color-surface-border)]/60 pt-2 mt-2" />
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="min-w-0">
                  <p className="font-bold text-[var(--color-ink)] truncate mb-0.5">
                    {client?.full_name || `Client #${item.client_id}`}
                  </p>
                  {client?.phone ? (
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-[11px] text-[var(--color-ink-muted)] truncate font-medium">{client.phone}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[var(--color-ink-subtle)] italic">No phone</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[var(--color-ink)] truncate mb-0.5">
                    {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${item.vehicle_id}`}
                  </p>
                  <p className="text-[11px] font-mono text-[var(--color-ink-muted)] truncate">
                    {vehicle?.plate_number || "—"}
                  </p>
                </div>
              </div>
              <div className="border-t border-[var(--color-surface-border)]/60 pt-1.5 mt-1.5" />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">Rental Cost</span>
                <p className="text-sm font-bold text-[var(--color-primary-text)] tabular-nums">
                  {item.currency_code} {Number(item.total_amount).toLocaleString()}
                </p>
              </div>
            </>
          );
        }}
        rowActions={getRowActions}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={bookings.length}
        pageSize={3}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
