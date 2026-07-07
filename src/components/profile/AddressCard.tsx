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

  return (
    <SectionCard 
      title="Address & Location" 
      icon={MapPin}
      className="!p-4" // Reduced overall padding for a more compact card
    >
      {/* Compact Toggle Switch */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 w-fit">
        <button
          onClick={() => setActiveTab("residential")}
          className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
            activeTab === "residential" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Home size={10} /> Residential
        </button>
        <button
          onClick={() => setActiveTab("work")}
          className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
            activeTab === "work" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Briefcase size={10} /> Work
        </button>
      </div>

      {/* Content Area */}
      <div className="relative group">
        <label className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wide">
          {activeTab === "residential" ? "Home / Hotel Address" : "Work Address"}
        </label>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={activeTab === "residential" ? formData.residential_address : formData.work_address}
              onChange={(e) => setFormData({ ...formData, [`${activeTab}_address`]: e.target.value })}
              className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none h-16 resize-none" // Reduced from h-24 to h-16
              placeholder={`Enter ${activeTab} address...`}
            />
            <div className="flex justify-end gap-1.5">
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X size={14} />
              </button>
              <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                <Save size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 min-h-[40px] flex items-start justify-between group"> {/* Reduced padding and min-height */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Icon size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
              <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 leading-snug break-words">
                {currentAddress || <span className="text-slate-400 italic">No address provided</span>}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
