// src/components/profile/PersonalInfoCard.tsx
"use client";

import { useState } from "react";
import { User, Mail, Phone, CreditCard, Pencil, Save, X, Camera } from "lucide-react";
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

  // ✅ Generate initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "C";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(client.full_name);

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

  // ✅ EDIT MODE
  if (isEditing) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
              <User size={20} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">
                Personal Information
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Edit client details
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5">ID Number</label>
            <input
              type="text"
              value={formData.id_number}
              onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button 
              onClick={handleCancel} 
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-all shadow-sm shadow-[var(--color-primary)]/20 active:scale-95 flex items-center gap-2"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ VIEW MODE WITH AVATAR
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
            <User size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              Personal Information
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Client details and contact information
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <Pencil size={16} />
        </button>
      </div>

      {/* Avatar + Details Layout */}
      <div className="flex items-start gap-5 mb-6 pb-6 border-b border-[var(--color-surface-border)]">
        {/* Client Avatar */}
        <div className="relative shrink-0">
          {client.avatar_image ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-[var(--color-surface)] shadow-sm">
              <img 
                src={client.avatar_image} 
                alt={client.full_name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-xl font-bold text-white ring-4 ring-[var(--color-surface)] shadow-sm">
              {initials}
            </div>
          )}
          {/* Upload hint overlay (visual only) */}
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <Camera size={20} className="text-white" />
          </div>
        </div>

        {/* Client Name & Basic Info */}
        <div className="flex-1 min-w-0 pt-1">
          <h4 className="text-base font-bold text-[var(--color-ink)] mb-1 truncate">
            {client.full_name}
          </h4>
          <p className="text-sm text-[var(--color-ink-muted)] truncate">
            {client.email || "No email provided"}
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)] mt-0.5 font-mono">
            {client.phone}
          </p>
        </div>
      </div>

      {/* Detailed Information Grid */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)]">
          <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
            <Mail size={14} className="text-[var(--color-ink-subtle)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-0.5">Email Address</p>
            <p className="text-sm font-medium text-[var(--color-ink)] truncate">{client.email || "Not provided"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)]">
          <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
            <Phone size={14} className="text-[var(--color-ink-subtle)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-0.5">Phone Number</p>
            <p className="text-sm font-medium text-[var(--color-ink)] truncate">{client.phone || "Not provided"}</p>
          </div>
        </div>

        {client.id_number && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)]">
            <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
              <CreditCard size={14} className="text-[var(--color-ink-subtle)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-0.5">ID Number</p>
              <p className="text-sm font-medium text-[var(--color-ink)] font-mono truncate">{client.id_number}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
