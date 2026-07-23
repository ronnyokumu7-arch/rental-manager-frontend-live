// src/hooks/fleet/useFleetList.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle, VehicleStatus } from "@/lib/types";

export function useFleetList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const [garageVehicle, setGarageVehicle] = useState<Vehicle | null>(null);
  const [garageModalOpen, setGarageModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Strictly typed, no 'any'. Only sends status if it's a valid enum.
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== "") {
        params.status = statusFilter;
      }
      
      const data = await vehiclesApi.list(params);
      setVehicles(data);
    } catch (error) {
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const searchLower = search.toLowerCase();
      return (
        v.make.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        v.plate_number.toLowerCase().includes(searchLower)
      );
    });
  }, [vehicles, search]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / pageSize);
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const rentedVehicles = vehicles.filter((v) => v.status === "rented").length;

  // ✅ SANITIZED: Perfectly aligned with backend lifecycle endpoints & robust error handling
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
        await vehiclesApi.update(id, { status: "awaiting_mileage" });
        toast.success("Trip ended. Vehicle awaiting mileage update.");
      } else if (action === "restore") {
        await vehiclesApi.restore(id);
        toast.success("Vehicle restored to active fleet");
      } else if (action === "retire") {
        await vehiclesApi.retire(id);
        toast.success("Vehicle retired successfully");
      } else {
        await vehiclesApi.update(id, { status: action as VehicleStatus });
        toast.success("Vehicle status updated");
      }
      await fetchVehicles();
    } catch (error: unknown) {
      // ✅ FIXED: Robust error extraction for FastAPI HTTPExceptions
      const err = error as { response?: { data?: { detail?: string } } };
      const errorMsg = err.response?.data?.detail || "Failed to update vehicle";
      toast.error(errorMsg);
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
      await fetchVehicles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to archive vehicle");
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
      await fetchVehicles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to retire vehicle");
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
      await fetchVehicles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to update mileage");
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    loading,
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
