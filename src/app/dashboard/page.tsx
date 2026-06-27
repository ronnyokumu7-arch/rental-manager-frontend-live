"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Car, Users, TrendingUp, AlertCircle, Clock, CheckCircle2, Wrench } from "lucide-react";
import toast from "react-hot-toast";

// API Clients
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, Client, Vehicle } from "@/lib/types";

// UI Components
import StatCard from "@/components/ui/StatCard";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";
import ActivityFeed from "@/components/ui/ActivityFeed";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Fetch Data in Parallel
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsData, clientsData, vehiclesData] = await Promise.all([
          bookingsApi.list(),
          clientsApi.list(),
          vehiclesApi.list(),
        ]);
        setBookings(bookingsData);
        setClients(clientsData);
        setVehicles(vehiclesData);
      } catch {
        toast.error("Failed to load dashboard data");
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
    
    // MTD Revenue (Current Month)
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

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(b => b.status === 'confirmed' || b.status === 'active')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);
  }, [bookings]);

  const recentActivity = useMemo(() => {
    return bookings.slice(0, 5).map((b, i) => ({
      id: b.id,
      icon: b.status === 'completed' ? CheckCircle2 : Calendar,
      iconBg: b.status === 'completed' ? 'bg-success-bg' : 'bg-accent-bg',
      iconColor: b.status === 'completed' ? 'text-success-text' : 'text-accent-dark',
      title: `Booking #${b.id} ${b.status === 'completed' ? 'completed' : 'created'}`,
      description: `Client ID: ${b.client_id} • Vehicle ID: ${b.vehicle_id}`,
      time: `${i + 1}h ago`,
    }));
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent-dark border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-muted mt-1">Your rental operations at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Bookings" value={stats.activeBookings} subtitle="Currently ongoing" icon={Calendar} variant="dark" />
        <StatCard title="Fleet Size" value={stats.fleetSize} subtitle="Total vehicles" icon={Car} variant="dark" />
        <StatCard title="Total Clients" value={stats.totalClients} subtitle="Registered users" icon={Users} variant="dark" />
        <StatCard title="Revenue (MTD)" value={`KES ${stats.mtdRevenue.toLocaleString()}`} subtitle="This month" icon={TrendingUp} variant="dark" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink">Upcoming Bookings</h3>
              <button onClick={() => router.push('/dashboard/bookings')} className="text-xs text-accent-dark hover:text-accent-darker font-medium">View all</button>
            </div>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-8">No upcoming bookings</p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-border hover:border-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-bg flex items-center justify-center text-accent-dark">
                        <Car size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">Booking #{booking.id}</p>
                        <p className="text-xs text-ink-muted">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={booking.status === 'active' ? 'success' : 'accent'} size="sm">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <h3 className="text-sm font-semibold text-ink mb-4">Recent Activity</h3>
            <ActivityFeed items={recentActivity} />
          </SectionCard>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          <SectionCard>
            <h3 className="text-sm font-semibold text-ink mb-4">Needs Attention</h3>
            <div className="space-y-3">
              {alerts.vehiclesDueService > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-warning-bg/50 border border-warning/20">
                  <Wrench size={18} className="text-warning-text flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warning-text">{alerts.vehiclesDueService} vehicles due service</p>
                    <p className="text-xs text-warning-text/70 mt-0.5">Within 1,000 km</p>
                  </div>
                </div>
              )}
              {alerts.dlsExpiring > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-warning-bg/50 border border-warning/20">
                  <AlertCircle size={18} className="text-warning-text flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warning-text">{alerts.dlsExpiring} DLs expiring</p>
                    <p className="text-xs text-warning-text/70 mt-0.5">Within 30 days</p>
                  </div>
                </div>
              )}
              {alerts.overdueReturns > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-danger-bg/50 border border-danger/20">
                  <Clock size={18} className="text-danger-text flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-danger-text">{alerts.overdueReturns} overdue returns</p>
                    <p className="text-xs text-danger-text/70 mt-0.5">Past end date</p>
                  </div>
                </div>
              )}
              {alerts.vehiclesDueService === 0 && alerts.dlsExpiring === 0 && alerts.overdueReturns === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 size={32} className="text-success mb-2" />
                  <p className="text-sm text-ink-muted">All caught up!</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="text-sm font-semibold text-ink mb-4">Fleet Health</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-success">{vehicles.filter(v => v.status === 'available').length}</p>
                <p className="text-xs text-ink-muted mt-1">Available</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-dark">{vehicles.filter(v => v.status === 'rented').length}</p>
                <p className="text-xs text-ink-muted mt-1">Rented</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning-text">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                <p className="text-xs text-ink-muted mt-1">Maintenance</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
