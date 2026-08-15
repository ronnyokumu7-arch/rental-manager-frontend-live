// src/components/bookings/BookingsList.tsx
"use client";

import { useRouter } from "next/navigation";
import { 
  CalendarDays,
  Search,
  Loader2,
  Plus,
  Filter,
  Shield,
  ShieldAlert,
  Link as LinkIcon,
  Ban,
  XCircle,
  FileText,
  CalendarPlus,
  Check,
  Phone,
} from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, BookingStatus, Client, Vehicle } from "@/lib/types";

type BookingsData = any;

interface BookingsListProps {
  bookingsData: BookingsData;
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  isReferenceDataLoading: boolean;
  onExtendBooking: (booking: Booking) => void;
}

const statusStyles: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  confirmed: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  active: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  completed: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  cancelled: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
  no_show: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
  awaiting_mileage: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
  awaiting_mileage: "Awaiting Mileage",
};

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
};

export default function BookingsList({ 
  bookingsData, clientMap, vehicleMap, isReferenceDataLoading, onExtendBooking 
}: BookingsListProps) {
  const router = useRouter();
  
  const {
    loading: bookingsLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredBookings,
    paginatedBookings,
    totalPages,
    upcomingCount,
    activeTripsCount,
    completedCount,
    handleConfirm,
    handleStartTrip,
    handleCompleteTrip,
    handleCancel,
    handleNoShow,
    handleCopyContractLink,
  } = bookingsData;

  // ✅ Reusable row actions for both table and cards
  const getBookingActions = (booking: Booking): RowAction<Booking>[] => {
    const actions: RowAction<Booking>[] = [
      {
        label: "Manage Booking",
        icon: FileText,
        onClick: () => router.push(`/dashboard/bookings/${booking.id}`),
      },
      {
        label: "Send Contract",
        icon: LinkIcon,
        onClick: () => handleCopyContractLink(booking.id),
      },
    ];

    if (booking.status === "pending") {
      actions.push(
        {
          label: "Confirm Booking",
          icon: ShieldAlert,
          variant: "primary",
          onClick: () => handleConfirm(booking.id),
        },
        {
          label: "Cancel Booking",
          icon: Ban,
          variant: "danger",
          onClick: () => handleCancel(booking.id),
        }
      );
    }

    if (booking.status === "confirmed") {
      actions.push(
        {
          label: "Start Trip",
          icon: Shield,
          variant: "primary",
          onClick: () => handleStartTrip(booking.id),
        },
        {
          label: "Mark No-Show",
          icon: XCircle,
          variant: "default",
          onClick: () => handleNoShow(booking.id),
        },
        {
          label: "Cancel Booking",
          icon: Ban,
          variant: "danger",
          onClick: () => handleCancel(booking.id),
        }
      );
    }

    if (booking.status === "active") {
      actions.push(
        {
          label: "Complete Trip",
          icon: Shield,
          variant: "primary",
          onClick: () => handleCompleteTrip(booking.id),
        },
        {
          label: "Extend Booking",
          icon: CalendarPlus,
          variant: "default",
          onClick: () => onExtendBooking(booking),
        }
      );
    }

    if (booking.status === "completed") {
      actions.push({
        label: "Extend Booking",
        icon: CalendarPlus,
        variant: "default",
        onClick: () => onExtendBooking(booking),
      });
    }

    return actions;
  };

  const getClient = (clientId: number) => clientMap.get(clientId) || clientMap.get(Number(clientId));
  const getVehicle = (vehicleId: number) => vehicleMap.get(vehicleId) || vehicleMap.get(Number(vehicleId));

  const loading = bookingsLoading || isReferenceDataLoading;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300 font-sans">
      
      {/* ── TOOLBAR: Metrics + Search + Filter + CTA ── */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        
        {/* Metrics Counter Panel (text-only, no dots) */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">New</span>
            <span className="text-xs font-bold text-[var(--color-warning-text)] tabular-nums">{upcomingCount}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
            <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeTripsCount}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Past</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{completedCount}</span>
          </div>
        </div>

        {/* Controls: Search + Filter + CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-normal"
              />
            </div>

            {/* ✅ Reusable FilterDropdown */}
            <FilterDropdown
              filterId="booking-status"
              label="Status"
              options={[
                { label: "Pending", value: "pending" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Active", value: "active" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
                { label: "No Show", value: "no_show" },
                { label: "Awaiting Mileage", value: "awaiting_mileage" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              icon={Filter}
            />
          </div>

          {/* New Booking CTA */}
          <button
            onClick={() => router.push("/dashboard/bookings/new")}
            className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Booking
          </button>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      {loading ? (
        <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No bookings found</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            {search || statusFilter ? "Try adjusting your search query or filters." : "Create a new booking to start."}
          </p>
        </div>
      ) : (
        <>
{/* ✅ MOBILE: Reusable CardGrid (simplified, non-collapsible) */}
<div className="block md:hidden">
  <CardGrid
    data={paginatedBookings}
    getCardId={(booking) => booking.id}
    
    // Header: Icon + Booking Number + Dates + Status Dot
    renderCardHeader={({ item }) => {
      const statusColors: Record<string, string> = {
        pending: "bg-amber-500",
        confirmed: "bg-[var(--color-primary)]",
        active: "bg-emerald-500",
        completed: "bg-gray-400",
        cancelled: "bg-red-500",
        no_show: "bg-red-500",
        awaiting_mileage: "bg-amber-500",
      };
      const statusColor = statusColors[item.status] || "bg-gray-400";
      const isPulsing = item.status === 'confirmed' || item.status === 'active';
      
      return (
        <div className="flex items-center justify-between w-full min-w-0">
          {/* Left: Icon + Booking Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
              <CalendarDays size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/bookings/${item.id}`);
                }}
                className="text-sm font-bold text-[var(--color-ink)] truncate cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              >
                {item.booking_number || `BK-${item.id}`}
              </h4>
              <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5 font-medium">
                {formatDateShort(item.start_date)} – {formatDateShort(item.end_date)}
              </p>
            </div>
          </div>
          
          {/* Right: Status Dot with Premium Pulse */}
          <div className="relative flex-shrink-0 ml-2">
            {isPulsing && (
              <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${statusColor} animate-ping opacity-50`} />
            )}
            <div 
              className={`w-2.5 h-2.5 rounded-full ${statusColor} ${isPulsing ? 'animate-pulse' : ''}`}
              title={statusLabels[item.status]}
            />
          </div>
        </div>
      );
    }}
    
    // Body: Client & Vehicle + Divider + Rental Cost (Tightened)
    renderCardBody={({ item }) => {
      const client = getClient(item.client_id);
      const vehicle = getVehicle(item.vehicle_id);
      
      return (
        <>
          {/* First Divider */}
          <div className="border-t border-[var(--color-surface-border)]/60 pt-2 mt-2" />
          
          {/* Client & Vehicle Info */}
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

          {/* Second Divider - Tightened */}
          <div className="border-t border-[var(--color-surface-border)]/60 pt-1.5 mt-1.5" />

          {/* Rental Cost - Tightened */}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">Rental Cost</span>
            <p className="text-sm font-bold text-[var(--color-primary-text)] tabular-nums">
              {item.currency_code} {Number(item.total_amount).toLocaleString()}
            </p>
          </div>
        </>
      );
    }}
    
    // ✅ Row actions (3-dots menu) - correctly targeted
    rowActions={getBookingActions}
    
    // Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={filteredBookings.length}
    pageSize={3}
    onPageChange={setCurrentPage}
  />
</div>

          {/* ✅ DESKTOP: Reusable DataTable */}
          <div className="hidden md:block">
            <DataTable
              data={paginatedBookings}
              columns={[
                {
                  header: "Booking",
                  accessorKey: "booking_number",
                  cell: ({ row }) => {
                    const booking = row.original;
                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                          <CalendarDays size={16} />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/bookings/${booking.id}`);
                            }}
                            className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                          >
                            {booking.booking_number || `BK-${booking.id}`}
                          </button>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "Client",
                  accessorKey: "client_id",
                  cell: ({ row }) => {
                    const client = getClient(row.original.client_id);
                    return (
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{client?.full_name || `Client #${row.original.client_id}`}</p>
                        {client?.phone ? (
                          <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1.5 truncate mt-0.5">
                            <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                            <span className="truncate font-medium">{client.phone}</span>
                          </p>
                        ) : (
                          <p className="text-xs text-[var(--color-ink-subtle)] italic mt-0.5">No phone</p>
                        )}
                      </div>
                    );
                  },
                },
                {
                  header: "Vehicle",
                  accessorKey: "vehicle_id",
                  cell: ({ row }) => {
                    const vehicle = getVehicle(row.original.vehicle_id);
                    return (
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-ink)] truncate">{vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${row.original.vehicle_id}`}</p>
                        <p className="text-xs text-[var(--color-ink-muted)] font-mono">{vehicle?.plate_number || "—"}</p>
                      </div>
                    );
                  },
                },
                {
                  header: "Trip Dates",
                  accessorKey: "start_date",
                  cell: ({ row }) => (
                    <p className="text-sm font-medium text-[var(--color-ink)] truncate whitespace-nowrap">
                      {formatDateShort(row.original.start_date)} to {formatDateShort(row.original.end_date)}
                    </p>
                  ),
                },
                {
                  header: "Status",
                  accessorKey: "status",
                  cell: ({ row }) => {
                    const booking = row.original;
                    const style = statusStyles[booking.status] || statusStyles.completed;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                        {booking.status === "active" && <Check size={10} className="text-[var(--color-success)]" />}
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    );
                  },
                },
                {
                  header: "Amount",
                  accessorKey: "total_amount",
                  cell: ({ row }) => (
                    <span className="text-sm font-bold text-[var(--color-ink)]">
                      {row.original.currency_code} {Number(row.original.total_amount).toLocaleString()}
                    </span>
                  ),
                },
              ]}
              // ✅ Row actions (3-dots menu) - correctly targeted
              rowActions={getBookingActions}
              getRowId={(booking) => booking.id}
              onRowClick={(booking) => router.push(`/dashboard/bookings/${booking.id}`)}
              loading={loading}
              emptyMessage="No bookings found"
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBookings.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              viewMode="desktop"
            />
          </div>
        </>
      )}
    </div>
  );
}
