"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Car, Hash, DollarSign, Gauge, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import SectionCard from "@/components/ui/SectionCard";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    plate_number: "",
    vin: "",
    daily_rate: "",
    current_mileage: "",
    next_service_km: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.make || !formData.model || !formData.year || !formData.plate_number || !formData.daily_rate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED: Convert empty strings to undefined for optional fields
      const payload = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        plate_number: formData.plate_number,
        vin: formData.vin || undefined, // ✅ Changed from || null
        daily_rate: parseFloat(formData.daily_rate),
        current_mileage: formData.current_mileage ? parseInt(formData.current_mileage) : undefined,
        next_service_km: formData.next_service_km ? parseInt(formData.next_service_km) : undefined,
        notes: formData.notes || undefined,
      };

      await vehiclesApi.create(payload);
      
      toast.success("Vehicle added to fleet successfully!");
      router.push("/dashboard/fleet");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/dashboard/fleet")} className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={14} /> Back to Fleet
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Vehicle Identity */}
        <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Car size={16} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Vehicle Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Make" required>
              <Input value={formData.make} onChange={(e) => updateField("make", e.target.value)} placeholder="e.g., Toyota" />
            </FormGroup>
            <FormGroup label="Model" required>
              <Input value={formData.model} onChange={(e) => updateField("model", e.target.value)} placeholder="e.g., Land Cruiser Prado" />
            </FormGroup>
            <FormGroup label="Year" required>
              <Input type="number" value={formData.year} onChange={(e) => updateField("year", e.target.value)} placeholder="e.g., 2022" min="1900" max={new Date().getFullYear() + 1} />
            </FormGroup>
            <FormGroup label="Plate Number" required>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input value={formData.plate_number} onChange={(e) => updateField("plate_number", e.target.value)} placeholder="e.g., KDA 123A" className="pl-9" />
              </div>
            </FormGroup>
            <FormGroup label="VIN (Chassis Number)" className="md:col-span-2">
              <Input value={formData.vin} onChange={(e) => updateField("vin", e.target.value)} placeholder="Optional: 17-character vehicle identification number" />
            </FormGroup>
          </div>
        </SectionCard>

        {/* Section 2: Financials & Usage */}
        <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign size={16} className="text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Financials & Usage</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Daily Rate (KES)" required>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-sm">KES</span>
                <Input type="number" value={formData.daily_rate} onChange={(e) => updateField("daily_rate", e.target.value)} placeholder="0.00" className="pl-12" min="0" step="0.01" />
              </div>
            </FormGroup>
            <FormGroup label="Current Mileage (km)">
              <div className="relative">
                <Gauge className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input type="number" value={formData.current_mileage} onChange={(e) => updateField("current_mileage", e.target.value)} placeholder="e.g., 45000" className="pl-9" min="0" />
              </div>
            </FormGroup>
            <FormGroup label="Next Service (km)">
              <Input type="number" value={formData.next_service_km} onChange={(e) => updateField("next_service_km", e.target.value)} placeholder="e.g., 50000" min="0" />
            </FormGroup>
          </div>
        </SectionCard>

        {/* Section 3: Notes */}
        <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText size={16} className="text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Additional Notes</h3>
          </div>
          <FormGroup label="Internal Notes">
            <textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
              placeholder="Any specific conditions, accessories, or notes about this vehicle..."
            />
          </FormGroup>
        </SectionCard>

        {/* Action Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex items-center gap-2 z-40">
          <button
            type="button"
            onClick={() => router.push("/dashboard/fleet")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} /> {loading ? "Adding..." : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
