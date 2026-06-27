"use client";

import { useState } from "react";
import { User, Shield, Phone, CheckCircle, ArrowRight, ArrowLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import DatePicker from "@/components/forms/DatePicker";
import type { ClientCreatePayload } from "@/lib/types";

interface CreateClientWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientCreatePayload) => void;
}

const steps = [
  { id: 1, label: "Identity", icon: User },
  { id: 2, label: "Compliance", icon: Shield },
  { id: 3, label: "Emergency", icon: Phone },
  { id: 4, label: "Review", icon: CheckCircle },
];

export default function CreateClientWizard({ open, onClose, onSave }: CreateClientWizardProps) {
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert empty strings to null for the backend
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v === "" ? null : v])
      ) as ClientCreatePayload;
      
      await onSave(payload);
      toast.success("Client created successfully!");
      // Reset form
      setFormData({
        full_name: "", email: "", phone: "", id_number: "", dl_number: "",
        dl_expiry: "", residential_address: "", next_of_kin_name: "", next_of_kin_phone: "",
      });
      setCurrentStep(1);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Full Name" required>
                <Input value={formData.full_name} onChange={(e) => updateField("full_name", e.target.value)} placeholder="e.g. John Doe" />
              </FormGroup>
              <FormGroup label="ID Number">
                <Input value={formData.id_number} onChange={(e) => updateField("id_number", e.target.value)} placeholder="National ID" />
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Email" required>
                <Input type="email" icon={Mail} value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="client@example.com" />
              </FormGroup>
              <FormGroup label="Phone" required>
                <Input type="tel" icon={Phone} value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+254 700 000 000" />
              </FormGroup>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Driver's License Number">
                <Input value={formData.dl_number} onChange={(e) => updateField("dl_number", e.target.value)} placeholder="DL Number" />
              </FormGroup>
              <FormGroup label="DL Expiry Date">
                <DatePicker value={formData.dl_expiry} onChange={(val) => updateField("dl_expiry", val)} placeholder="Select date" />
              </FormGroup>
            </div>
            <FormGroup label="Residential Address">
              <Input value={formData.residential_address} onChange={(e) => updateField("residential_address", e.target.value)} placeholder="Home address" />
            </FormGroup>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
              <Phone className="text-amber-600 flex-shrink-0 mt-1" size={18} />
              <p className="text-xs text-amber-800">This contact will be notified in case of an emergency during a rental.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Next of Kin Name">
                <Input value={formData.next_of_kin_name} onChange={(e) => updateField("next_of_kin_name", e.target.value)} placeholder="Contact name" />
              </FormGroup>
              <FormGroup label="Next of Kin Phone">
                <Input type="tel" value={formData.next_of_kin_phone} onChange={(e) => updateField("next_of_kin_phone", e.target.value)} placeholder="+254 7..." />
              </FormGroup>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Identity</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{formData.full_name || "—"}</span></div>
                <div><span className="text-gray-500">ID:</span> <span className="font-medium text-gray-900">{formData.id_number || "—"}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{formData.email || "—"}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{formData.phone || "—"}</span></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Compliance</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">DL:</span> <span className="font-medium text-gray-900">{formData.dl_number || "—"}</span></div>
                <div><span className="text-gray-500">Expiry:</span> <span className="font-medium text-gray-900">{formData.dl_expiry || "—"}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium text-gray-900">{formData.residential_address || "—"}</span></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Emergency</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{formData.next_of_kin_name || "—"}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{formData.next_of_kin_phone || "—"}</span></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Client" subtitle="Follow the steps to add a client to your database" icon={User} size="lg" footer={null}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Stepper */}
        <div className="w-full md:w-48 flex-shrink-0">
          <div className="space-y-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-700" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-blue-600 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-100"}`}>
                    {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">{steps[currentStep - 1].label} Details</h3>
            <p className="text-sm text-gray-500 mt-1">
              {currentStep === 1 && "Enter the client's basic identification and contact information."}
              {currentStep === 2 && "Add compliance documents and residential details."}
              {currentStep === 3 && "Provide an emergency contact for safety purposes."}
              {currentStep === 4 && "Review all information before creating the client profile."}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              <ArrowLeft size={16} /> Back
            </button>
            
            {currentStep < 4 ? (
              <button onClick={nextStep} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm disabled:opacity-50">
                <CheckCircle size={16} /> {loading ? "Creating..." : "Create Client"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
