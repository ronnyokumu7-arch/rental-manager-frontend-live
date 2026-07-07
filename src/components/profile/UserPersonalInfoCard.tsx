"use client";
import { useState } from "react";
import { User, Mail, Phone, Building2, Briefcase, Pencil, Save, X } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { User as UserType } from "@/lib/types";

// ✅ STRICT SYSTEM-ALIGNED TITLES (No fluff, only operational roles)
const ADMIN_TITLES = ["Director", "Manager", "HR"];

const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

interface UserPersonalInfoCardProps {
  user: UserType;
  onSave: (data: Partial<UserType>) => void;
  isSelfView?: boolean;
}

// ✅ Helper: Never shows backend enums like "tenant_staff"
const getRoleDisplay = (role: string, department?: string | null, jobTitle?: string | null) => {
  if (role === "super_admin") return "System Admin";
  if (jobTitle) return jobTitle;
  if (department) return department;
  return "Unassigned";
};

export default function UserPersonalInfoCard({ user, onSave, isSelfView = false }: UserPersonalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number || "",
    department: user.department || "",
    job_title: user.job_title || "",
  });

  const handleSave = () => {
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

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";
  const labelClass = "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wide mb-1";
  const valueClass = "text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2";

  const displayRole = getRoleDisplay(user.role, user.department, user.job_title);

  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <User size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Basic details and contact information</p>
          </div>
        </div>
        {!isSelfView && (
          isEditing ? (
            <div className="flex items-center gap-2">
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 transition-colors">
                <Save size={14} /> Save
              </button>
              <button onClick={handleCancel} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all">
              <Pencil size={16} />
            </button>
          )
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Identity & Contact */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              {isEditing ? (
                <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className={inputClass} />
              ) : (
                <p className={valueClass}><User size={14} className="text-slate-400" /> {user.full_name}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              {isEditing ? (
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
              ) : (
                <p className={valueClass}><Mail size={14} className="text-slate-400" /> {user.email}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              {isEditing ? (
                <input type="tel" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className={inputClass} />
              ) : (
                <p className={valueClass}><Phone size={14} className="text-slate-400" /> {user.phone_number || "Not provided"}</p>
              )}
            </div>
          </div>

          {/* Right Column: Organization & Role */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Department</label>
              {isEditing ? (
                <select 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value, job_title: ""})} // Reset job title when dept changes
                  className={inputClass}
                  disabled={user.role === 'super_admin'}
                >
                  <option value="">Select Department...</option>
                  {user.role === 'tenant_admin' ? (
                    <option value="Executive">Executive</option>
                  ) : (
                    Object.keys(STAFF_DEPARTMENTS).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))
                  )}
                </select>
              ) : (
                <p className={valueClass}><Building2 size={14} className="text-slate-400" /> {user.department || "Not assigned"}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Job Title / Position</label>
              {isEditing ? (
                <select 
                  value={formData.job_title} 
                  onChange={e => setFormData({...formData, job_title: e.target.value})} 
                  className={inputClass}
                  disabled={user.role === 'super_admin'}
                >
                  <option value="">Select Title...</option>
                  {user.role === 'tenant_admin' 
                    ? ADMIN_TITLES.map(t => <option key={t} value={t}>{t}</option>)
                    : formData.department && STAFF_DEPARTMENTS[formData.department]?.map(t => <option key={t} value={t}>{t}</option>)
                  }
                </select>
              ) : (
                <p className={valueClass}>
                  <Briefcase size={14} className="text-slate-400" /> 
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{displayRole}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
