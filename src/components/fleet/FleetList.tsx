// src/components/fleet/FleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Car, Archive, Shield, Coins, ShieldAlert, Loader2, 
  Search, Filter, Ban, Wrench, Plus, Gauge
} from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
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
  openDropdownId: _openDropdownId,
  setOpenDropdownId: _setOpenDropdownId,
  setGarageVehicle,
  setGarageModalOpen,
  handleStatusAction,
  handleArchive,
  handleRetire,
  filteredVehicles,
  paginatedVehicles,
  totalPages,
  totalVehicles: _totalVehicles,
  availableVehicles,
  rentedVehicles,
}: FleetListProps) {
  const router = useRouter();

  const garageVehiclesCount = useMemo(() => {
    return filteredVehicles.filter((v) => v.status === "awaiting_mileage" || v.status === "maintenance").length;
  }, [filteredVehicles]);

  // ✅ Reusable row actions for both table and cards
  const getVehicleActions = (vehicle: Vehicle): RowAction<Vehicle>[] => {
    const actions: RowAction<Vehicle>[] = [
      {
        label: "Vehicle Profile",
        icon: Car,
        onClick: () => router.push(`/dashboard/fleet/${vehicle.id}`),
      },
    ];

    if (vehicle.is_archived) {
      actions.push({
        label: "Restore Vehicle",
        icon: Archive,
        variant: "primary",
        onClick: () => handleStatusAction(vehicle.id, "restore"),
      });
    } else {
      if (vehicle.status === "pending_activation") {
        actions.push({
          label: "Activate Vehicle",
          icon: Shield,
          variant: "primary",
          onClick: () => handleStatusAction(vehicle.id, "activate"),
        });
      }

      if (vehicle.status === "rented") {
        actions.push({
          label: "End Trip",
          icon: ShieldAlert,
          variant: "default",
          onClick: () => handleStatusAction(vehicle.id, "awaiting_mileage"),
        });
      }

      if (vehicle.status === "awaiting_mileage" || vehicle.status === "maintenance") {
        actions.push({
          label: "Update Mileage",
          icon: Wrench,
          variant: "default",
          onClick: () => {
            setGarageVehicle(vehicle);
            setGarageModalOpen(true);
          },
        });
      }

      if (vehicle.status === "maintenance") {
        actions.push({
          label: "Reactivate Vehicle",
          icon: Shield,
          variant: "primary",
          onClick: () => handleStatusAction(vehicle.id, "reactivate"),
        });
      }

      if (vehicle.status === "available") {
        actions.push({
          label: "Send to Maintenance",
          icon: Shield,
          variant: "default",
          onClick: () => handleStatusAction(vehicle.id, "maintenance"),
        });
      }

      // Always show these actions for non-archived vehicles
      actions.push(
        {
          label: "Quick Garage",
          icon: Wrench,
          variant: "default",
          separator: true,
          onClick: () => {
            setGarageVehicle(vehicle);
            setGarageModalOpen(true);
          },
        },
        {
          label: "Archive",
          icon: Archive,
          variant: "default",
          onClick: () => handleArchive(vehicle.id),
        },
        {
          label: "Retire",
          icon: Ban,
          variant: "danger",
          onClick: () => handleRetire(vehicle.id),
        }
      );
    }

    return actions;
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
      {/* METRICS COUNTER STRIP + TOOLBAR */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        
        {/* Metrics Counter Panel */}
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

        {/* Controls: Search + Filter + CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            {/* Search Input */}
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

            {/* ✅ Reusable FilterDropdown */}
<FilterDropdown
  filterId="fleet-status"
  label="Status"
  options={FLEET_FILTER_OPTIONS.filter((opt) => opt.value !== "")}
  value={statusFilter || null}
  onChange={(value) => setStatusFilter((value || "") as VehicleStatus | "")}  // 👈 add || ""
  icon={Filter}
/>
          </div>

          {/* Add Vehicle CTA */}
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
          {/* ✅ MOBILE: Reusable CardGrid (simplified, non-collapsible) */}
          <div className="block md:hidden">
            <CardGrid
              data={paginatedVehicles}
              getCardId={(v) => v.id}
              
              // Header: Icon + Vehicle Name + Stacked Plate/Odometer + Status Dot/Wrench
              renderCardHeader={({ item }) => {
                const statusColors: Record<string, string> = {
                  pending_activation: "bg-amber-500",
                  available: "bg-emerald-500",
                  rented: "bg-[var(--color-primary)]",
                  awaiting_mileage: "bg-amber-500",
                  maintenance: "bg-orange-500",
                  retired: "bg-gray-400",
                };
                const statusColor = statusColors[item.status] || "bg-gray-400";
                const isPulsing = item.status === 'available' || item.status === 'rented';
                
                // Check if due for service (<500KM to next service OR overdue)
                const kmToService = item.next_service_km ? item.next_service_km - item.current_mileage : null;
                const isDueForService = kmToService !== null && kmToService <= 500; // ✅ Includes overdue (<=0)
                
                // Show wrench for: awaiting_mileage OR due for service (including overdue)
                const showWrench = item.status === 'awaiting_mileage' || isDueForService;
                
                return (
                  <div className="flex items-center justify-between w-full min-w-0">
                    {/* Left: Icon + Vehicle Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* ✅ Restored Circular Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                        <Car size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/fleet/${item.id}`);
                          }}
                          className="text-sm font-bold text-[var(--color-ink)] truncate cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                        >
                          {item.make} {item.model}
                        </h4>
                        
                        {/* Stacked: Plate (Top) + Odometer (Bottom) */}
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {/* ✅ Plate Number - Muted Grey Color */}
                          <span className="text-xs text-[var(--color-ink-muted)] truncate font-mono font-medium">
                            {formatPlate(item.plate_number)}
                          </span>

                          {/* Odometer Row */}
                          <div className="flex items-center gap-1">
                            <Gauge size={10} className="text-[var(--color-primary)] flex-shrink-0" />
                            <span className="text-xs text-[var(--color-primary-text)] truncate font-medium font-mono">
                              {item.current_mileage.toLocaleString()} KM
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Status Dot OR Wrench Icon */}
                    <div className="relative flex-shrink-0 ml-2">
                      {showWrench ? (
                        /* ✅ FIXED: Cleaned up comment syntax and wrapped icon in span for tooltip */
                        <span title={
                          kmToService !== null 
                            ? kmToService > 0 
                              ? `Due for service in ${kmToService} KM` 
                              : `Overdue by ${Math.abs(kmToService)} KM`
                            : "Awaiting mileage update"
                        }>
                          <Wrench size={16} className="text-amber-500 animate-pulse" />
                        </span>
                      ) : (
                        /* ✅ FIXED: Cleaned up comment syntax */
                        <>
                          {isPulsing && (
                            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${statusColor} animate-ping opacity-50`} />
                          )}
                          <div 
                            className={`w-2.5 h-2.5 rounded-full ${statusColor} ${isPulsing ? 'animate-pulse' : ''}`}
                            title={statusLabels[item.status]}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              }}
              
              // Body: Divider + Rate/Service with Icons
              renderCardBody={({ item }) => {
                return (
                  <>
                    {/* First Divider */}
                    <div className="border-t border-[var(--color-surface-border)]/60 pt-2 mt-2" />
                    
                    {/* Rate + Next Service */}
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      {/* ✅ Daily Rate with Coins Icon */}
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <Coins size={10} className="text-[var(--color-ink-muted)]" />
                          <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">Daily Rate</p>
                        </div>
                        <p className="text-xs font-bold text-[var(--color-ink)]">
                          KES {Number(item.daily_rate).toLocaleString()}
                        </p>
                      </div>

                      {/* ✅ Next Service with Wrench Icon */}
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <Wrench size={10} className="text-[var(--color-ink-muted)]" />
                          <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">Next Service</p>
                        </div>
                        <p className="text-xs font-mono text-[var(--color-ink)]">
                          {item.next_service_km ? `${item.next_service_km.toLocaleString()} KM` : "—"}
                        </p>
                      </div>
                    </div>
                  </>
                );
              }}
              
              // ✅ Row actions (3-dots menu) - correctly targeted
              rowActions={getVehicleActions}
              
              // Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVehicles.length}
              pageSize={3}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* ✅ DESKTOP: Reusable DataTable */}
          <div className="hidden md:block">
            <DataTable
              data={paginatedVehicles}
              columns={[
                {
                  header: "Vehicle",
                  accessorKey: "make",
                  cell: ({ row }) => {
                    const v = row.original;
                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                          <Car size={16} />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/fleet/${v.id}`);
                            }}
                            className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                          >
                            {v.make} {v.model}
                          </button>
                          <p className="text-xs text-[var(--color-ink-muted)] font-mono truncate">YOM-{v.year}</p>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "Plate",
                  accessorKey: "plate_number",
                  cell: ({ row }) => (
                    <span className="text-sm font-semibold text-[var(--color-ink)] font-mono">
                      {formatPlate(row.original.plate_number)}
                    </span>
                  ),
                },
                {
                  header: "Rate",
                  accessorKey: "daily_rate",
                  cell: ({ row }) => (
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      KES {Number(row.original.daily_rate).toLocaleString()}
                    </span>
                  ),
                },
                {
                  header: "Status",
                  accessorKey: "status",
                  cell: ({ row }) => {
                    const v = row.original;
                    const isArchived = v.is_archived;
                    const displayStatus = isArchived ? "Archived" : statusLabels[v.status] || "Unknown";
                    const style = isArchived
                      ? { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" }
                      : statusStyles[v.status] || statusStyles.retired;
                    
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                        {displayStatus}
                      </span>
                    );
                  },
                },
                {
                  header: "Mileage",
                  accessorKey: "current_mileage",
                  cell: ({ row }) => (
                    <span className="font-mono text-sm text-[var(--color-ink)]">
                      {row.original.current_mileage.toLocaleString()} KM
                    </span>
                  ),
                },
                {
                  header: "Next Service",
                  accessorKey: "next_service_km",
                  cell: ({ row }) => (
                    <span className="font-mono text-sm text-[var(--color-ink-muted)]">
                      {row.original.next_service_km ? `${row.original.next_service_km.toLocaleString()} KM` : "—"}
                    </span>
                  ),
                },
              ]}
              // ✅ Row actions (3-dots menu) - correctly targeted
              rowActions={getVehicleActions}
              getRowId={(v) => v.id}
              onRowClick={(v) => router.push(`/dashboard/fleet/${v.id}`)}
              loading={loading}
              emptyMessage="No vehicles found"
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVehicles.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              viewMode="desktop"
            />
          </div>
        </>
      )}
    </>
  );
}
