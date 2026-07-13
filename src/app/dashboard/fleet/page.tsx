// src/app/dashboard/fleet/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Car, Plus, Wrench, ChevronRight, Archive } from "lucide-react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle, VehicleStatus, VehicleUpdatePayload } from "@/lib/types";
import QuickGarageModal from "@/components/ui/QuickGarageModal";

type ViewMode = "active" | "vault";

const FLEET_FILTER_OPTIONS = [
  { value: "pending_activation", label: "Pending Activation" },
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
];

const statusStyles: Record<VehicleStatus, { bg: string; text: string }> = {
  pending_activation: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  available: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  rented: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  maintenance: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  retired: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
};

const statusLabels: Record<VehicleStatus, string> = {
  pending_activation: "Pending",
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance",
  retired: "Retired",
};

export default function FleetPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // ✅ LOCKED DOWN: Exactly 7 rows per page to eliminate internal scrolling
  const pageSize = 7;

  const [garageVehicle, setGarageVehicle] = useState<Vehicle | null>(null);
  const [garageModalOpen, setGarageModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await vehiclesApi.list();
      setVehicles(data);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  const handleGarageSave = async (data: VehicleUpdatePayload) => {
    if (!garageVehicle) return;
    try {
      await vehiclesApi.update(garageVehicle.id, data);
      toast.success("Vehicle updated successfully");
      setGarageModalOpen(false);
      setGarageVehicle(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update vehicle");
    }
  };

  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    if (view === "vault") {
      result = result.filter((v) => v.is_archived === true);
    } else {
      result = result.filter((v) => v.is_archived !== true);
    }
    if (statusFilter) {
      result = result.filter((v) => v.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.plate_number.toLowerCase().includes(q)
      );
    }
    return result;
  }, [vehicles, view, statusFilter, search]);

  const totalPages = Math.ceil(filteredVehicles.length / pageSize);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  // ✅ Fleet Counter Calculations (Active fleet only)
  const totalVehicles = vehicles.filter(v => !v.is_archived).length;
  const availableVehicles = vehicles.filter(v => v.status === 'available' && !v.is_archived).length;
  const rentedVehicles = vehicles.filter(v => v.status === 'rented' && !v.is_archived).length;

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Car size={20} />
            </div>
            Fleet
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {view === "active" ? "Manage your vehicles and maintenance" : "Archived vehicle records"}
          </p>
        </div>
        {view === "active" && (
          <button
            onClick={() => router.push("/dashboard/fleet/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all active:scale-95"
          >
            <Plus size={16} /> Add Vehicle
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

          {/* ✅ FLEET COUNTERS: Integrated into toolbar, minimal design */}
          {view === "active" && (
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-ink-muted)] font-medium">Fleet Size</span>
                <span className="text-[var(--color-ink)] font-bold tabular-nums">{totalVehicles}</span>
              </div>
              <div className="w-px h-4 bg-[var(--color-surface-border)]" />
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-ink-muted)] font-medium">Available</span>
                <span className="text-[var(--color-success-text)] font-bold tabular-nums">{availableVehicles}</span>
              </div>
              <div className="w-px h-4 bg-[var(--color-surface-border)]" />
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-ink-muted)] font-medium">Rented</span>
                <span className="text-[var(--color-primary-text)] font-bold tabular-nums">{rentedVehicles}</span>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search make, model, plate..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none"
            >
              <option value="">All Statuses</option>
              {FLEET_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)]">Loading vehicles...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <Car size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              {view === "active" ? "No vehicles found" : "No vehicles in vault"}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || statusFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Add your first vehicle to get started."
                : "Archived vehicles will appear here."}
            </p>
            {view === "active" && !search && !statusFilter && (
              <button
                onClick={() => router.push("/dashboard/fleet/new")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95"
              >
                <Plus size={16} /> Add Vehicle
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
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Vehicle</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Plate</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Rate</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Mileage</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Next Service</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-border)]">
                  {paginatedVehicles.map((v) => {
                    const style = statusStyles[v.status] || statusStyles.retired;
                    return (
                      <tr
                        key={v.id}
                        onClick={() => router.push(`/dashboard/fleet/${v.id}`)}
                        className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] flex-shrink-0">
                              <Car size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{v.make} {v.model}</p>
                              <p className="text-xs text-[var(--color-ink-muted)] truncate">{v.year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-[var(--color-ink)] font-mono">{v.plate_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-[var(--color-ink)]">KES {Number(v.daily_rate).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                            {statusLabels[v.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-[var(--color-ink)]">{v.current_mileage.toLocaleString()} km</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                            {v.next_service_km ? `${v.next_service_km.toLocaleString()} km` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/fleet/${v.id}`); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all active:scale-95"
                              title="View Vehicle"
                            >
                              <ChevronRight size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setGarageVehicle(v); setGarageModalOpen(true); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-warning)] hover:text-white transition-all active:scale-95"
                              title="Quick Garage"
                            >
                              <Wrench size={14} />
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
                {Math.min(currentPage * pageSize, filteredVehicles.length)} of{" "}
                {filteredVehicles.length} vehicles
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Quick Garage Modal */}
      <QuickGarageModal
        vehicle={garageVehicle}
        open={garageModalOpen}
        onClose={() => {
          setGarageModalOpen(false);
          setGarageVehicle(null);
        }}
        onSave={handleGarageSave}
      />
    </div>
  );
}
