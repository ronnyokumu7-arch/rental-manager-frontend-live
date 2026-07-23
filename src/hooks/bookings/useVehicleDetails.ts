// src/hooks/bookings/useVehicleDetails.ts
"use client";

import { useEffect, useState, useMemo } from "react";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, Vehicle } from "@/lib/types";

export function useVehicleDetails(booking: Booking | null | undefined) {
  const [fetchedVehicle, setFetchedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if booking already contains populated vehicle object or just ID
  const rawVehicle = (booking as any)?.vehicle || (booking as any)?.vehicle_details || fetchedVehicle;
  const vehicleId = booking?.vehicle_id || (booking as any)?.vehicle?.id;

  useEffect(() => {
    // If vehicle object is already attached on booking, no need to fetch
    if ((booking as any)?.vehicle || (booking as any)?.vehicle_details) {
      setFetchedVehicle(null);
      return;
    }

    // Fallback fetch if only vehicle_id exists
    if (vehicleId && !fetchedVehicle && !loading) {
      setLoading(true);
      vehiclesApi
        .get(vehicleId)
        .then((data) => setFetchedVehicle(data))
        .catch(() => setFetchedVehicle(null))
        .finally(() => setLoading(false));
    }
  }, [booking, vehicleId]);

  return useMemo(() => {
    const vehicle = rawVehicle;

    if (!vehicle) {
      return {
        vehicle: null,
        hasVehicle: false,
        loading,
        formattedStatus: "Unassigned",
        statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        title: "Unassigned Vehicle",
      };
    }

    const statusMap: Record<string, { label: string; style: string }> = {
      available: {
        label: "Fleet Ready",
        style: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      },
      rented: {
        label: "On Road",
        style: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      },
      maintenance: {
        label: "In Service",
        style: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      },
      out_of_service: {
        label: "Grounded",
        style: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      },
    };

    const statusInfo = statusMap[vehicle.status?.toLowerCase()] || {
      label: vehicle.status || "Active",
      style: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border-[var(--color-surface-border)]",
    };

    const make = vehicle.make || vehicle.brand || "";
    const model = vehicle.model || "";
    const title = `${make} ${model}`.trim() || vehicle.name || vehicle.registration_number || "Assigned Vehicle";

    return {
      vehicle,
      hasVehicle: true,
      loading,
      formattedStatus: statusInfo.label,
      statusColor: statusInfo.style,
      title,
    };
  }, [rawVehicle, loading]);
}
