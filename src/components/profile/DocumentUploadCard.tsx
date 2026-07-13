// src/components/profile/DocumentUploadCard.tsx
"use client";

import { Upload, User, CreditCard, Car, CheckCircle2, AlertCircle } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

type UploadType = "avatar" | "id_front" | "id_back" | "dl_front";

interface DocumentUploadCardProps {
  client: Client;
  onUpload: (type: UploadType, file: File) => void;
}

export default function DocumentUploadCard({ 
  client, 
  onUpload 
}: DocumentUploadCardProps) {
  
  const handleFileChange = (type: UploadType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(type, e.target.files[0]);
      // Reset input value to allow re-uploading same file if needed
      e.target.value = '';
    }
  };

  // ✅ BRAND TOKENS: Semantic upload slot styling
  const getSlotStyle = (hasFile: boolean) => hasFile
    ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30 hover:bg-emerald-500/10"
    : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5";

  const getIconContainerStyle = (hasFile: boolean) => hasFile
    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
    : "bg-[var(--color-surface-hover)] text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] group-hover:border-[var(--color-primary)]/20";

  const UploadSlot = ({ 
    type, 
    label, 
    sublabel,
    icon: Icon, 
    hasFile 
  }: { 
    type: UploadType; 
    label: string; 
    sublabel: string;
    icon: React.ElementType; 
    hasFile: boolean; 
  }) => (
    <label className={`relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer group ${getSlotStyle(hasFile)}`}>
      <input
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => handleFileChange(type, e)}
      />
      
      {/* Status Indicator */}
      <div className={`p-3 rounded-xl mb-3 transition-all duration-200 ${getIconContainerStyle(hasFile)}`}>
        {hasFile ? <CheckCircle2 size={20} /> : <Icon size={20} />}
      </div>
      
      {/* Labels */}
      <span className={`text-xs font-bold text-center transition-colors ${
        hasFile ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-ink)] group-hover:text-[var(--color-primary)]'
      }`}>
        {label}
      </span>
      <span className={`text-[10px] text-center mt-1 transition-colors ${
        hasFile ? 'text-emerald-500/70' : 'text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink-subtle)]'
      }`}>
        {hasFile ? "Verified ✓" : sublabel}
      </span>

      {/* Hover Overlay Hint */}
      {!hasFile && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-[var(--color-surface)]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-[var(--color-surface-border)]">
            <span className="text-[10px] font-bold text-[var(--color-primary)] flex items-center gap-1">
              <Upload size={10} /> Choose File
            </span>
          </div>
        </div>
      )}
    </label>
  );

  return (
    <SectionCard className="!p-0 overflow-hidden">
      
      {/* Unified Header */}
      <div className="flex items-center gap-3 p-6 pb-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
          <Upload size={18} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Document Verification</h3>
          <p className="text-[11px] text-[var(--color-ink-muted)]">Identity proofs and compliance documents</p>
        </div>
      </div>

      {/* Dense Upload Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <UploadSlot 
          type="avatar" 
          label="Avatar Photo" 
          sublabel="Profile picture"
          icon={User} 
          hasFile={!!client.avatar_image} 
        />
        
        <UploadSlot 
          type="id_front" 
          label="ID Front" 
          sublabel="Government issued"
          icon={CreditCard} 
          hasFile={!!client.id_image_front} 
        />
        
        <UploadSlot 
          type="id_back" 
          label="ID Back" 
          sublabel="Reverse side"
          icon={CreditCard} 
          hasFile={!!client.id_image_back} 
        />
        
        <UploadSlot 
          type="dl_front" 
          label="DL Front" 
          sublabel="Driver's license"
          icon={Car} 
          hasFile={!!client.dl_image_front} 
        />

      </div>
    </SectionCard>
  );
}
