// src/components/profile/DocumentUploadCard.tsx
"use client";

import { Upload, User, CreditCard, Car, CheckCircle2 } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

// ✅ STRICT TYPE: Perfectly matches the new clientsApi methods
type UploadType = "avatar" | "id_front" | "id_back" | "dl_front";

interface DocumentUploadCardProps {
  client: Client;
  onUpload: (type: UploadType, file: File) => void;
}

export default function DocumentUploadCard({ client, onUpload }: DocumentUploadCardProps) {
  const handleFileChange = (type: UploadType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(type, e.target.files[0]);
    }
  };

  const UploadButton = ({ 
    type, 
    label, 
    icon: Icon, 
    hasFile 
  }: { 
    type: UploadType; 
    label: string; 
    icon: React.ElementType; 
    hasFile: boolean; 
  }) => (
    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
      <input
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => handleFileChange(type, e)}
      />
      <div className={`p-3 rounded-full mb-2 ${
        hasFile 
          ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400"
      }`}>
        {hasFile ? <CheckCircle2 size={20} /> : <Icon size={20} />}
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
        {hasFile ? "Uploaded" : "Click to upload"}
      </span>
    </label>
  );

  return (
    <SectionCard title="Document Verification" icon={Upload}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UploadButton 
          type="avatar" 
          label="Avatar Photo" 
          icon={User} 
          hasFile={!!client.avatar_image} 
        />
        <UploadButton 
          type="id_front" 
          label="ID Front" 
          icon={CreditCard} 
          hasFile={!!client.id_image_front} 
        />
        <UploadButton 
          type="id_back" 
          label="ID Back" 
          icon={CreditCard} 
          hasFile={!!client.id_image_back} 
        />
        <UploadButton 
          type="dl_front" 
          label="DL Front" 
          icon={Car} 
          hasFile={!!client.dl_image_front} 
        />
      </div>
    </SectionCard>
  );
}
