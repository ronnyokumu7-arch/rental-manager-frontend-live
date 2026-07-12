// src/app/dashboard/bookings/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, Plus, Car, User, Archive } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, BookingStatus, Client, Vehicle } from "@/lib/types";

type ViewMode = "active" | "vault";

const statusStyles: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  confirmed: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  active: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  completed: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  cancelled: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
  no_show: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const BOOKING_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsData, clientsData, vehiclesData] = await Promise.all([
        bookingsApi.list(),
        clientsApi.list(),
        vehiclesApi.list(),
      ]);
      setBookings(bookingsData);
      setClients(clientsData);
      setVehicles(vehiclesData);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (view === "active") {
      result = result.filter((b) => !b.is_archived);
    } else {
      result = result.filter((b) => b.is_archived);
    }
    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => {
        const client = clientMap.get(b.client_id);
        const vehicle = vehicleMap.get(b.vehicle_id);
        return (
          b.id.toString().includes(q) ||
          client?.full_name.toLowerCase().includes(q) ||
          vehicle?.plate_number.toLowerCase().includes(q) ||
          vehicle?.make.toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [bookings, view, statusFilter, search, clientMap, vehicleMap]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <CalendarDays size={20} />
            </div>
            Bookings
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {view === "active" ? "Manage quotations, rentals, and trip lifecycles" : "Archived booking records"}
          </p>
        </div>
        {view === "active" && (
          <button
            onClick={() => router.push("/dashboard/bookings/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
          >
            <Plus size={16} /> New Booking
          </button>
        )}
      </div>

      {/* Premium Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)]">
            <button
              onClick={() => setView("active")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === "active"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setView("vault")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                view === "vault"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Archive size={12} /> Vault
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, client, or plate..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none"
            >
              <option value="">All Statuses</option>
              {BOOKING_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)]">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              {view === "active" ? "No bookings found" : "No archived bookings"}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || statusFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Create a new booking to generate a quotation and start the rental lifecycle."
                : "Archived bookings will appear here."}
            </p>
            {view === "active" && !search && !statusFilter && (
              <button
                onClick={() => router.push("/dashboard/bookings/new")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
              >
                <Plus size={16} /> New Booking
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Booking</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Vehicle</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Trip Dates</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Amount</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-border)]">
                  {paginatedBookings.map((b) => {
                    const client = clientMap.get(b.client_id);
                    const vehicle = vehicleMap.get(b.vehicle_id);
                    const style = statusStyles[b.status] || statusStyles.completed;
                    const start = new Date(b.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const end = new Date(b.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    
                    return (
                      <tr
                        key={b.id}
                        onClick={() => router.push(`/dashboard/bookings/${b.id}`)}
                        className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-primary-muted)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                              <CalendarDays size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[var(--color-ink)] truncate">Booking #{b.id}</p>
                              <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1 truncate">
                                <User size={10} /> {client?.full_name || `Client #${b.client_id}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <Car size={14} className="text-[var(--color-ink-muted)] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                                {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${b.vehicle_id}`}
                              </p>
                              <p className="text-xs text-[var(--color-ink-muted)] font-mono">{vehicle?.plate_number || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[var(--color-ink-muted)] whitespace-nowrap">
                            {start} — {end}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                            {statusLabels[b.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-[var(--color-ink)]">
                            {b.currency_code} {Number(b.total_amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/bookings/${b.id}`); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                              title="View Booking Profile"
                            >
                              <ChevronRight size={14} />
                            </button>
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
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredBookings.length)} of{" "}
                {filteredBookings.length} bookings
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
