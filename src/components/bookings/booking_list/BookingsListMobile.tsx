// src/components/bookings/booking_list/BookingsListMobile.tsx
"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Phone, Car, ChevronRight } from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { formatDateShort, statusDotColors, statusLabels } from "./constants";

interface BookingsListMobileProps {
  bookings: Booking[];
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  actionsCtx: Omit<BookingActionsContext, "routerPush">;
}

const getClient = (map: Map<number, Client>, id: number) => map.get(id) || map.get(Number(id));
const getVehicle = (map: Map<number, Vehicle>, id: number) => map.get(id) || map.get(Number(id));

export default function BookingsListMobile({
  bookings, clientMap, vehicleMap,
  actionsCtx,
}: BookingsListMobileProps) {
  const router = useRouter();
  const fullCtx: BookingActionsContext = { ...actionsCtx, routerPush: (h) => router.push(h) };
  const getRowActions = (b: Booking) => getBookingActions(b, fullCtx);

  return (
    <div className="block md:hidden">
      <CardGrid
        data={bookings}
        getCardId={(booking) => booking.id}
        compact={true}
        cardClassName="!p-2.5 hover:!border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200"
        containerClassName="px-2 pb-2"
        maxHeight="calc(100vh - 160px)"
        renderCardHeader={({ item }) => {
          const statusColor = statusDotColors[item.status] || "bg-gray-400";
          const isPulsing = item.status === "confirmed" || item.status === "active";
          const statusLabel = statusLabels[item.status] || item.status;
          
          return (
            <div 
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => router.push(`/dashboard/bookings/${item.id}`)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                    <CalendarDays size={14} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5">
                    <div className={`w-2 h-2 rounded-full ${statusColor} ring-1 ring-[var(--color-surface)] ${
                      isPulsing ? "animate-pulse" : ""
                    }`} />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--color-ink)] truncate">
                      {item.booking_number || `BK-${item.id}`}
                    </span>
                    <span className="text-[8px] font-medium text-[var(--color-ink-muted)] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] whitespace-nowrap">
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                      {formatDateShort(item.start_date)}
                    </span>
                    <span className="text-[8px] text-[var(--color-ink-subtle)]">→</span>
                    <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                      {formatDateShort(item.end_date)}
                    </span>
                  </div>
                </div>
              </div>
              
              <ChevronRight size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
            </div>
          );
        }}
        renderCardBody={({ item }) => {
          const client = getClient(clientMap, item.client_id);
          const vehicle = getVehicle(vehicleMap, item.vehicle_id);
          
          return (
            <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50">
              <div className="flex items-center gap-3">
                {/* Client */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Phone size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                      {client?.full_name || `Client #${item.client_id}`}
                    </p>
                    {client?.phone && (
                      <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                        {client.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vehicle */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Car size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                      {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${item.vehicle_id}`}
                    </p>
                    {vehicle?.plate_number && (
                      <span className="text-[8px] font-mono font-bold text-[var(--color-ink-muted)]">
                        {vehicle.plate_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost - with "Trip Total" label */}
              <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                  Trip Total
                </span>
                <p className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">
                  {item.currency_code} {Number(item.total_amount).toLocaleString()}
                </p>
              </div>
            </div>
          );
        }}
        rowActions={getRowActions}
      />
    </div>
  );
}
