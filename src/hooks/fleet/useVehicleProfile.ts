// src/hooks/fleet/useVehicleProfile.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle, VehicleUpdate } from "@/lib/types";

export function useVehicleProfile(vehicleId: number) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const data = await vehiclesApi.get(vehicleId);
      setVehicle(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to load vehicle");
      router.push("/dashboard/fleet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const handleUpdate = async (updates: VehicleUpdate) => {
    setActionLoading("update");
    try {
      const updated = await vehiclesApi.update(vehicleId, updates);
      setVehicle(updated);
      setIsEditing(false);
      toast.success("Vehicle telemetry updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update vehicle");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusAction = async (action: "activate" | "maintenance" | "reactivate" | "retire" | "archive" | "restore") => {
    setActionLoading(action);
    try {
      let updated: Vehicle;
      switch (action) {
        case "activate":
          updated = await vehiclesApi.activate(vehicleId);
          toast.success("Vehicle activated and added to available fleet");
          break;
        case "maintenance":
          updated = await vehiclesApi.sendToMaintenance(vehicleId);
          toast.success("Vehicle sent to maintenance");
          break;
        case "reactivate":
          updated = await vehiclesApi.reactivate(vehicleId);
          toast.success("Vehicle reactivated and available");
          break;
        case "retire":
          updated = await vehiclesApi.retire(vehicleId);
          toast.success("Vehicle retired from active fleet");
          break;
        case "archive":
          updated = await vehiclesApi.archive(vehicleId);
          toast.success("Vehicle archived");
          router.push("/dashboard/fleet");
          return;
        case "restore":
          updated = await vehiclesApi.restore(vehicleId);
          toast.success("Vehicle restored to active fleet");
          break;
      }
      setVehicle(updated);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} vehicle`);
    } finally {
      setActionLoading(null);
    }
  };

  return {
    vehicle,
    loading,
    isEditing,
    setIsEditing,
    actionLoading,
    handleUpdate,
    handleStatusAction,
    refetch: fetchVehicle,
  };
}
