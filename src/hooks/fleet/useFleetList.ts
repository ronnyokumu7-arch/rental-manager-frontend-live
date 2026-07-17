// src/hooks/fleet/useFleetList.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle, VehicleStatus } from "@/lib/types";

type ViewMode = "active" | "vault";

export function useFleetList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Modal & Action State
  const [garageVehicle, setGarageVehicle] = useState<Vehicle | null>(null);
  const [garageModalOpen, setGarageModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      
      // ✅ Explicitly route to the correct endpoint based on view state
      if (view === "vault") {
        const data = await vehiclesApi.listArchived(params);
        setVehicles(data);
      } else {
        const data = await vehiclesApi.list(params);
        setVehicles(data);
      }
    } catch (error) {
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  }, [view, statusFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  // Filtering Logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch = 
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.plate_number.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [vehicles, search]);

  // Pagination Logic
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / pageSize);

  // Counters
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const rentedVehicles = vehicles.filter((v) => v.status === "rented").length;

  // Action Handlers
  const handleStatusAction = async (id: number, action: string) => {
    setActionLoadingId(id);
    try {
      if (action === "activate") {
        await vehiclesApi.activate(id);
        toast.success("Vehicle activated successfully");
      } else if (action === "maintenance") {
        await vehiclesApi.sendToMaintenance(id);
        toast.success("Vehicle sent to maintenance");
      } else if (action === "reactivate") {
        await vehiclesApi.reactivate(id);
        toast.success("Vehicle reactivated successfully");
      } else if (action === "awaiting_mileage") {
        await vehiclesApi.update(id, { status: "awaiting_mileage" as VehicleStatus });
        toast.success("Trip ended. Vehicle awaiting mileage update.");
      } else if (action === "restore") {
        await vehiclesApi.restore(id);
        toast.success("Vehicle restored to active fleet");
      } else {
        await vehiclesApi.update(id, { status: action as VehicleStatus });
        toast.success(`Vehicle status updated`);
      }
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update vehicle");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Are you sure you want to archive this vehicle?")) return;
    setActionLoadingId(id);
    try {
      await vehiclesApi.archive(id);
      toast.success("Vehicle archived");
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to archive vehicle");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleRetire = async (id: number) => {
    if (!confirm("Are you sure you want to retire this vehicle? This is permanent.")) return;
    setActionLoadingId(id);
    try {
      await vehiclesApi.retire(id);
      toast.success("Vehicle retired");
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to retire vehicle");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleGarageSave = async (payload: { current_mileage: number; next_service_km?: number | null }) => {
    if (!garageVehicle) return;
    setActionLoadingId(garageVehicle.id);
    try {
      await vehiclesApi.updateMileage(garageVehicle.id, payload);
      toast.success("Mileage updated and vehicle is now available!");
      setGarageModalOpen(false);
      setGarageVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update mileage");
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    loading,
    view, setView,
    search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    pageSize,
    garageVehicle, setGarageVehicle,
    garageModalOpen, setGarageModalOpen,
    actionLoadingId,
    openDropdownId, setOpenDropdownId,
    handleStatusAction,
    handleArchive,
    handleRetire,
    handleGarageSave,
    filteredVehicles,
    paginatedVehicles,
    totalPages,
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    refetch: fetchVehicles,
  };
}
