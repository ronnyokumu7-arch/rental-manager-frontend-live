// src/hooks/bookings/useBookingsReferenceData.ts
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Client, Vehicle } from "@/lib/types";

export function useBookingsReferenceData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [clientsData, vehiclesData] = await Promise.all([
          clientsApi.list(),
          vehiclesApi.list(),
        ]);
        setClients(clientsData);
        setVehicles(vehiclesData);
      } catch {
        toast.error("Failed to load reference data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferenceData();
  }, []);

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  return { clientMap, vehicleMap, isLoading };
}
