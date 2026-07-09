// src/app/dashboard/vehicles/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, X, Car, DollarSign, Shield, FileText, CheckCircle, Hash, Gauge } from "lucide-react";
import toast from "react-hot-toast";

import { vehiclesApi } from "@/lib/api/vehicles";
// ✅ FIXED: Aligned with the cleaned types.ts (removed 'Payload' suffix)
import type { VehicleCreate } from "@/lib/types"; 

import SectionCard from "@/components/ui/SectionCard";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import DatePicker from "@/components/forms/DatePicker";

const steps = [
  { id: 1, label: "Vehicle Identity", icon: Car },
  { id: 2, label: "Financials & Usage", icon: DollarSign },
  { id: 3, label: "Compliance", icon: Shield },
  { id: 4, label: "Review & Submit", icon: CheckCircle },
];

export default function NewVehiclePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // ✅ FIXED: Removed hidden spaces from initial state strings (e.g., " " -> "")
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    plate_number: "",
    vin: "",
    daily_rate: "",
    current_mileage: "",
    next_service_km: "",
    insurance_number: "",
    insurance_expiry: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.make || !formData.model || !formData.year || !formData.plate_number)) {
      toast.error("Please fill in all required identity fields.");
      return;
    }
    if (currentStep === 2 && !formData.daily_rate) {
      toast.error("Daily rate is required.");
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ FIXED: Safely parse numbers and convert empty strings to undefined/null
      const payload: VehicleCreate = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        plate_number: formData.plate_number,
        vin: formData.vin || null,
        daily_rate: parseFloat(formData.daily_rate),
        current_mileage: formData.current_mileage ? parseInt(formData.current_mileage) : 0,
        next_service_km: formData.next_service_km ? parseInt(formData.next_service_km) : null,
        insurance_number: formData.insurance_number || null,
        // Convert YYYY-MM-DD to ISO string for the backend
        insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry).toISOString() : null, 
        notes: formData.notes || null,
      };

      await vehiclesApi.create(payload);
      toast.success("Vehicle added to fleet successfully! It is now pending activation.");
      router.push("/dashboard/fleet");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/fleet")}
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Fleet
        </button>
      </div>

      {/* Step Indicator */}
      <SectionCard className="!p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : isCompleted
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block ${
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 transition-all ${
                      currentStep > step.id ? "bg-green-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Step Description */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">{steps[currentStep - 1].label}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {currentStep === 1 && "Enter the core details to identify this vehicle in your fleet."}
          {currentStep === 2 && "Set the financial rates and track current usage metrics."}
          {currentStep === 3 && "Provide compliance and insurance details to enable activation."}
          {currentStep === 4 && "Review all information before adding the vehicle to the fleet."}
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        )}

        {/* Step 2: Financials & Usage */}
        {currentStep === 2 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <FormGroup label="Next Service (km)" className="md:col-span-2">
                <Input type="number" value={formData.next_service_km} onChange={(e) => updateField("next_service_km", e.target.value)} placeholder="e.g., 50000" min="0" />
              </FormGroup>
            </div>
          </SectionCard>
        )}

        {/* Step 3: Compliance */}
        {currentStep === 3 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-sm text-purple-800">
                Providing insurance details now will allow you to activate the vehicle immediately after onboarding.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Insurance Policy Number">
                <Input value={formData.insurance_number} onChange={(e) => updateField("insurance_number", e.target.value)} placeholder="e.g., POL-12345678" />
              </FormGroup>
              <FormGroup label="Insurance Expiry Date">
                <DatePicker value={formData.insurance_expiry} onChange={(val) => updateField("insurance_expiry", val)} placeholder="Select expiry date" />
              </FormGroup>
            </div>
          </SectionCard>
        )}

        {/* Step 4: Review & Notes */}
        {currentStep === 4 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Identity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Make/Model</span><span className="text-sm font-medium text-gray-900">{formData.make} {formData.model}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Year</span><span className="text-sm font-medium text-gray-900">{formData.year}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Plate</span><span className="text-sm font-medium text-gray-900">{formData.plate_number}</span></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Financials</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Daily Rate</span><span className="text-sm font-medium text-gray-900">KES {formData.daily_rate}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Mileage</span><span className="text-sm font-medium text-gray-900">{formData.current_mileage || "0"} km</span></div>
                  </div>
                </div>
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
            </div>
          </SectionCard>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={14} /> Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              Next Step <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} /> {loading ? "Adding..." : "Add Vehicle to Fleet"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
