// src/components/clients/NewClientForm.tsx
"use client";

import { 
  User, Shield, CheckCircle, Mail, CreditCard, 
  Upload, Camera, FileText, Car, Loader2, Users, Calendar
} from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';

interface NewClientFormProps {
  loading: boolean;
  formData: Record<string, string>;
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  idFrontFile: File | null;
  setIdFrontFile: (f: File | null) => void;
  idBackFile: File | null;
  setIdBackFile: (f: File | null) => void;
  dlFrontFile: File | null;
  setDlFrontFile: (f: File | null) => void;
  updateField: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  mode?: "create" | "edit"; // ✅ NEW: Controls button text and behavior
}

// ✅ BULLETPROOF LOCAL DATE FORMATTER (Fixes timezone offset bug)
const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass = "bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4";

export default function NewClientForm({
  loading, formData,
  avatarFile, setAvatarFile,
  idFrontFile, setIdFrontFile,
  idBackFile, setIdBackFile,
  dlFrontFile, setDlFrontFile,
  updateField, handleSubmit,
  mode = "create" // ✅ Default to create mode
}: NewClientFormProps) {
  
  const docCount = [idFrontFile, idBackFile, dlFrontFile].filter(Boolean).length;

  const DocUploadSlot = ({
    label, icon: Icon, file, setFile
  }: { label: string; icon: any; file: File | null; setFile: (f: File | null) => void }) => (
    <label className="group relative flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all cursor-pointer">
      <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      {file ? (
        <>
          <div className="w-7 h-7 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center mb-1">
            <CheckCircle size={12} />
          </div>
          <p className="text-[9px] font-bold text-[var(--color-ink)] truncate max-w-[70px]">{file.name}</p>
        </>
      ) : (
        <>
          <div className="w-7 h-7 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] flex items-center justify-center mb-1">
            <Icon size={12} />
          </div>
          <p className="text-[9px] font-semibold text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]">{label}</p>
        </>
      )}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
      
      {/* LEFT COLUMN: Identity + Compliance */}
      <div className="space-y-3">
        
        {/* Section 1: Identity */}
        <section className={sectionClass}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <User size={14} />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">Client Identity</h3>
            </div>
            
            <label className="relative group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] group-hover:border-[var(--color-primary)] flex items-center justify-center overflow-hidden transition-all">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={14} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] transition-colors" />
                )}
              </div>
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg border-2 border-[var(--color-surface)]">
                <Upload size={8} />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Full Name <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <User size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="text" value={formData.full_name} onChange={(e) => updateField("full_name", e.target.value)} placeholder="e.g. Rebecca Molly" className={`${inputClass} pl-8`} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="rebecca@example.com" className={`${inputClass} pl-8`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone Number <span className="text-[var(--color-danger)]">*</span></label>
              <PhoneInput
                international
                defaultCountry="KE"
                value={formData.phone}
                onChange={(value) => updateField("phone", value || "")}
                placeholder="+254 712 345678"
                className="phone-input-custom"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>National ID Number</label>
              <div className="relative">
                <CreditCard size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="text" value={formData.id_number} onChange={(e) => updateField("id_number", e.target.value)} placeholder="ID Number" className={`${inputClass} pl-8`} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Compliance */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Shield size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Compliance & Documents</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Driving License Number</label>
              <div className="relative">
                <Car size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="text" value={formData.dl_number} onChange={(e) => updateField("dl_number", e.target.value)} placeholder="DL-01234" className={`${inputClass} pl-8`} />
              </div>
            </div>
            
            {/* ✅ REPLACED: Native date input with Premium Flatpickr */}
            <div>
              <label className={labelClass}>DL Expiry Date</label>
              <div className="relative group">
                <Calendar size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
                <Flatpickr
                  value={formData.dl_expiry}
                  onChange={(dates) => {
                    if (dates[0]) {
                      updateField("dl_expiry", formatDateToLocalYYYYMMDD(dates[0]));
                    }
                  }}
                  options={{
                    dateFormat: "Y-m-d",
                    minDate: "today",
                    disableMobile: true,
                  }}
                  className={`${inputClass} pl-8`}
                  placeholder="Select date..."
                />
              </div>
            </div>
            
            {/* ✅ Clean, Reusable Address Autocomplete */}
            <AddressAutocomplete
              value={formData.residential_address}
              onChange={(value) => updateField("residential_address", value)}
              label="Residential Address"
              placeholder="Search residential address..."
            />
            
            {/* ✅ Clean, Reusable Address Autocomplete */}
            <AddressAutocomplete
              value={formData.work_address}
              onChange={(value) => updateField("work_address", value)}
              label="Work Address"
              placeholder="Search work address..."
            />
          </div>

          <div>
            <label className={labelClass}>Required Documents ({docCount}/3 uploaded)</label>
            <div className="grid grid-cols-3 gap-2">
              <DocUploadSlot label="ID Front" icon={FileText} file={idFrontFile} setFile={setIdFrontFile} />
              <DocUploadSlot label="ID Back" icon={FileText} file={idBackFile} setFile={setIdBackFile} />
              <DocUploadSlot label="DL Front" icon={Car} file={dlFrontFile} setFile={setDlFrontFile} />
            </div>
          </div>
        </section>

      </div>

      {/* RIGHT COLUMN: Emergency Contact → Preview → CTA */}
      <aside className="lg:sticky lg:top-4 space-y-3">
        
        {/* Emergency Contact */}
        <section className={`${sectionClass} border-amber-500/20 bg-amber-500/5`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Users size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Emergency Contact</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Next of Kin Name</label>
              <input type="text" value={formData.next_of_kin_name} onChange={(e) => updateField("next_of_kin_name", e.target.value)} placeholder="Full Name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Next of Kin Phone</label>
              <PhoneInput
                international
                defaultCountry="KE"
                value={formData.next_of_kin_phone}
                onChange={(value) => updateField("next_of_kin_phone", value || "")}
                placeholder="+254 7..."
                className="phone-input-custom"
              />
            </div>
          </div>
        </section>

        {/* Live Preview */}
        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">Preview</div>
          
          <div className="flex items-start gap-3 mb-3">
            {avatarFile ? (
              <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <User size={20} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[var(--color-ink)] truncate">
                {formData.full_name || "New Client"}
              </div>
              <div className="text-[11px] text-[var(--color-ink-muted)] truncate">
                {formData.phone || "No phone"}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[var(--color-surface-border)] text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Email</span>
              <span className="font-semibold text-[var(--color-ink)] truncate max-w-[120px]">
                {formData.email || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">ID Number</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {formData.id_number || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Documents</span>
              <span className="font-semibold text-[var(--color-ink)]">{docCount}/3</span>
            </div>
          </div>
        </div>

        {/* CTA Card - Dynamic text based on mode */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {mode === "edit" ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                {mode === "edit" ? "Update Client" : "Add Client"}
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-[var(--color-ink-muted)] mt-2">
            {mode === "edit" 
              ? "Changes will be saved instantly" 
              : "Client will be created and ready for bookings"}
          </p>
        </div>

      </aside>
    </form>
  );
}
