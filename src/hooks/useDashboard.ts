// src/hooks/useDashboard.ts
import { useState, useEffect, useMemo } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { tasksApi } from "@/lib/api/tasks";
import type { Booking, Client, Vehicle, Task } from "@/lib/types";

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all core data in parallel
        const [bookingsData, clientsData, vehiclesData, tasksData] = await Promise.all([
          bookingsApi.list(),
          clientsApi.list(),
          vehiclesApi.list(),
          tasksApi.getMyTasks({ limit: 50 }), 
        ]);

        setBookings(bookingsData);
        setClients(clientsData);
        setVehicles(vehiclesData);
        setTasks(tasksData || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Live Calculations ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
    const fleetSize = vehicles.filter(v => !v.is_archived).length;
    const totalClients = clients.filter(c => !c.is_archived).length;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const mtdRevenue = bookings
      .filter(b => {
        const d = new Date(b.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.status !== 'cancelled';
      })
      .reduce((sum, b) => sum + Number(b.total_amount), 0);

    return { activeBookings, fleetSize, totalClients, mtdRevenue };
  }, [bookings, vehicles, clients]);

  const alerts = useMemo(() => {
    const vehiclesDueService = vehicles.filter(v =>
      v.next_service_km && (v.next_service_km - v.current_mileage) < 1000 && (v.next_service_km - v.current_mileage) >= 0
    ).length;
    
    const dlsExpiring = clients.filter(c => {
      if (!c.dl_expiry) return false;
      const days = Math.ceil((new Date(c.dl_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days < 30;
    }).length;
    
    const overdueReturns = bookings.filter(b => 
      b.status === 'active' && new Date(b.end_date) < new Date()
    ).length;

    return { vehiclesDueService, dlsExpiring, overdueReturns };
  }, [vehicles, clients, bookings]);

  // Unified feed for Upcoming Bookings (uses the same hook data)
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(b => b.status === 'confirmed' || b.status === 'active')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);
  }, [bookings]);

  const recentActivity = useMemo(() => {
    return bookings.slice(0, 5).map((b, i) => ({
      id: b.id,
      icon: b.status === 'completed' ? 'CheckCircle2' : 'Calendar',
      title: `Booking #${b.id} ${b.status === 'completed' ? 'completed' : 'created'}`,
      description: `Client ID: ${b.client_id} • Vehicle ID: ${b.vehicle_id}`,
      time: `${i + 1}h ago`,
    }));
  }, [bookings]);

  return {
    loading,
    stats,
    alerts,
    upcomingBookings,
    recentActivity,
    tasks,
    vehicles, // ✅ This fixes the "vehicles is not defined" error
  };
}
