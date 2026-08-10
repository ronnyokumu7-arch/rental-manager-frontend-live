// src/components/fleet/FleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Car, Archive, Shield, ShieldAlert, MoreVertical, Loader2, 
  Search, Filter, Ban, Wrench, Plus
} from "lucide-react";
import type { Vehicle, VehicleStatus } from "@/lib/types";

interface FleetListProps {
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: VehicleStatus | "";
  setStatusFilter: (status: VehicleStatus | "") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  actionLoadingId: number | null;
  openDropdownId: number | null;
  setOpenDropdownId: (id: number | null) => void;
  setGarageVehicle: (v: Vehicle | null) => void;
  setGarageModalOpen: (open: boolean) => void;
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
  filteredVehicles: Vehicle[];
  paginatedVehicles: Vehicle[];
  totalPages: number;
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
}

const FLEET_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending_activation", label: "Pending Activation" },
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "awaiting_mileage", label: "Awaiting Mileage" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
];

const statusStyles: Record<VehicleStatus, { bg: string; text: string }> = {
  pending_activation: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  available: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  rented: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  awaiting_mileage: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  maintenance: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  retired: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
};

const statusLabels: Record<VehicleStatus, string> = {
  pending_activation: "Pending",
  available: "Available",
  rented: "Rented",
  awaiting_mileage: "Awaiting Mileage",
  maintenance: "Maintenance",
  retired: "Retired",
};

const formatPlate = (plate: string) => plate.replace(/([A-Za-z])(\d)/, "$1 $2").toUpperCase();

