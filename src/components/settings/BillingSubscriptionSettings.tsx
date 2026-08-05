"use client";

import { useRef, useState } from "react";
import {
  Building2, Upload, Globe, Mail, Phone, MapPin, Hash, Shield,
  FileText, User, Save, Loader2, CheckCircle2, Edit3, X, AlertCircle,
  BadgeCheck, Image as ImageIcon,
} from "lucide-react";
import { useBusinessSettings } from "@/hooks/settings/useBusinessSettings";

export default function BusinessProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const hadInvalid = useRef(false);
  const s = useBusinessSettings();

  const toggleEdit = () => {
    if (isEditing) s.discardChanges();
    setIsEditing((p) => !p);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    hadInvalid.current = false;
    const onInvalid = () => { hadInvalid.current = true; };

    if (s.isAdminDirty) await s.handleSubmitAdmin(s.onSubmitAdmin, onInvalid)(e);
    if (s.isDirty || s.isLogoDirty) await s.handleSubmit(s.onSubmit, onInvalid)(e);

    if (!hadInvalid.current) setIsEditing(false);
  };

  if (s.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const isAnyDirty = s.isDirty || s.isAdminDirty || s.isLogoDirty;
  const isAnySaving = s.isSaving || s.isSavingAdmin;

  // Reusable Edit/Cancel Button for section headers
  const SectionEditButton = ({ title }: { title: string }) => (
    <button 
      type="button" 
      onClick={toggleEdit} 
      className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
      title={isEditing ? "Cancel Editing" : `Edit ${title}`}
    >
      {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 🚨 DEBUG BANNER - REMOVE THIS DIV ONCE CONFIRMED */}
      <div className="bg-rose-500 text-white p-4 text-center font-bold rounded-xl shadow-lg">
        ✅ NEW LAYOUT ACTIVE: Duplicate header removed. Pencil icons added to sections.
      </div>

      <form onSubmit={handleSaveAll}>
        <div className="space-y-6">
          
          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 1: LOGO + COMPANY IDENTITY
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Logo Preview */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-[var(--color-surface-border)] flex items-center justify-center bg-gradient-to-br from-[var(--color-surface-hover)] to-[var(--color-surface)] overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    {s.logoPreview ? (
                      <img src={s.logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[var(--color-ink-subtle)]">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-xs font-medium">No Logo</span>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer rounded-2xl transition-opacity">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-semibold">Change Logo</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={s.handleLogoChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
                
                {isEditing && (
                  <p className="text-[11px] text-[var(--color-ink-subtle)] mt-3 text-center">
                    PNG, JPG, or SVG. Max 2MB.
                  </p>
                )}
              </div>

              {/* Company Identity Info */}
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-surface-border)]">
                  <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-ink)]">Company Identity</h3>
                    <p className="text-xs text-[var(--color-ink-muted)]">Your brand and primary contact information</p>
                  </div>
                  {/* ✏️ Pencil Icon */}
                  <SectionEditButton title="Company Identity" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Company Name" icon={Building2} editing={isEditing}
                    display={s.businessData.company_name} register={s.register("company_name")}
                    error={s.errors.company_name} placeholder="e.g. Nairobi Car Rentals" />
                  <Field label="Email Address" icon={Mail} editing={isEditing} type="email"
                    display={s.businessData.email} register={s.register("email")}
                    error={s.errors.email} placeholder="contact@agency.com" />
                  <Field label="Phone Number" icon={Phone} editing={isEditing} type="tel"
                    display={s.businessData.phone} register={s.register("phone")}
                    error={s.errors.phone} placeholder="+254 700 000 000" />
                  <Field label="Website" icon={Globe} editing={isEditing} type="url" link
                    display={s.businessData.website} register={s.register("website")}
                    error={s.errors.website} placeholder="https://www.agency.com" />
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: ADMINISTRATOR
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="card">
            {isEditing ? (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-surface-border)]">
                  <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-ink)]">Administrator Account</h3>
                    <p className="text-xs text-[var(--color-ink-muted)]">Primary admin credentials</p>
                  </div>
                  <SectionEditButton title="Administrator" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Full Name" icon={User} editing={isEditing}
                    display={s.adminData.full_name} register={s.registerAdmin("full_name")}
                    error={s.adminErrors.full_name} placeholder="Full name" />
                  <Field label="Email Address" icon={Mail} editing={isEditing} type="email"
                    display={s.adminData.email} register={s.registerAdmin("email")}
                    error={s.adminErrors.email} placeholder="admin@agency.com" />
                  <Field label="Phone Number" icon={Phone} editing={isEditing} type="tel"
                    display={s.adminData.phone_number} register={s.registerAdmin("phone_number")}
                    error={s.adminErrors.phone_number} placeholder="+254 700 000 000" />
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-transparent pointer-events-none" />
                
                {/* ✏️ Pencil Icon for View Mode */}
                <button 
                  type="button" 
                  onClick={toggleEdit} 
                  className="absolute top-0 right-0 p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors z-10"
                  title="Edit Administrator"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <div className="relative flex items-start gap-6 pt-2">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/25">
                      <User className="w-10 h-10" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-[var(--color-ink)]">
                            {s.adminData.full_name || "Administrator"}
                          </h3>
                          <BadgeCheck className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[11px] font-bold uppercase tracking-wide">
                            <Shield className="w-3 h-3" />
                            Owner
                          </span>
                          {s.adminUser && (
                            <span className="text-[11px] text-[var(--color-ink-subtle)] font-mono">
                              ID #{s.adminUser.id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
                        <Mail className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-0.5">Email</p>
                          <p className="text-sm text-[var(--color-ink)] truncate">
                            {s.adminData.email || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
                        <Phone className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-0.5">Phone</p>
                          <p className="text-sm text-[var(--color-ink)] truncate">
                            {s.adminData.phone_number || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3: BUSINESS DETAILS
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-surface-border)]">
              <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Business Details</h3>
                <p className="text-xs text-[var(--color-ink-muted)]">Location and compliance information</p>
              </div>
              {/* ✏️ Pencil Icon */}
              <SectionEditButton title="Business Details" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Business Location" icon={MapPin} editing={isEditing}
                display={s.businessData.business_location} register={s.register("business_location")}
                error={s.errors.business_location} placeholder="e.g. Westlands, Nairobi" />
              <Field label="KRA PIN / Tax ID" icon={Hash} editing={isEditing} mono
                display={s.businessData.kra_pin} register={s.register("kra_pin")}
                error={s.errors.kra_pin} placeholder="A000000000Z" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 4: BUSINESS POLICY
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-surface-border)]">
              <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Business Policy</h3>
                <p className="text-xs text-[var(--color-ink-muted)]">Default terms for contracts and receipts</p>
              </div>
              {/* ✏️ Pencil Icon */}
              <SectionEditButton title="Business Policy" />
            </div>

            {isEditing ? (
              <div>
                <span className="label">Terms & Note Footer</span>
                <textarea
                  {...s.register("footer_text")}
                  rows={4}
                  className="input resize-y min-h-[120px]"
                  placeholder="e.g. Vehicles must be returned with full tank..."
                />
                {s.errors.footer_text && (
                  <p className="text-xs text-[var(--color-danger-text)] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {s.errors.footer_text.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] text-sm text-[var(--color-ink-muted)] leading-relaxed whitespace-pre-wrap">
                {s.businessData.footer_text || (
                  <span className="italic text-[var(--color-ink-subtle)]">No footer text configured.</span>
                )}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SAVE BAR
          ═══════════════════════════════════════════════════════════════════ */}
          {isEditing && (
            <div className="sticky bottom-4 z-10">
              <div className="card bg-[var(--color-surface)] shadow-lg border-[var(--color-primary)]/20">
                <button
                  type="submit"
                  disabled={!isAnyDirty || isAnySaving}
                  className="btn btn-primary w-full py-3.5"
                >
                  {isAnySaving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                  ) : isAnyDirty ? (
                    <><Save className="w-5 h-5" /> Save All Changes</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> All Changes Saved</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Field Component ─────────────────────────────────────────────────────────
function Field({
  label, icon: Icon, editing, display, register, error,
  type = "text", placeholder = "", mono = false, link = false, className = "",
}: {
  label: string;
  icon: any;
  editing: boolean;
  display: string;
  register: any;
  error?: any;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  link?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {editing ? (
        <>
          <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-subtle)]" />
            <input type={type} placeholder={placeholder} className="input pl-10" {...register} />
          </div>
          {error && (
            <p className="text-xs text-[var(--color-danger-text)] mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error.message}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] min-h-[46px]">
          <Icon className="w-4 h-4 text-[var(--color-ink-subtle)] shrink-0" />
          {display ? (
            link ? (
              <a
                href={display.startsWith("http") ? display : `https://${display}`}
                target="_blank" rel="noreferrer"
                className="text-sm text-[var(--color-primary)] font-medium hover:underline truncate"
              >
                {display}
              </a>
            ) : (
              <span className={`text-sm text-[var(--color-ink)] truncate ${mono ? "font-mono text-xs" : ""}`}>
                {display}
              </span>
            )
          ) : (
            <span className="text-sm italic text-[var(--color-ink-subtle)]">Not set</span>
          )}
        </div>
      )}
    </div>
  );
}
