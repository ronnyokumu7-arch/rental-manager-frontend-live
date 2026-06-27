"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, User, Car, Calendar, MapPin, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Client, Vehicle } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import DateRangePicker from "@/components/forms/DateRangePicker";

export default function NewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [duration, setDuration] = useState(0);
  
  const [formData, setFormData] = useState({
    client_id: "",
    vehicle_id: "",
    start_date: "",
    end_date: "",
    pickup_location: "",
    return_location: "",
    destination: "",
    total_amount: "",
    currency_code: "KES",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [clientsData, vehiclesData] = await Promise.all([
        clientsApi.list(),
        vehiclesApi.list(),
      ]);
      setClients(clientsData);
      setVehicles(vehiclesData.filter(v => v.status === "available"));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays);

      if (formData.vehicle_id) {
        const vehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
        if (vehicle) {
          const total = vehicle.daily_rate * diffDays;
          setFormData(prev => ({ ...prev, total_amount: total.toString() }));
        }
      }
    }
  }, [formData.start_date, formData.end_date, formData.vehicle_id, vehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.vehicle_id || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the Booking
      const newBooking = await bookingsApi.create({
        client_id: parseInt(formData.client_id),
        vehicle_id: parseInt(formData.vehicle_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        pickup_location: formData.pickup_location,
        return_location: formData.return_location,
        destination: formData.destination,
        total_amount: parseFloat(formData.total_amount) || 0,
        currency_code: formData.currency_code,
      });
      
      // 2. ✅ Automatically Generate Draft Invoice
      try {
        await invoicesApi.create({
          booking_id: newBooking.id,
          due_date: formData.end_date, // Set due date to end of rental
        });
        toast.success("Booking and invoice created successfully!");
      } catch (invoiceError) {
        console.error("Invoice generation failed:", invoiceError);
        toast.success("Booking created (invoice generation failed - you can create it manually)");
      }

      router.push("/dashboard/bookings");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 pb-20 bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/dashboard/bookings")} className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={14} /> Back to Bookings
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Client & Vehicle Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Client Selection</h3>
            </div>
            <FormGroup label="Select Client" required>
              <Select
                value={formData.client_id}
                onChange={(e) => updateField("client_id", e.target.value)}
                options={[
                  { value: "", label: "Choose a client..." },
                  ...clients.map(c => ({ value: c.id.toString(), label: `${c.full_name} (${c.phone})` }))
                ]}
              />
            </FormGroup>
          </SectionCard>

          <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Car size={16} className="text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Vehicle Selection</h3>
            </div>
            <FormGroup label="Select Vehicle" required>
              <Select
                value={formData.vehicle_id}
                onChange={(e) => updateField("vehicle_id", e.target.value)}
                options={[
                  { value: "", label: "Choose a vehicle..." },
                  ...vehicles.map(v => ({ value: v.id.toString(), label: `${v.make} ${v.model} (${v.plate_number}) - KES ${v.daily_rate}/day` }))
                ]}
              />
            </FormGroup>
          </SectionCard>
        </div>

        {/* Section 2: Trip Details */}
        <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Calendar size={16} className="text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Trip Details</h3>
          </div>
         
          {/* ✅ FIXED: Using DateRangePicker instead of DatePicker */}
          <FormGroup label="Rental Period" required>
            <DateRangePicker
              startDate={formData.start_date}
              endDate={formData.end_date}
              onStartDateChange={(value) => updateField("start_date", value)}
              onEndDateChange={(value) => updateField("end_date", value)}
            />
          </FormGroup>

          {duration > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-3">
              <Calendar size={16} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Trip Duration</p>
                <p className="text-sm font-semibold text-amber-700">{duration} {duration === 1 ? "Day" : "Days"}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormGroup label="Pickup Location">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  value={formData.pickup_location}
                  onChange={(e) => updateField("pickup_location", e.target.value)}
                  placeholder="e.g., Nairobi CBD, Jomo Kenyatta Airport"
                  className="pl-9"
                />
              </div>
            </FormGroup>
            <FormGroup label="Return Location">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  value={formData.return_location}
                  onChange={(e) => updateField("return_location", e.target.value)}
                  placeholder="e.g., Mombasa, Kisumu"
                  className="pl-9"
                />
              </div>
            </FormGroup>
          </div>

          <FormGroup label="Destination / Area of Use" className="mt-4">
            <Input
              value={formData.destination}
              onChange={(e) => updateField("destination", e.target.value)}
              placeholder="e.g., Coastal Region, Western Kenya"
            />
          </FormGroup>
        </SectionCard>

        {/* Section 3: Financials */}
        <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign size={16} className="text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Financial Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Total Amount (KES)" required>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-sm">KES</span>
                <Input
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => updateField("total_amount", e.target.value)}
                  placeholder="0.00"
                  className="pl-12"
                  min="0"
                  step="0.01"
                />
              </div>
            </FormGroup>
            <FormGroup label="Currency">
              <Select
                value={formData.currency_code}
                onChange={(e) => updateField("currency_code", e.target.value)}
                options={[
                  { value: "KES", label: "KES - Kenyan Shilling" },
                  { value: "USD", label: "USD - US Dollar" },
                ]}
              />
            </FormGroup>
          </div>
        </SectionCard>

        {/* Action Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex items-center gap-2 z-40">
          <button
            type="button"
            onClick={() => router.push("/dashboard/bookings")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} /> {loading ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
