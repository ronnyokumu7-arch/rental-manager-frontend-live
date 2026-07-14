// src/components/profile/UserPersonalInfoCard.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Building2, Briefcase, 
  Pencil, Save, X, ShieldAlert, Camera 
} from "lucide-react";
import type { User as UserType } from "@/lib/types";

const ADMIN_TITLES = ["Director", "Manager", "HR"];
const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  Finance: ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

interface UserPersonalInfoCardProps {
  user: UserType;
  onSave: (data: Partial<UserType>) => void;
  isSelfView?: boolean;
}

export default function UserPersonalInfoCard({ 
  user, 
  onSave, 
  isSelfView = false 
}: UserPersonalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number || "",
    department: user.department || "",
    job_title: user.job_title || "",
  });

  // ✅ FIX: Only sync form state with props when NOT actively editing
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number || "",
        department: user.department || "",
        job_title: user.job_title || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    if (!formData.full_name.trim() || !formData.email.trim()) return;
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number || "",
      department: user.department || "",
      job_title: user.job_title || "",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user.full_name);
  const isSuperAdmin = user.role === "super_admin";

  // ✅ BRAND TOKENS: Consistent with Agency Health Dashboard
  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block";
  const valueClass = "text-sm font-medium text-[var(--color-ink)] truncate";
  const emptyClass = "text-sm text-[var(--color-ink-subtle)] italic truncate";
  
  const inputBase = "w-full bg-transparent text-sm font-medium text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:outline-none transition-colors";
  const fieldRow = "flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-[var(--color-surface-hover)] transition-all duration-200 group";

  return (
    // ✅ FIX: Replaced SectionCard with a standard div to prevent import/export mismatch errors
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      
      {/* ✅ UNIFIED IDENTITY HEADER: No Background, Thin Border Only */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 pb-5 border-b border-[var(--color-surface-border)]">
        
        {/* Avatar Anchor */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg ring-4 ring-[var(--color-surface)]">
            {initials}
          </div>
          {/* Subtle Upload Hint */}
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <Camera size={20} className="text-white" />
          </div>
        </div>

        {/* Identity Summary */}
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-0.5">Personal Information</h3>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Manage your identity, contact details, and organizational role.
          </p>
        </div>

        {/* Action Buttons */}
        {!isSelfView && (
          isEditing ? (
            <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-right-2 duration-200">
              <button
                onClick={handleSave}
                disabled={!formData.full_name.trim() || !formData.email.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={handleCancel}
                className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95"
            >
              <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
              Edit Details
            </button>
          )
        )}
      </div>

      {/* ✅ DENSE DATA GRID: Flush Alignment, No Wasted Space */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        
        {/* Full Name */}
        <div>
          <label className={labelClass}>Full Name</label>
          <div className={fieldRow}>
            <User size={16} className="text-[var(--color-ink-subtle)] shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`${inputBase} ${!formData.full_name.trim() ? 'text-rose-500' : ''}`}
                placeholder="Enter full name"
                autoFocus
              />
            ) : (
              <span className={valueClass}>{user.full_name}</span>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className={labelClass}>Email Address</label>
          <div className={fieldRow}>
            <Mail size={16} className="text-[var(--color-ink-subtle)] shrink-0" />
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${inputBase} ${!formData.email.trim() ? 'text-rose-500' : ''}`}
                placeholder="name@company.com"
              />
            ) : (
              <span className={`${valueClass} font-mono text-xs opacity-90`}>{user.email}</span>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className={labelClass}>Phone Number</label>
          <div className={fieldRow}>
            <Phone size={16} className="text-[var(--color-ink-subtle)] shrink-0" />
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className={inputBase}
                placeholder="+1 (555) 000-0000"
              />
            ) : (
              <span className={user.phone_number ? valueClass : emptyClass}>
                {user.phone_number || "Not provided"}
              </span>
            )}
          </div>
        </div>

        {/* Department */}
        <div>
          <label className={labelClass}>Department</label>
          <div className={fieldRow}>
            <Building2 size={16} className="text-[var(--color-ink-subtle)] shrink-0" />
            {isEditing ? (
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value, job_title: "" })}
                className={`${inputBase} cursor-pointer`}
                disabled={isSuperAdmin}
              >
                <option value="">Select Department...</option>
                {user.role === "tenant_admin" ? (
                  <option value="Executive">Executive</option>
                ) : (
                  Object.keys(STAFF_DEPARTMENTS).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))
                )}
              </select>
            ) : (
              <span className={user.department ? valueClass : emptyClass}>
                {user.department || "Not assigned"}
              </span>
            )}
          </div>
        </div>

        {/* Job Title - Spans Full Width on Mobile, Half on Desktop */}
        <div className="md:col-span-2">
          <label className={labelClass}>Job Title / Position</label>
          <div className={fieldRow}>
            <Briefcase size={16} className="text-[var(--color-ink-subtle)] shrink-0" />
            {isEditing ? (
              <div className="w-full flex items-center gap-2">
                <select
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className={`${inputBase} flex-1 cursor-pointer`}
                  disabled={isSuperAdmin || !formData.department}
                >
                  <option value="">Select Title...</option>
                  {user.role === "tenant_admin" ? (
                    ADMIN_TITLES.map((t) => <option key={t} value={t}>{t}</option>)
                  ) : (
                    formData.department && STAFF_DEPARTMENTS[formData.department]?.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))
                  )}
                </select>
                {isSuperAdmin && (
                  <ShieldAlert size={14} className="text-amber-500 shrink-0" title="System role cannot be changed" />
                )}
              </div>
            ) : (
              <span className={`font-semibold ${user.job_title ? 'text-[var(--color-primary)]' : emptyClass}`}>
                {user.job_title || user.department || "Unassigned"}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
