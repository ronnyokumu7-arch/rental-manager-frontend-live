// src/hooks/useDashboard.ts
import { useState, useEffect, useMemo } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { tasksApi } from "@/lib/api/tasks";
import { invoicesApi } from "@/lib/api/invoices";
import type { Booking, Client, Vehicle, Task, Invoice } from "@/lib/types";

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all core data in parallel
        const [bookingsData, clientsData, vehiclesData, tasksData, invoicesData] = await Promise.all([
          bookingsApi.list(),
          clientsApi.list(),
          vehiclesApi.list(),
          tasksApi.getMyTasks({ page_size: 50 }),
          invoicesApi.list(),
        ]);

        setBookings(bookingsData || []);
        setClients(clientsData || []);
        setVehicles(vehiclesData || []);
        setTasks(tasksData || []);
        setInvoices(invoicesData || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    // ✅ FIXED: Total collected revenue (paid + partially_paid invoices) with Number() coercion
    const totalRevenue = invoices
      .filter(inv => ["paid", "partially_paid"].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0);

    // ✅ FIXED: Pending payments (outstanding balance) with Number() coercion
    const pendingPayments = invoices
      .filter(inv => ["sent", "overdue", "partially_paid"].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.remaining_balance || 0), 0);

    return { activeBookings, fleetSize, totalClients, mtdRevenue, totalRevenue, pendingPayments };
  }, [bookings, vehicles, clients, invoices]);

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
    vehicles, 
  };
}
