// src/app/dashboard/clients/new/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, User, Shield, Phone, CheckCircle,
  Mail, CreditCard, MapPin, Briefcase, Upload, Camera,
  FileText, Car, AlertCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { ClientCreate } from "@/lib/types";

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1";

const steps = [
  { id: 1, label: "Identity", icon: User },
  { id: 2, label: "Compliance", icon: Shield },
  { id: 3, label: "Review", icon: CheckCircle },
];

export default function NewClientPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // File states for uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    residential_address: "",
    work_address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ PREVENT AUTO-SUBMIT: Only allow submit via button click
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      // Move to next input or do nothing
      const form = e.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input'));
        const currentIndex = inputs.indexOf(e.currentTarget);
        if (currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
        }
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ Prevent default form submission
    
    if (!formData.full_name || !formData.phone) {
      toast.error("Full Name and Phone are required");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Client Record
      const payload: ClientCreate = {
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone,
        id_number: formData.id_number || null,
        dl_number: formData.dl_number || null,
        dl_expiry: formData.dl_expiry || null,
        residential_address: formData.residential_address || null,
        work_address: formData.work_address || null,
        next_of_kin_name: formData.next_of_kin_name || null,
        next_of_kin_phone: formData.next_of_kin_phone || null,
        status: "pending",
      };

      const newClient = await clientsApi.create(payload);
      toast.success("Client profile created!");

      // 2. Handle File Uploads (Sequential)
      const uploadPromises = [];
      if (avatarFile) uploadPromises.push(clientsApi.uploadAvatar(newClient.id, avatarFile));
      if (idFrontFile) uploadPromises.push(clientsApi.uploadIdFront(newClient.id, idFrontFile));
      if (idBackFile) uploadPromises.push(clientsApi.uploadIdBack(newClient.id, idBackFile));
      if (dlFrontFile) uploadPromises.push(clientsApi.uploadDlFront(newClient.id, dlFrontFile));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast.success("Documents uploaded successfully!");
      }

      router.push("/dashboard/clients");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  // ── UI Components ─────────────────────────────────────────────────────────

  const FileUploadCard = ({ 
    label, icon: Icon, file, setFile, accept = "image/*" 
  }: { label: string; icon: any; file: File | null; setFile: (f: File | null) => void; accept?: string }) => (
    <div className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all duration-300 cursor-pointer overflow-hidden">
      <input 
        type="file" 
        accept={accept} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center mb-1">
            <CheckCircle size={16} />
          </div>
          <p className="text-[10px] font-bold text-[var(--color-ink)] truncate max-w-[100px]">{file.name}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] group-hover:border-[var(--color-primary)]/30 flex items-center justify-center mb-1 transition-colors">
            <Icon size={16} />
          </div>
          <p className="text-[10px] font-bold text-[var(--color-ink)]">{label}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/dashboard/clients")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Clients
          </button>
          <h1 className="text-lg font-bold text-[var(--color-ink)] hidden sm:block">New Client Onboarding</h1>
          <div className="w-24" />
        </div>

        {/* Wizard Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--color-surface-border)] overflow-hidden">
          
          {/* Step Indicator - Compact */}
          <div className="px-6 py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? "bg-[var(--color-primary)] text-white shadow-[0_0_0_3px_var(--color-primary-muted)]" 
                          : isCompleted 
                            ? "bg-[var(--color-success)] text-white" 
                            : "bg-[var(--color-surface)] border-2 border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]"
                      }`}>
                        {isCompleted ? <CheckCircle size={14} /> : <Icon size={14} />}
                      </div>
                      <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? "text-[var(--color-primary)]" : isCompleted ? "text-[var(--color-success-text)]" : "text-[var(--color-ink-subtle)]"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all duration-500 ${
                        currentStep > step.id ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-border)]"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content - Compact */}
          <form onSubmit={handleSubmit} className="p-6">
            
            {/* STEP 1: IDENTITY */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-[var(--color-ink)]">Let's start with the basics</h2>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1">Who are we onboarding today?</p>
                </div>

                <div className="flex justify-center mb-6">
                  <label className="relative group cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] group-hover:border-[var(--color-primary)] flex items-center justify-center overflow-hidden transition-all">
                      {avatarFile ? (
                        <img src={URL.createObjectURL(avatarFile)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={20} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] transition-colors" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg border-2 border-[var(--color-surface)]">
                      <Upload size={12} />
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Full Name <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => updateField("full_name", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Rebecca Molly"
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="rebecca@example.com"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="+254 7..."
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>National ID Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.id_number}
                        onChange={(e) => updateField("id_number", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ID Number"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COMPLIANCE */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-[var(--color-ink)]">Compliance & Documents</h2>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1">Required for verification and legal protection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Driving License Number</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.dl_number}
                        onChange={(e) => updateField("dl_number", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="DL-01234"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>DL Expiry Date</label>
                    <input
                      type="date"
                      value={formData.dl_expiry}
                      onChange={(e) => updateField("dl_expiry", e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Residential Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.residential_address}
                        onChange={(e) => updateField("residential_address", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Home address"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Work Address</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        value={formData.work_address}
                        onChange={(e) => updateField("work_address", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Office address"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--color-surface-border)] pt-4">
                  <label className={labelClass}>Required Documents</label>
                  <div className="grid grid-cols-3 gap-3">
                    <FileUploadCard label="ID Front" icon={FileText} file={idFrontFile} setFile={setIdFrontFile} />
                    <FileUploadCard label="ID Back" icon={FileText} file={idBackFile} setFile={setIdBackFile} />
                    <FileUploadCard label="DL Front" icon={Car} file={dlFrontFile} setFile={setDlFrontFile} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-[var(--color-ink)]">Review & Confirm</h2>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1">Please verify all details before creating the profile.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Emergency Contact Section */}
                  <div className="md:col-span-2 p-4 rounded-xl bg-[var(--color-warning-bg)]/30 border border-[var(--color-warning-bg)]">
                    <h3 className="text-xs font-bold text-[var(--color-warning-text)] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertCircle size={14} /> Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Next of Kin Name</label>
                        <input
                          type="text"
                          value={formData.next_of_kin_name}
                          onChange={(e) => updateField("next_of_kin_name", e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Full Name"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Next of Kin Phone</label>
                        <input
                          type="tel"
                          value={formData.next_of_kin_phone}
                          onChange={(e) => updateField("next_of_kin_phone", e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="+254 7..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <h3 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">Identity</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">Name</span><span className="font-semibold text-[var(--color-ink)]">{formData.full_name || "—"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">Email</span><span className="font-semibold text-[var(--color-ink)]">{formData.email || "—"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">Phone</span><span className="font-semibold text-[var(--color-ink)]">{formData.phone || "—"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">ID Number</span><span className="font-semibold text-[var(--color-ink)]">{formData.id_number || "—"}</span></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <h3 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">Compliance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">DL Number</span><span className="font-semibold text-[var(--color-ink)]">{formData.dl_number || "—"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">DL Expiry</span><span className="font-semibold text-[var(--color-ink)]">{formData.dl_expiry || "—"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">Address</span><span className="font-semibold text-[var(--color-ink)] truncate ml-2 max-w-[120px]">{formData.residential_address || "—"}</span></div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--color-ink-muted)]">Documents</span>
                        <span className="text-[10px] font-bold text-[var(--color-success-text)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full">
                          {[idFrontFile, idBackFile, dlFrontFile].filter(Boolean).length} Uploaded
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-surface-border)]">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} /> Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all"
                >
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} 
                  {loading ? "Creating Profile..." : "Create Client"}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
