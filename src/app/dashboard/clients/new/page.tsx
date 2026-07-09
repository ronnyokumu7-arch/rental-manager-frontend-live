// src/app/dashboard/clients/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, User, Shield, Phone, CheckCircle, Mail, CreditCard, MapPin } from "lucide-react";
import toast from "react-hot-toast";

import { clientsApi } from "@/lib/api/clients";
// ✅ FIXED: Renamed to ClientCreate to match the cleaned types.ts
import type { ClientCreate } from "@/lib/types"; 

import SectionCard from "@/components/ui/SectionCard";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import DatePicker from "@/components/forms/DatePicker";

const steps = [
  { id: 1, label: "Identity & Contact", icon: User },
  { id: 2, label: "Compliance", icon: Shield },
  { id: 3, label: "Emergency", icon: Phone },
  { id: 4, label: "Review", icon: CheckCircle },
];

export default function NewClientPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    residential_address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED: Payload now perfectly matches the cleaned ClientCreate type
      const payload: ClientCreate = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        id_number: formData.id_number || null,
        dl_number: formData.dl_number || null,
        dl_expiry: formData.dl_expiry || null,
        residential_address: formData.residential_address || null,
        work_address: null, 
        next_of_kin_name: formData.next_of_kin_name || null,
        next_of_kin_phone: formData.next_of_kin_phone || null,
        status: "pending", 
      };

      await clientsApi.create(payload);
      toast.success("Client created successfully! Compliance tasks generated.");
      router.push("/dashboard/clients");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Clients
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
        <h2 className="text-lg font-bold text-gray-900">
          {steps[currentStep - 1].label}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {currentStep === 1 && "Enter the client's basic identity and contact details."}
          {currentStep === 2 && "Provide compliance and license information."}
          {currentStep === 3 && "Provide an emergency contact for safety purposes."}
          {currentStep === 4 && "Review all information before creating the client profile."}
        </p>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Full Name" required>
                <Input
                  value={formData.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </FormGroup>
              <FormGroup label="Email" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="john@example.com"
                    className="pl-9"
                  />
                </div>
              </FormGroup>
              <FormGroup label="Phone" required>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+254 7..."
                    className="pl-9"
                  />
                </div>
              </FormGroup>
              <FormGroup label="ID Number">
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    value={formData.id_number}
                    onChange={(e) => updateField("id_number", e.target.value)}
                    placeholder="National ID"
                    className="pl-9"
                  />
                </div>
              </FormGroup>
            </div>
          </SectionCard>
        )}

        {/* Step 2: Compliance */}
        {currentStep === 2 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Driving License Number">
                <Input
                  value={formData.dl_number}
                  onChange={(e) => updateField("dl_number", e.target.value)}
                  placeholder="ex: DL-01234"
                />
              </FormGroup>
              <FormGroup label="DL Expiry Date">
                <DatePicker
                  value={formData.dl_expiry}
                  onChange={(val) => updateField("dl_expiry", val)}
                  placeholder="Select date"
                />
              </FormGroup>
            </div>
            <FormGroup label="Residential Address" className="mt-6">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  value={formData.residential_address}
                  onChange={(e) => updateField("residential_address", e.target.value)}
                  placeholder="Home address"
                  className="pl-9"
                />
              </div>
            </FormGroup>
          </SectionCard>
        )}

        {/* Step 3: Emergency */}
        {currentStep === 3 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm text-amber-800">
                This contact will be notified in case of an emergency during a rental.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Emergency Contact">
                <Input
                  value={formData.next_of_kin_name}
                  onChange={(e) => updateField("next_of_kin_name", e.target.value)}
                  placeholder="Full Name"
                />
              </FormGroup>
              <FormGroup label="Phone Number">
                <Input
                  type="tel"
                  value={formData.next_of_kin_phone}
                  onChange={(e) => updateField("next_of_kin_phone", e.target.value)}
                  placeholder="+254 7..."
                />
              </FormGroup>
            </div>
          </SectionCard>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <SectionCard className="!p-6 bg-white border-slate-200 shadow-sm">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Identity & Contact
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Full Name</span>
                      <span className="text-sm font-medium text-gray-900">{formData.full_name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-900">{formData.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Phone</span>
                      <span className="text-sm font-medium text-gray-900">{formData.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">ID Number</span>
                      <span className="text-sm font-medium text-gray-900">{formData.id_number || "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Compliance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">DL Number</span>
                      <span className="text-sm font-medium text-gray-900">{formData.dl_number || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">DL Expiry</span>
                      <span className="text-sm font-medium text-gray-900">{formData.dl_expiry || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Address</span>
                      <span className="text-sm font-medium text-gray-900 truncate ml-4 max-w-[200px]">{formData.residential_address || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{formData.next_of_kin_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-900">{formData.next_of_kin_phone || "—"}</span>
                  </div>
                </div>
              </div>
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
              <CheckCircle size={14} /> {loading ? "Creating..." : "Create Client"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
