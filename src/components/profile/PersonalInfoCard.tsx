// src/components/profile/PersonalInfoCard.tsx
"use client";

import { useState } from "react";
// ✅ FIXED: Replaced IdCard with CreditCard, and Edit2 with Pencil
import { User, Mail, Phone, CreditCard, Pencil, Save, X } from "lucide-react";
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
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Edit client details
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">ID Number</label>
            <input
              type="text"
              value={formData.id_number}
              onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <User size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Client details and contact information
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {/* ✅ FIXED: Changed Edit2 to Pencil */}
          <Pencil size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <User size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Full Name</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{client.full_name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Email Address</p>
            <p className="text-sm text-slate-900 dark:text-slate-100">{client.email || "Not provided"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Phone Number</p>
            <p className="text-sm text-slate-900 dark:text-slate-100">{client.phone}</p>
          </div>
        </div>
        {client.id_number && (
          <div className="flex items-start gap-3">
            {/* ✅ FIXED: Changed IdCard to CreditCard */}
            <CreditCard size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">ID Number</p>
              <p className="text-sm text-slate-900 dark:text-slate-100">{client.id_number}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
