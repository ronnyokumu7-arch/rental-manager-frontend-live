// src/app/dashboard/bookings/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, User, Car, CalendarDays, MapPin,
  DollarSign, CheckCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Client, Vehicle } from "@/lib/types";

const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const selectClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm appearance-none";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function NewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [formData, setFormData] = useState({
    client_id: "",
    vehicle_id: "",
    start_date: "",
    end_date: "",
    pickup_location: "",
    return_location: "",
    destination: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, v] = await Promise.all([clientsApi.list(), vehiclesApi.list()]);
        setClients(c);
        setVehicles(v.filter((item: Vehicle) => item.status === 'available'));
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };
    fetchData();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!formData.start_date || !formData.end_date || !formData.vehicle_id) return 0;
    const vehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
    if (!vehicle) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * Number(vehicle.daily_rate) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.vehicle_id) {
      toast.error("Please select a client and a vehicle.");
      return;
    }

    setLoading(true);
    try {
      const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
      const payload = {
        client_id: Number(formData.client_id),
        vehicle_id: Number(formData.vehicle_id),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        pickup_location: formData.pickup_location || undefined,
        return_location: formData.return_location || undefined,
        destination: formData.destination || undefined,
        total_amount: calculateTotal(),
        currency_code: "KES",
        status: "pending"
      };

      await bookingsApi.create(payload);
      toast.success("Booking created successfully!");
      router.push("/dashboard/bookings");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] p-4 sm:p-8 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push("/dashboard/bookings")} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            <ArrowLeft size={16} /> Back to Bookings
          </button>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Create New Booking</h1>
          <div className="w-24" />
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] rounded-3xl shadow-[var(--shadow-xl)] border border-[var(--color-surface-border)] overflow-hidden p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className={labelClass}>Client <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                <select value={formData.client_id} onChange={(e) => updateField("client_id", e.target.value)} className={`${selectClass} pl-11`} required>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Vehicle <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <Car className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                <select value={formData.vehicle_id} onChange={(e) => updateField("vehicle_id", e.target.value)} className={`${selectClass} pl-11`} required>
                  <option value="">Select an available vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plate_number}) - KES {Number(v.daily_rate).toLocaleString()}/day</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Start Date <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                <input type="date" value={formData.start_date} onChange={(e) => updateField("start_date", e.target.value)} className={`${inputClass} pl-11`} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>End Date <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                <input type="date" value={formData.end_date} onChange={(e) => updateField("end_date", e.target.value)} className={`${inputClass} pl-11`} required />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                <input type="text" value={formData.destination} onChange={(e) => updateField("destination", e.target.value)} placeholder="e.g. Mombasa" className={`${inputClass} pl-11`} />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Pickup Location</label>
              <input type="text" value={formData.pickup_location} onChange={(e) => updateField("pickup_location", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Return Location</label>
              <input type="text" value={formData.return_location} onChange={(e) => updateField("return_location", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">Estimated Total</p>
              <p className="text-2xl font-bold text-[var(--color-ink)] mt-1">KES {calculateTotal().toLocaleString()}</p>
            </div>
            <DollarSign className="text-[var(--color-primary)] opacity-50" size={32} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-surface-border)]">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 shadow-[var(--shadow-md)] transition-all disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
