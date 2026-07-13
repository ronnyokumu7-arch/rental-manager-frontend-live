// src/components/profile/AddressCard.tsx
"use client";

import { useState } from "react";
import { MapPin, Home, Briefcase, Pencil, Save, X } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

interface AddressCardProps {
  client: Client;
  onSave: (data: Partial<Client>) => void;
}

export default function AddressCard({ client, onSave }: AddressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"residential" | "work">("residential");
  const [formData, setFormData] = useState({
    residential_address: client.residential_address || "",
    work_address: client.work_address || "",
  });

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const currentAddress = activeTab === "residential" ? formData.residential_address : formData.work_address;
  const Icon = activeTab === "residential" ? Home : Briefcase;

  // ✅ BRAND TOKENS: Consistent with all profile components
  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2 block";
  
  return (
    <SectionCard className="!p-0 overflow-hidden">
      
      {/* Unified Header with Integrated Tabs */}
      <div className="p-6 pb-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex flex-col gap-4">
          {/* Top Row: Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
              <MapPin size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">Address & Location</h3>
              <p className="text-[11px] text-[var(--color-ink-muted)]">Residential and workplace details</p>
            </div>
          </div>

          {/* Bottom Row: Toggle Switch (Full Width on Mobile) */}
          <div className="flex items-center">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("residential")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "residential" 
                    ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-surface-border)]" 
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/50"
                }`}
              >
                <Home size={12} /> Residential
              </button>
              <button
                onClick={() => setActiveTab("work")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "work" 
                    ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-surface-border)]" 
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/50"
                }`}
              >
                <Briefcase size={12} /> Work
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Flush Alignment */}
      <div className="p-6">
        <label className={labelClass}>
          {activeTab === "residential" ? "Home / Hotel Address" : "Work Address"}
        </label>

        {isEditing ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <textarea
              value={currentAddress}
              onChange={(e) => setFormData({ ...formData, [`${activeTab}_address`]: e.target.value })}
              className="w-full p-3 text-sm border border-[var(--color-surface-border)] rounded-xl bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none h-24 resize-none transition-all"
              placeholder={`Enter ${activeTab} address...`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
              <button 
                onClick={handleSave} 
                className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
                title="Save Changes"
              >
                <Save size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative p-4 rounded-xl border border-transparent hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border)] transition-all duration-200 min-h-[56px] flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0 pr-8">
              <Icon size={16} className="text-[var(--color-ink-subtle)] mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-[var(--color-ink)] leading-snug break-words">
                {currentAddress || <span className="text-[var(--color-ink-subtle)] italic">No address provided</span>}
              </p>
            </div>
            
            {/* Edit Button - Appears on Hover */}
            <button
              onClick={() => setIsEditing(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[var(--color-ink-subtle)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
              title="Edit Address"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
