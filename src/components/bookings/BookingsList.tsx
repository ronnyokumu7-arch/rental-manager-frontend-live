"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  CalendarDays,
  Search,
  Filter,
  Loader2,
  Plus,
  Shield,
  ShieldAlert,
  MoreVertical,
  Link as LinkIcon,
  Ban,
  XCircle,
  FileText,
  CalendarPlus,
  Phone,
} from "lucide-react";
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

const statusDotColors: Record<BookingStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  active: "bg-emerald-500",
  completed: "bg-slate-400",
  cancelled: "bg-red-500",
  no_show: "bg-red-500",
  awaiting_mileage: "bg-amber-500",
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
    openDropdownId,
    setOpenDropdownId,
    handleConfirm,
    handleStartTrip,
    handleCompleteTrip,
    handleCancel,
    handleNoShow,
    handleCopyContractLink,
  } = bookingsData;

  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  // Click outside to close active dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdownId !== null && !target.closest(`[data-dropdown-id="${openDropdownId}"]`)) {
        setOpenDropdownId(null);
        setDropdownPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId, setOpenDropdownId]);

  const handleToggleDropdown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      setOpenDropdownId(id);
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const getClient = (clientId: number) => clientMap.get(clientId) || clientMap.get(Number(clientId));
  const getVehicle = (vehicleId: number) => vehicleMap.get(vehicleId) || vehicleMap.get(Number(vehicleId));

  const loading = bookingsLoading || isReferenceDataLoading;
  const activeBooking = paginatedBookings?.find((b: Booking) => b.id === openDropdownId);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300 font-sans">
      {/* ── TOOLBAR (Identical to Clients Page) ── */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        
        {/* Metrics Breakdown Panels */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">New</span>
            <span className="text-xs font-bold text-[var(--color-warning-text)] tabular-nums">{upcomingCount}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
            <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeTripsCount}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-[var(--color-ink-muted)]" />
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Past</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{completedCount}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search & Icon-Only Filter Side by Side */}
          <div className="flex items-center gap-2 flex-1 sm:w-80">
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

            {/* Compact Icon-Only Filter Trigger */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  statusFilter 
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" 
                    : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
                title="Filter by status"
              >
                <Filter size={15} />
              </button>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="awaiting_mileage">Awaiting Mileage</option>
              </select>
            </div>
          </div>

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
          {/* ── MOBILE CARD VIEW ── */}
          <div className="block md:hidden p-4 space-y-3">
            {filteredBookings.map((b: Booking) => {
              const client = getClient(b.client_id);
              const vehicle = getVehicle(b.vehicle_id);
              const isLiveState = b.status === "active" || b.status === "pending" || b.status === "confirmed" || b.status === "awaiting_mileage";

              return (
                <div
                  key={b.id}
                  onClick={() => router.push(`/dashboard/bookings/${b.id}`)}
                  className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer space-y-3 shadow-sm"
                >
                  {/* Top bar inside mobile card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                        <CalendarDays size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[var(--color-ink)] truncate">
                          {b.booking_number || `BK-${b.id}`}
                        </h4>
                        <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5 font-medium">
                          {formatDateShort(b.start_date)} – {formatDateShort(b.end_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {/* Zero-Reflow Pulsing Status Radar */}
                      <span 
                        className="relative flex h-2.5 w-2.5 items-center justify-center" 
                        title={statusLabels[b.status] || b.status}
                      >
                        {isLiveState && (
                          <span 
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusDotColors[b.status] || "bg-slate-400"}`} 
                          />
                        )}
                        <span 
                          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${statusDotColors[b.status] || "bg-slate-400"}`} 
                        />
                      </span>

                      <div className="relative" data-dropdown-id={b.id} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleDropdown(e, b.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all"
                          title="Actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Client & Vehicle Details (Matched to Clients Page design) */}
                  <div className="border-t border-[var(--color-surface-border)]/60 pt-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--color-ink)] truncate">
                          {client?.full_name || `Client #${b.client_id}`}
                        </p>
                        {client?.phone ? (
                          <p className="text-[11px] text-[var(--color-ink-muted)] flex items-center gap-1 truncate mt-0.5 font-medium">
                            <Phone size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                            <span className="truncate">{client.phone}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-[var(--color-ink-subtle)] italic mt-0.5">No phone</p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-[var(--color-ink)] truncate">
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${b.vehicle_id}`}
                        </p>
                        <p className="text-[11px] font-mono text-[var(--color-ink-muted)] truncate mt-0.5">
                          {vehicle?.plate_number || "—"}
                        </p>
                      </div>

                      <div className="col-span-2 border-t border-[var(--color-surface-border)]/40 pt-2 mt-1 flex items-center justify-between text-xs">
                        <span className="text-[var(--color-ink-muted)] font-medium">Total Amount</span>
                        <span className="text-sm font-bold text-[var(--color-primary-text)]">
                          {b.currency_code} {Number(b.total_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP TABLE VIEW ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Booking</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Client</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Vehicle</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Trip Dates</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Amount</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-border)]">
                {paginatedBookings.map((b: Booking) => {
                  const client = getClient(b.client_id);
                  const vehicle = getVehicle(b.vehicle_id);
                  const style = statusStyles[b.status] || statusStyles.completed;
                  
                  return (
                    <tr 
                      key={b.id} 
                      onClick={() => router.push(`/dashboard/bookings/${b.id}`)} 
                      className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                            <CalendarDays size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{b.booking_number || `BK-${b.id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{client?.full_name || `Client #${b.client_id}`}</p>
                          {client?.phone ? (
                            <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1.5 truncate mt-0.5">
                              <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                              <span className="truncate font-medium">{client.phone}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-[var(--color-ink-subtle)] italic mt-0.5">No phone</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${b.vehicle_id}`}</p>
                          <p className="text-xs text-[var(--color-ink-muted)] font-mono">{vehicle?.plate_number || "—"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[var(--color-ink)] truncate whitespace-nowrap">
                          {formatDateShort(b.start_date)} to {formatDateShort(b.end_date)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                          {statusLabels[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[var(--color-ink)]">
                          {b.currency_code} {Number(b.total_amount).toLocaleString()}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <div className="relative" data-dropdown-id={b.id}>
                            <button
                              onClick={(e) => handleToggleDropdown(e, b.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                              title="More Actions"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── SHARED DROPDOWN OVERLAY ── */}
          {openDropdownId !== null && dropdownPos && activeBooking && (
            <div
              className="fixed z-[100] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              style={{ top: dropdownPos.top, right: dropdownPos.right }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => { router.push(`/dashboard/bookings/${activeBooking.id}`); setOpenDropdownId(null); setDropdownPos(null); }} 
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <FileText size={14} /> Manage Booking
              </button>

              <button 
                onClick={() => { handleCopyContractLink(activeBooking.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
              >
                <LinkIcon size={14} /> Send Contract
              </button>

              {activeBooking.status === "pending" && (
                <>
                  <button 
                    onClick={() => { handleConfirm(activeBooking.id); setOpenDropdownId(null); setDropdownPos(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                  >
                    <ShieldAlert size={14} /> Confirm Booking
                  </button>
                  <button 
                    onClick={() => { handleCancel(activeBooking.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                  >
                    <Ban size={14} /> Cancel Booking
                  </button>
                </>
              )}

              {activeBooking.status === "confirmed" && (
                <>
                  <button 
                    onClick={() => { handleStartTrip(activeBooking.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                  >
                    <Shield size={14} /> Start Trip
                  </button>
                  <button 
                    onClick={() => { handleNoShow(activeBooking.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                  >
                    <XCircle size={14} /> Mark No-Show
                  </button>
                  <button 
                    onClick={() => { handleCancel(activeBooking.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                  >
                    <Ban size={14} /> Cancel Booking
                  </button>
                </>
              )}

              {activeBooking.status === "active" && (
                <>
                  <button 
                    onClick={() => { handleCompleteTrip(activeBooking.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                  >
                    <Shield size={14} /> Complete Trip
                  </button>
                  <button 
                    onClick={() => { onExtendBooking(activeBooking); setOpenDropdownId(null); setDropdownPos(null); }} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-primary-text)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                  >
                    <CalendarPlus size={14} /> Extend Booking
                  </button>
                </>
              )}

              {activeBooking.status === "completed" && (
                <button 
                  onClick={() => { onExtendBooking(activeBooking); setOpenDropdownId(null); setDropdownPos(null); }} 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-primary-text)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                >
                  <CalendarPlus size={14} /> Extend Booking
                </button>
              )}
            </div>
          )}

          {/* ── PAGINATION FOOTER (Hidden on mobile) ── */}
          <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
              Showing {(currentPage - 1) * (pageSize || 7) + 1} to {Math.min(currentPage * (pageSize || 7), filteredBookings.length)} of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}