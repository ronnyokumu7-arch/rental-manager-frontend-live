// src/components/profile/SmartProfileViewer.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, User, Car, CalendarDays, FileText, AlertCircle } from "lucide-react";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { bookingsApi } from "@/lib/api/bookings";
import type { Task, Client, Vehicle, Booking } from "@/lib/types";

import InlineClientViewer from "./viewers/InlineClientViewer";
import InlineVehicleViewer from "./viewers/InlineVehicleViewer";
import InlineBookingViewer from "./viewers/InlineBookingViewer";

interface SmartProfileViewerProps {
  task: Task;
}

const TARGET_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  vehicle: { icon: Car, label: "Vehicle Profile", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50" },
  client: { icon: User, label: "Client Profile", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50" },
  booking: { icon: CalendarDays, label: "Booking Profile", color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50" },
};

export default function SmartProfileViewer({ task }: SmartProfileViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [bookingData, setBookingData] = useState<Booking | null>(null);

  const config = TARGET_CONFIG[task.target_type || ""] || { 
    icon: FileText, 
    label: "Task Details", 
    color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" 
  };
  const Icon = config.icon;

  const fetchData = useCallback(async () => {
    if (!task.target_type || !task.target_id) return;
    setLoading(true);
    setError(null);
    try {
      if (task.target_type === "client") setClientData(await clientsApi.get(task.target_id));
      else if (task.target_type === "vehicle") setVehicleData(await vehiclesApi.get(task.target_id));
      else if (task.target_type === "booking") setBookingData(await bookingsApi.getById(task.target_id));
    } catch (err) {
      setError("Failed to load resource details. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  }, [task.target_type, task.target_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
            <p className="text-xs text-slate-500">Loading resource details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <p className="text-xs text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <>
            {task.target_type === "client" && clientData && (
              <InlineClientViewer client={clientData} taskId={task.id} task={task} onRefresh={fetchData} />
            )}
            {task.target_type === "vehicle" && vehicleData && (
              <InlineVehicleViewer vehicle={vehicleData} task={task} onRefresh={fetchData} />
            )}
            {task.target_type === "booking" && bookingData && (
              <InlineBookingViewer booking={bookingData} task={task} onRefresh={fetchData} />
            )}
            {!clientData && !vehicleData && !bookingData && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${config.color}`}>
                  <Icon size={28} />
                </div>
                <p className="text-xs text-slate-500">Select a task with a valid resource link to view details here.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
