// src/components/bookings/BookingsList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  CalendarDays, Search, Filter, ChevronDown, Loader2, Plus,
  Shield, ShieldAlert, MoreVertical, Link as LinkIcon, Ban, XCircle, FileText, CalendarPlus
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
  pending: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  confirmed: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  active: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  awaiting_mileage: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  completed: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  cancelled: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
  no_show: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending", confirmed: "Confirmed", active: "Active",
  awaiting_mileage: "Awaiting Mileage", completed: "Completed",
  cancelled: "Cancelled", no_show: "No Show",
};

const BOOKING_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" }, { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active" }, { value: "awaiting_mileage", label: "Awaiting Mileage" },
  { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const formatDateShort = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
};

export default function BookingsList({ 
  bookingsData, clientMap, vehicleMap, isReferenceDataLoading, onExtendBooking 
}: BookingsListProps) {
  const router = useRouter();
  
  const {
    loading: bookingsLoading, search, setSearch, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, filteredBookings, paginatedBookings, totalPages,
    upcomingCount, activeTripsCount, completedCount, actionLoadingId, openDropdownId, setOpenDropdownId,
    handleConfirm, handleStartTrip, handleCompleteTrip, handleCancel, handleNoShow, handleCopyContractLink,
  } = bookingsData;

  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

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
      const dropdownHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const positionAbove = spaceBelow < dropdownHeight;
      
      setDropdownPos({
        top: positionAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const loading = bookingsLoading || isReferenceDataLoading;

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings...
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
          <CalendarDays size={24} className="text-[var(--color-ink-subtle)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No bookings found</h3>
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          {search || statusFilter ? "Try adjusting your search or filters." : "Create a new booking to start the rental lifecycle."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="hidden md:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Upcoming</span>
              <span className="text-xs font-bold text-[var(--color-warning-text)] tabular-nums">{upcomingCount}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeTripsCount}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-ink-muted)]" />
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Completed</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{completedCount}</span>
            </div>
          </div>
        </div>
        
        {/* ✅ FAR RIGHT SIDE TOOLBAR ACTIONS */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search ID, client, or plate..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm" 
            />
          </div>
          <div className="relative w-full lg:w-48">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
            <select 
              value={statusFilter || ""} 
              onChange={(e) => setStatusFilter(e.target.value || null)} 
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {BOOKING_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* ✅ NEW BOOKING BUTTON: Placed at the far right of the toolbar */}
          <button
            onClick={() => router.push("/dashboard/bookings/new")}
            className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Booking
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
              const client = clientMap.get(b.client_id);
              const vehicle = vehicleMap.get(b.vehicle_id);
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
                        <p className="text-sm font-bold text-[var(--color-ink)] truncate">{b.booking_number || `BK-${b.id}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{client?.full_name || `Client #${b.client_id}`}</p>
                      <p className="text-xs text-[var(--color-ink-muted)] truncate">{client?.phone || "No phone"}</p>
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
                      {statusLabels[b.status]}
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

                        {openDropdownId === b.id && dropdownPos && (
                          <div 
                            className="fixed z-[100] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                            style={{ top: dropdownPos.top, right: dropdownPos.right }}
                          >
                            <button 
                              onClick={() => { router.push(`/dashboard/bookings/${b.id}`); setOpenDropdownId(null); setDropdownPos(null); }} 
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                              <FileText size={14} /> Manage Booking
                            </button>
                            <button 
                              onClick={() => { handleCopyContractLink(b.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                            >
                              <LinkIcon size={14} /> Send Contract
                            </button>
                            
                            {b.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => { handleConfirm(b.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <ShieldAlert size={14} /> Confirm Booking
                                </button>
                                <button 
                                  onClick={() => { handleCancel(b.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <Ban size={14} /> Cancel Booking
                                </button>
                              </>
                            )}

                            {b.status === "confirmed" && (
                              <>
                                <button 
                                  onClick={() => { handleStartTrip(b.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <Shield size={14} /> Start Trip
                                </button>
                                <button 
                                  onClick={() => { handleNoShow(b.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <XCircle size={14} /> Mark No-Show
                                </button>
                                <button 
                                  onClick={() => { handleCancel(b.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <Ban size={14} /> Cancel Booking
                                </button>
                              </>
                            )}

                            {b.status === "active" && (
                              <>
                                <button 
                                  onClick={() => { handleCompleteTrip(b.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <Shield size={14} /> Complete Trip
                                </button>
                                <button 
                                  onClick={() => { onExtendBooking(b); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-primary-text)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <CalendarPlus size={14} /> Extend Booking
                                </button>
                              </>
                            )}

                            {b.status === "completed" && (
                              <button 
                                onClick={() => { onExtendBooking(b); setOpenDropdownId(null); setDropdownPos(null); }} 
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-primary-text)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                              >
                                <CalendarPlus size={14} /> Extend Booking
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-[var(--color-surface-border)] flex items-center justify-between">
        <p className="text-xs text-[var(--color-ink-muted)]">
          Showing {(currentPage - 1) * 7 + 1} to {Math.min(currentPage * 7, filteredBookings.length)} of {filteredBookings.length} bookings
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
    </div>
  );
}
