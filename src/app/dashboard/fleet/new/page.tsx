// src/app/dashboard/vehicles/new/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Car, DollarSign, Shield, CheckCircle,
  Hash, Gauge, Upload, Camera, FileText, AlertCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { VehicleCreate } from "@/lib/types";

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

const steps = [
  { id: 1, label: "Vehicle Identity", icon: Car },
  { id: 2, label: "Financials & Usage", icon: DollarSign },
  { id: 3, label: "Compliance", icon: Shield },
  { id: 4, label: "Review", icon: CheckCircle },
];

export default function NewVehiclePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // File states for uploads
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [inspectionFile, setInspectionFile] = useState<File | null>(null);

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
        insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry).toISOString() : null,
        notes: formData.notes || null,
      };

      const newVehicle = await vehiclesApi.create(payload);
      toast.success("Vehicle added to fleet successfully!");

      // Handle file uploads if any
      const uploadPromises = [];
      if (insuranceFile) uploadPromises.push(vehiclesApi.uploadInsuranceDoc(newVehicle.id, insuranceFile));
      if (registrationFile) uploadPromises.push(vehiclesApi.uploadRegistrationDoc(newVehicle.id, registrationFile));
      if (inspectionFile) uploadPromises.push(vehiclesApi.uploadInspectionDoc(newVehicle.id, inspectionFile));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast.success("Documents uploaded successfully!");
      }

      router.push("/dashboard/fleet");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  // ── UI Components ──────────────────────────────────────────────────────────

  const FileUploadCard = ({
    label, icon: Icon, file, setFile, accept = "image/*,application/pdf"
  }: { label: string; icon: any; file: File | null; setFile: (f: File | null) => void; accept?: string }) => (
    <div className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all duration-300 cursor-pointer overflow-hidden">
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center mb-2">
            <CheckCircle size={20} />
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] truncate max-w-[120px]">{file.name}</p>
          <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">Ready to upload</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] group-hover:border-[var(--color-primary)]/30 flex items-center justify-center mb-2 transition-colors">
            <Icon size={20} />
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)]">{label}</p>
          <p className="text-[10px] text-[var(--color-ink-subtle)] mt-1">Click to browse</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] p-4 sm:p-8 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard/fleet")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Fleet
          </button>
          <h1 className="text-xl font-bold text-[var(--color-ink)] hidden sm:block">New Vehicle Onboarding</h1>
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
            
            {/* STEP 1: VEHICLE IDENTITY */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Let's add your vehicle</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Enter the core details to identify this vehicle in your fleet.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div>
                    <label className={labelClass}>Make <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <Car className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.make}
                        onChange={(e) => updateField("make", e.target.value)}
                        placeholder="e.g. Toyota"
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Model <span className="text-[var(--color-danger)]">*</span></label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => updateField("model", e.target.value)}
                      placeholder="e.g. Land Cruiser Prado"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Year <span className="text-[var(--color-danger)]">*</span></label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => updateField("year", e.target.value)}
                      placeholder="e.g. 2022"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Plate Number <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.plate_number}
                        onChange={(e) => updateField("plate_number", e.target.value)}
                        placeholder="e.g. KDA 123A"
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>VIN (Chassis Number)</label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => updateField("vin", e.target.value)}
                      placeholder="Optional: 17-character vehicle identification number"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FINANCIALS & USAGE */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Financials & Usage</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Set the financial rates and track current usage metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div>
                    <label className={labelClass}>Daily Rate (KES) <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)] text-sm font-semibold">KES</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.daily_rate}
                        onChange={(e) => updateField("daily_rate", e.target.value)}
                        placeholder="0.00"
                        className={`${inputClass} pl-16`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Current Mileage (km)</label>
                    <div className="relative">
                      <Gauge className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="number"
                        min="0"
                        value={formData.current_mileage}
                        onChange={(e) => updateField("current_mileage", e.target.value)}
                        placeholder="e.g. 45000"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Next Service (km)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.next_service_km}
                      onChange={(e) => updateField("next_service_km", e.target.value)}
                      placeholder="e.g. 50000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: COMPLIANCE */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Compliance & Documents</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Provide insurance details and upload required documents.</p>
                </div>

                <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      Providing insurance details now will allow you to activate the vehicle immediately after onboarding.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                  <div>
                    <label className={labelClass}>Insurance Policy Number</label>
                    <input
                      type="text"
                      value={formData.insurance_number}
                      onChange={(e) => updateField("insurance_number", e.target.value)}
                      placeholder="e.g. POL-12345678"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Insurance Expiry Date</label>
                    <input
                      type="date"
                      value={formData.insurance_expiry}
                      onChange={(e) => updateField("insurance_expiry", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="border-t border-[var(--color-surface-border)] pt-8">
                  <label className={labelClass}>Required Documents</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <FileUploadCard label="Insurance" icon={FileText} file={insuranceFile} setFile={setInsuranceFile} />
                    <FileUploadCard label="Registration" icon={FileText} file={registrationFile} setFile={setRegistrationFile} />
                    <FileUploadCard label="Inspection" icon={FileText} file={inspectionFile} setFile={setInspectionFile} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Review & Submit</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Please verify all information before adding the vehicle to your fleet.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                  {/* Identity Section */}
                  <div className="p-6 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <h3 className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Car size={14} /> Vehicle Identity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Make/Model</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.make} {formData.model}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Year</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.year}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Plate Number</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.plate_number}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">VIN</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.vin || "—"}</span></div>
                    </div>
                  </div>

                  {/* Financials Section */}
                  <div className="p-6 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <h3 className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <DollarSign size={14} /> Financials & Usage
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Daily Rate</span><span className="text-sm font-semibold text-[var(--color-ink)]">KES {Number(formData.daily_rate).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Current Mileage</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.current_mileage ? `${Number(formData.current_mileage).toLocaleString()} km` : "—"}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Next Service</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.next_service_km ? `${Number(formData.next_service_km).toLocaleString()} km` : "—"}</span></div>
                    </div>
                  </div>

                  {/* Compliance Section */}
                  <div className="p-6 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] md:col-span-2">
                    <h3 className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield size={14} /> Compliance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Insurance Number</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.insurance_number || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[var(--color-ink-muted)]">Insurance Expiry</span><span className="text-sm font-semibold text-[var(--color-ink)]">{formData.insurance_expiry ? new Date(formData.insurance_expiry).toLocaleDateString() : "—"}</span></div>
                      <div className="flex justify-between items-center sm:col-span-2">
                        <span className="text-sm text-[var(--color-ink-muted)]">Documents</span>
                        <span className="text-xs font-bold text-[var(--color-success-text)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full">
                          {[insuranceFile, registrationFile, inspectionFile].filter(Boolean).length} Uploaded
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="max-w-2xl mx-auto mb-8">
                  <label className={labelClass}>Internal Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm resize-none"
                    placeholder="Any specific conditions, accessories, or notes about this vehicle..."
                  />
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
              
              {currentStep < 4 ? (
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
                  {loading ? "Adding Vehicle..." : "Add Vehicle to Fleet"}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
