"use client";
import { useState } from "react";
import {
  User, Mail, Phone, CreditCard, Car, Calendar,
  Pencil, Save, X, ShieldCheck, ShieldAlert, ShieldHelp
} from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

interface PersonalInfoCardProps {
  client: Client;
  onSave: (data: Partial<Client>) => void;
}

export default function PersonalInfoCard({ client, onSave }: PersonalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: client.full_name,
    email: client.email || "",
    phone: client.phone,
    id_number: client.id_number || "",
    dl_number: client.dl_number || "",
    dl_expiry: client.dl_expiry || "",
  });

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: client.full_name,
      email: client.email || "",
      phone: client.phone,
      id_number: client.id_number || "",
      dl_number: client.dl_number || "",
      dl_expiry: client.dl_expiry || "",
    });
    setIsEditing(false);
  };

  const getStatusConfig = () => {
    switch (client.status) {
      case "active":
        return { icon: <ShieldCheck size={14} className="text-emerald-500" />, label: "Verified", color: "text-emerald-600 dark:text-emerald-400" };
      case "suspended":
        return { icon: <ShieldAlert size={14} className="text-amber-500" />, label: "Suspended", color: "text-amber-600 dark:text-amber-400" };
      default:
        return { icon: <ShieldHelp size={14} className="text-blue-500" />, label: "Pending", color: "text-blue-600 dark:text-blue-400" };
    }
  };

  const statusConfig = getStatusConfig();

  const inputClass = "w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";
  const labelClass = "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wide";
  const valueClass = "text-sm font-medium text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2";

  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* ✅ Standardized Header: Identical padding and border for perfect alignment */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <User size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{client.full_name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {statusConfig.icon}
              <span className={`text-xs font-semibold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors">
              <Save size={14} /> Save
            </button>
            <button onClick={handleCancel} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all" title="Edit Personal Information">
            <Pencil size={16} />
          </button>
        )}
      </div>

      {/* ✅ Standardized Body Padding */}
      <div className="px-5 py-4">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><label className={labelClass}>Full Name</label><input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Phone Number</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>National ID</label><input type="text" value={formData.id_number} onChange={e => setFormData({...formData, id_number: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Driver's License</label><input type="text" value={formData.dl_number} onChange={e => setFormData({...formData, dl_number: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>DL Expiry Date</label><input type="date" value={formData.dl_expiry} onChange={e => setFormData({...formData, dl_expiry: e.target.value})} className={inputClass} /></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left Column */}
            <div className="flex-1 space-y-4">
              <div>
                <label className={labelClass}>Email Address</label>
                <p className={valueClass}><Mail size={14} className="text-slate-400 dark:text-slate-500" /> {client.email || "Not provided"}</p>
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <p className={valueClass}><Phone size={14} className="text-slate-400 dark:text-slate-500" /> {client.phone}</p>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700" />

            {/* Right Column */}
            <div className="flex-1 space-y-4">
              <div>
                <label className={labelClass}>National ID</label>
                <p className={valueClass}><CreditCard size={14} className="text-slate-400 dark:text-slate-500" /> {client.id_number || "Not provided"}</p>
              </div>
              <div>
                <label className={labelClass}>Driver's License</label>
                <p className={valueClass}><Car size={14} className="text-slate-400 dark:text-slate-500" /> {client.dl_number || "Not provided"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
