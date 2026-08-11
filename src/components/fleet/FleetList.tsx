// src/components/fleet/FleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Car, Archive, Shield, ShieldAlert, MoreVertical, Loader2, 
  Search, Filter, Ban, Wrench, Plus, Gauge
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

const FLEET_FILTER_OPTIONS: { value: VehicleStatus | ""; label: string }[] = [
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
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  actionLoadingId: _actionLoading,
  openDropdownId,
  setOpenDropdownId,
  setGarageVehicle,
  setGarageModalOpen,
  handleStatusAction,
  handleArchive,
  handleRetire,
  filteredVehicles,
  paginatedVehicles,
  totalPages,
  totalVehicles: _totalVehicles, // ✅ FIXED: Renamed to suppress unused variable warning
  availableVehicles,
  rentedVehicles,
}: FleetListProps) {
  const router = useRouter();
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const garageVehiclesCount = useMemo(() => {
    return filteredVehicles.filter((v) => v.status === "awaiting_mileage" || v.status === "maintenance").length;
  }, [filteredVehicles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdownId !== null && !target.closest(`[data-dropdown-id="${openDropdownId}"]`)) {
        setOpenDropdownId(null);
        setDropdownPos(null);
      }
      if (showFilterDropdown && !target.closest("[data-filter-dropdown]")) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId, setOpenDropdownId, showFilterDropdown]);

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
          onClick={() => {
            router.push(`/dashboard/fleet/${v.id}`);
            setOpenDropdownId(null);
            setDropdownPos(null);
          }}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <Car size={14} /> Vehicle Profile
        </button>

        {isArchived ? (
          <button
            onClick={() => {
              handleStatusAction(v.id, "restore");
              setOpenDropdownId(null);
              setDropdownPos(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
          >
            <Archive size={14} /> Restore Vehicle
          </button>
        ) : (
          <>
            {v.status === "pending_activation" && (
              <button
                onClick={() => {
                  handleStatusAction(v.id, "activate");
                  setOpenDropdownId(null);
                  setDropdownPos(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Shield size={14} /> Activate Vehicle
              </button>
            )}

            {v.status === "rented" && (
              <button
                onClick={() => {
                  handleStatusAction(v.id, "awaiting_mileage");
                  setOpenDropdownId(null);
                  setDropdownPos(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <ShieldAlert size={14} /> End Trip
              </button>
            )}

            {v.status === "awaiting_mileage" && (
              <button
                onClick={() => {
                  setGarageVehicle(v);
                  setGarageModalOpen(true);
                  setOpenDropdownId(null);
                  setDropdownPos(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Wrench size={14} /> Update Mileage
              </button>
            )}

            {v.status === "maintenance" && (
              <button
                onClick={() => {
                  handleStatusAction(v.id, "reactivate");
                  setOpenDropdownId(null);
                  setDropdownPos(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Shield size={14} /> Reactivate Vehicle
              </button>
            )}

            {v.status === "available" && (
              <button
                onClick={() => {
                  handleStatusAction(v.id, "maintenance");
                  setOpenDropdownId(null);
                  setDropdownPos(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-500/10 transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Shield size={14} /> Send to Maintenance
              </button>
            )}

            <button
              onClick={() => {
                setGarageVehicle(v);
                setGarageModalOpen(true);
                setOpenDropdownId(null);
                setDropdownPos(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Wrench size={14} /> Quick Garage
            </button>

            <button
              onClick={() => {
                handleArchive(v.id);
                setOpenDropdownId(null);
                setDropdownPos(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Archive size={14} /> Archive
            </button>

            <button
              onClick={() => {
                handleRetire(v.id);
                setOpenDropdownId(null);
                setDropdownPos(null);
              }}
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
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading vehicles...
      </div>
    );
  }

  return (
    <>
      {/* METRICS COUNTER STRIP */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Available</span>
            <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{availableVehicles}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Rented</span>
            <span className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">{rentedVehicles}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Garage</span>
            <span className="text-xs font-bold text-amber-500 tabular-nums">{garageVehiclesCount}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search make, model, plate..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>

            {/* ✅ PREMIUM CUSTOM FILTER DROPDOWN - WIRED TO HOOK LOGIC */}
            <div className="relative flex-shrink-0" data-filter-dropdown>
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  statusFilter
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
                title="Filter by status"
              >
                <Filter size={15} />
              </button>

              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                      {/* "All Statuses" - clears filter by setting to empty string "" */}
                      <button
                        onClick={() => {
                          setStatusFilter("");
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                          statusFilter === ""
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                        }`}
                      >
                        All Statuses
                      </button>
                      <div className="h-px bg-[var(--color-surface-border)]" />
                      {/* Filter options - sets filter to specific VehicleStatus value */}
                      {FLEET_FILTER_OPTIONS.filter((opt) => opt.value !== "").map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setStatusFilter(opt.value);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                            statusFilter === opt.value
                              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/fleet/new")}
            className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Content Area */}
      {filteredVehicles.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
            <Car size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No vehicles found</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            {search || statusFilter ? "Try adjusting your search query or filters." : "Add your first vehicle to get started."}
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW */}
          <div className="block md:hidden p-4 space-y-3">
            {filteredVehicles.map((v) => {
              const isArchived = v.is_archived;
              const displayStatus = isArchived ? "Archived" : statusLabels[v.status] || "Unknown";
              const style = isArchived
                ? { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" }
                : statusStyles[v.status] || statusStyles.retired;

              const showWrench = v.status === "awaiting_mileage" || v.status === "maintenance";
              const showPulse = v.status === "rented";

              return (
                <div
                  key={v.id}
                  onClick={() => router.push(`/dashboard/fleet/${v.id}`)}
                  className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer shadow-sm"
                >
                  {/* Top Deck: Avatar + Info + Odometer */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                        <Car size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[var(--color-ink)] truncate leading-tight">
                          {v.make} {v.model}
                        </h4>
                        <p className="text-xs text-[var(--color-ink-muted)] font-mono leading-tight mt-0.5">
                          {formatPlate(v.plate_number)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Gauge size={11} className="text-[var(--color-primary)] flex-shrink-0" />
                          <span className="text-xs font-bold text-[var(--color-primary-text)] font-mono">
                            {v.current_mileage.toLocaleString()} KM
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* ✅ FIXED: Wrapped Wrench in span to support title prop */}
                      {showWrench ? (
                        <span title={displayStatus} className="inline-flex">
                          <Wrench size={16} className={style.text} />
                        </span>
                      ) : (
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${style.bg.replace("/10", "")} ${showPulse ? "animate-pulse" : ""}`}
                          title={displayStatus}
                        />
                      )}
                      <div className="relative" data-dropdown-id={v.id} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleDropdown(e, v.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openDropdownId === v.id && dropdownPos && renderDropdownContent(v)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Deck: Rate & Next Service */}
                  <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">$</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-[var(--color-ink-muted)] font-medium">Daily Rate</p>
                          <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                            KES {Number(v.daily_rate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0">
                          <Wrench size={12} className="text-[var(--color-ink-muted)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-[var(--color-ink-muted)] font-medium">Next Service</p>
                          <p className="text-xs font-mono text-[var(--color-ink)] truncate">
                            {v.next_service_km ? `${v.next_service_km.toLocaleString()} KM` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Plate
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Mileage
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Next Service
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-border)]">
                {paginatedVehicles.map((v) => {
                  const isArchived = v.is_archived;
                  const displayStatus = isArchived ? "Archived" : statusLabels[v.status] || "Unknown";
                  const style = isArchived
                    ? { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" }
                    : statusStyles[v.status] || statusStyles.retired;

                  return (
                    <tr
                      key={v.id}
                      onClick={() => router.push(`/dashboard/fleet/${v.id}`)}
                      className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                            <Car size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{v.make} {v.model}</p>
                            <p className="text-xs text-[var(--color-ink-muted)] font-mono truncate">YOM-{v.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[var(--color-ink)] font-mono">
                          {formatPlate(v.plate_number)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[var(--color-ink)]">
                          KES {Number(v.daily_rate).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-[var(--color-ink)]">
                        {v.current_mileage.toLocaleString()} KM
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-[var(--color-ink-muted)]">
                        {v.next_service_km ? `${v.next_service_km.toLocaleString()} KM` : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <div className="relative" data-dropdown-id={v.id}>
                            <button
                              onClick={(e) => handleToggleDropdown(e, v.id)}
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

          {/* PAGINATION FOOTER */}
          <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredVehicles.length)} of{" "}
              {filteredVehicles.length} vehicles
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}