export default function FleetList({
  loading, search, setSearch, statusFilter, setStatusFilter,
  currentPage, setCurrentPage, pageSize, actionLoadingId:_actionLoading, openDropdownId, setOpenDropdownId,
  setGarageVehicle, setGarageModalOpen, handleStatusAction, handleArchive, handleRetire,
  filteredVehicles, paginatedVehicles, totalPages, totalVehicles, availableVehicles, rentedVehicles,
}: FleetListProps) {
  const router = useRouter();
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
      const dropdownHeight = 260; 
      const spaceBelow = window.innerHeight - rect.bottom;
      const positionAbove = spaceBelow < dropdownHeight;
      
      setDropdownPos({
        top: positionAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    }
  };

  const renderDropdownContent = (v: Vehicle) => {
    const isArchived = v.is_archived;
    return (
      <div 
        className="fixed z-[100] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        style={{ top: dropdownPos?.top, right: dropdownPos?.right }}
      >
        <button
          onClick={() => { router.push(`/dashboard/fleet/${v.id}`); setOpenDropdownId(null); setDropdownPos(null); }}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <Car size={14} /> Vehicle Profile
        </button>

        {isArchived ? (
          <button
            onClick={() => { handleStatusAction(v.id, "restore"); setOpenDropdownId(null); setDropdownPos(null); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
          >
            <Archive size={14} /> Restore Vehicle
          </button>
        ) : (
          <>
            {v.status === "pending_activation" && (
              <button
                onClick={() => { handleStatusAction(v.id, "activate"); setOpenDropdownId(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Shield size={14} /> Activate Vehicle
              </button>
            )}
            
            {v.status === "rented" && (
              <button
                onClick={() => { handleStatusAction(v.id, "awaiting_mileage"); setOpenDropdownId(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <ShieldAlert size={14} /> End Trip
              </button>
            )}
            
            {v.status === "awaiting_mileage" && (
              <button
                onClick={() => { setGarageVehicle(v); setGarageModalOpen(true); setOpenDropdownId(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Wrench size={14} /> Update Mileage
              </button>
            )}
            
            {v.status === "maintenance" && (
              <button
                onClick={() => { handleStatusAction(v.id, "reactivate"); setOpenDropdownId(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Shield size={14} /> Reactivate Vehicle
              </button>
            )}
            
            {v.status === "available" && (
              <button
                onClick={() => { handleStatusAction(v.id, "maintenance"); setOpenDropdownId(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Shield size={14} /> Send to Maintenance
              </button>
            )}

            <button
              onClick={() => { setGarageVehicle(v); setGarageModalOpen(true); setOpenDropdownId(null); setDropdownPos(null); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Wrench size={14} /> Quick Garage
            </button>
            
            <button
              onClick={() => { handleArchive(v.id); setOpenDropdownId(null); setDropdownPos(null); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Archive size={14} /> Archive
            </button>
            
            <button
              onClick={() => { handleRetire(v.id); setOpenDropdownId(null); setDropdownPos(null); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Ban size={14} /> Retire
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading vehicles...
      </div>
    );
  }

  return (
    /* SINGLE MAIN CARD CONTAINER */
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-3.5 sm:p-4 space-y-3.5 animate-in fade-in duration-300">
      
      {/* STATIC METRIC COUNTER STRIP */}
      <div className="bg-[var(--color-surface-hover)]/60 border border-[var(--color-surface-border)]/60 px-3.5 py-2.5 rounded-xl flex items-center justify-around text-xs text-[var(--color-ink-muted)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          <span className="font-medium">Total</span>
          <span className="font-bold text-[var(--color-ink)] tabular-nums">{totalVehicles}</span>
        </div>
        <div className="w-px h-3.5 bg-[var(--color-surface-border)]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span className="font-medium">Available</span>
          <span className="font-bold text-[var(--color-success-text)] tabular-nums">{availableVehicles}</span>
        </div>
        <div className="w-px h-3.5 bg-[var(--color-surface-border)]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-medium">Rented</span>
          <span className="font-bold text-[var(--color-primary-text)] tabular-nums">{rentedVehicles}</span>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="space-y-2.5">
        {/* Search Input & Icon-Only Filter Button Side-by-Side */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search make, model, plate..." 
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-xs sm:text-sm" 
            />
          </div>

          {/* Compact Icon-Only Status Filter Button */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                statusFilter 
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" 
                  : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
              title="Filter by status"
            >
              <Filter size={16} />
            </button>
            <select 
              value={statusFilter || ""} 
              onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | "")} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            >
              {FLEET_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Full-width Add Button */}
        <button
          onClick={() => router.push("/dashboard/fleet/new")}
          className="w-full h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Vehicle
        </button>
      </div>

      {/* VEHICLE CARDS / TABLE LIST */}
      {filteredVehicles.length === 0 ? (
        <div className="p-8 text-center bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-surface-border)]/60">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-3">
            <Car size={20} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">No vehicles found</h3>
          <p className="text-xs text-[var(--color-ink-muted)]">
            {search || statusFilter ? "Try adjusting your search or status filter." : "Add your first vehicle to get started."}
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW */}
          <div className="space-y-2.5 md:hidden">
            {filteredVehicles.map((v) => {
              const isArchived = v.is_archived;
              const displayStatus = isArchived ? "Archived" : (statusLabels[v.status] || "Unknown");
              const style = isArchived 
                ? { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" }
                : (statusStyles[v.status] || statusStyles.retired);

              return (
                <div 
                  key={v.id}
                  onClick={() => router.push(`/dashboard/fleet/${v.id}`)}
                  className="bg-[var(--color-surface)] border border-[var(--color-surface-border)]/90 hover:border-[var(--color-primary)]/40 rounded-xl p-3 transition-all cursor-pointer space-y-2.5 shadow-xs active:bg-[var(--color-surface-hover)]/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] flex-shrink-0">
                        <Car size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] truncate leading-tight">
                          {v.make} {v.model}
                        </h4>
                        <p className="text-[11px] text-[var(--color-ink-muted)] font-mono leading-tight mt-0.5">
                          YOM-{v.year} • <span className="font-bold text-[var(--color-ink)]">{formatPlate(v.plate_number)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                        {displayStatus}
                      </span>
                      <div className="relative" data-dropdown-id={v.id}>
                        <button
                          onClick={(e) => handleToggleDropdown(e, v.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openDropdownId === v.id && dropdownPos && renderDropdownContent(v)}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-[var(--color-surface-border)]/60" />

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">Daily Rate</span>
                      <span className="font-bold text-[var(--color-ink)] text-[11px] sm:text-xs">KES {Number(v.daily_rate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">Mileage</span>
                      <span className="font-semibold text-[var(--color-ink)] font-mono text-[11px] sm:text-xs">{v.current_mileage.toLocaleString()} KM</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">Next Service</span>
                      <span className="font-semibold text-[var(--color-ink-muted)] font-mono text-[11px] sm:text-xs">
                        {v.next_service_km ? `${v.next_service_km.toLocaleString()} KM` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--color-surface-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Vehicle</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Plate</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Rate</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Mileage</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Next Service</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-border)]">
                {paginatedVehicles.map((v) => {
                  const isArchived = v.is_archived;
                  const displayStatus = isArchived ? "Archived" : (statusLabels[v.status] || "Unknown");
                  const style = isArchived 
                    ? { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" }
                    : (statusStyles[v.status] || statusStyles.retired);
                  
                  return (
                    <tr 
                      key={v.id} 
                      onClick={() => router.push(`/dashboard/fleet/${v.id}`)} 
                      className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] flex-shrink-0">
                            <Car size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--color-ink)] truncate">{v.make} {v.model}</p>
                            <p className="text-[10px] text-[var(--color-ink-muted)] font-mono">YOM-{v.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-[var(--color-ink)] font-mono">
                          {formatPlate(v.plate_number)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-[var(--color-ink)]">
                          KES {Number(v.daily_rate).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-ink)]">
                        {v.current_mileage.toLocaleString()} KM
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-ink-muted)]">
                        {v.next_service_km ? `${v.next_service_km.toLocaleString()} KM` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <div className="relative" data-dropdown-id={v.id}>
                            <button
                              onClick={(e) => handleToggleDropdown(e, v.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openDropdownId === v.id && dropdownPos && renderDropdownContent(v)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DESKTOP PAGINATION */}
          <div className="pt-2 hidden md:flex items-center justify-between">
            <p className="text-xs text-[var(--color-ink-muted)]">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                {currentPage} / {totalPages || 1}
              </span>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
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
  );
}
