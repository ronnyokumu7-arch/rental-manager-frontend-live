// src/app/dashboard/bookings/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, User, Car, CalendarDays, MapPin,
  DollarSign, FileText, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Client, Vehicle } from "@/lib/types";

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const selectClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm appearance-none";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

const steps = [
  { id: 1, label: "Identity", icon: User },
  { id: 2, label: "Trip Details", icon: MapPin },
  { id: 3, label: "Review", icon: CheckCircle },
];

export default function NewBookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState({
    client_id: "",
    vehicle_id: "",
    start_date: "",
    end_date: "",
    pickup_location: "",
    return_location: "",
    destination: "",
    notes: "",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, vehiclesData] = await Promise.all([
          clientsApi.list(), // Adjust if your API method is different
          vehiclesApi.list() // Adjust if your API method is different
        ]);
        setClients(clientsData);
        setVehicles(vehiclesData.filter((v: Vehicle) => v.status === 'available'));
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchData();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'vehicle_id') {
      const vehicle = vehicles.find((v) => v.id.toString() === value);
      setSelectedVehicle(vehicle || null);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.client_id || !formData.vehicle_id || !formData.start_date || !formData.end_date) {
        toast.error("Please fill in all required identity fields.");
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const calculateTotal = () => {
    if (!selectedVehicle) return 0;
    return Number(selectedVehicle.daily_rate) * calculateDays();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingsApi.create({
        client_id: parseInt(formData.client_id),
        vehicle_id: parseInt(formData.vehicle_id),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        pickup_location: formData.pickup_location || null,
        return_location: formData.return_location || null,
        destination: formData.destination || null,
        daily_rate: selectedVehicle?.daily_rate || 0,
        total_amount: calculateTotal(),
        notes: formData.notes || null,
      });
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
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard/bookings")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Bookings
          </button>
          <h1 className="text-xl font-bold text-[var(--color-ink)] hidden sm:block">Create New Booking</h1>
          <div className="w-24" /> {/* Spacer for balance */}
        </div>

        {/* Wizard Card */}
        <div className="bg-[var(--color-surface)] rounded-3xl shadow-[var(--shadow-xl)] border border-[var(--color-surface-border)] overflow-hidden">
          
          {/* Step Indicator */}
          <div className="px-8 py-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? "bg-[var(--color-primary)] text-white shadow-[0_0_0_4px_var(--color-primary-muted)]" 
                          : isCompleted 
                            ? "bg-[var(--color-success)] text-white" 
                            : "bg-[var(--color-surface)] border-2 border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]"
                      }`}>
                        {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                      </div>
                      <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                        isActive ? "text-[var(--color-primary)]" : isCompleted ? "text-[var(--color-success-text)]" : "text-[var(--color-ink-subtle)]"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-4 rounded-full transition-all duration-500 ${
                        currentStep > step.id ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-border)]"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 sm:p-10">
            
            {/* STEP 1: IDENTITY */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Booking Identity</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Select the client and vehicle for this rental.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Client <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <select 
                        value={formData.client_id} 
                        onChange={(e) => updateField("client_id", e.target.value)}
                        className={`${selectClass} pl-11`}
                        required
                      >
                        <option value="">Select a client...</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>{client.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={labelClass}>Vehicle <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <Car className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <select 
                        value={formData.vehicle_id} 
                        onChange={(e) => updateField("vehicle_id", e.target.value)}
                        className={`${selectClass} pl-11`}
                        required
                      >
                        <option value="">Select an available vehicle...</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.plate_number}) - KES {Number(vehicle.daily_rate).toLocaleString()}/day
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Start Date <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => updateField("start_date", e.target.value)}
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>End Date <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => updateField("end_date", e.target.value)}
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: TRIP DETAILS */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Trip Details</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Define the logistics of the rental journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => updateField("destination", e.target.value)}
                        placeholder="e.g. Mombasa, Kenya"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Pickup Location</label>
                    <input
                      type="text"
                      value={formData.pickup_location}
                      onChange={(e) => updateField("pickup_location", e.target.value)}
                      placeholder="e.g. Westlands, Nairobi"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Return Location</label>
                    <input
                      type="text"
                      value={formData.return_location}
                      onChange={(e) => updateField("return_location", e.target.value)}
                      placeholder="e.g. Westlands, Nairobi"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Review & Confirm</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Verify all details before creating the booking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                  {/* Identity Summary */}
                  <div className="p-6 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <h3 className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={14} /> Identity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-[var(--color-ink-muted)]">Client</span><span className="font-semibold text-[var(--color-ink)]">{clients.find(c => c.id.toString() === formData.client_id)?.full_name || "—"}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-[var(--color-ink-muted)]">Vehicle</span><span className="font-semibold text-[var(--color-ink)] truncate ml-2 max-w-[150px]">{selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : "—"}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-[var(--color-ink-muted)]">Dates</span><span className="font-semibold text-[var(--color-ink)]">{formData.start_date} to {formData.end_date}</span></div>
                    </div>
                  </div>

                  {/* Financials Summary */}
                  <div className="p-6 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
                    <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <DollarSign size={14} /> Financials
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-[var(--color-ink-muted)]">Daily Rate</span><span className="font-semibold text-[var(--color-ink)]">KES {selectedVehicle ? Number(selectedVehicle.daily_rate).toLocaleString() : 0}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-[var(--color-ink-muted)]">Duration</span><span className="font-semibold text-[var(--color-ink)]">{calculateDays()} Days</span></div>
                      <div className="flex justify-between text-sm pt-3 border-t border-[var(--color-surface-border)]"><span className="font-bold text-[var(--color-ink)]">Total Amount</span><span className="font-bold text-[var(--color-primary)] text-lg">KES {calculateTotal().toLocaleString()}</span></div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Internal Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      rows={4}
                      className={`w-full ${inputClass} resize-none`}
                      placeholder="Any specific conditions or notes about this booking..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-[var(--color-surface-border)]">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} /> Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all"
                >
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                  {loading ? "Creating Booking..." : "Create Booking"}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
