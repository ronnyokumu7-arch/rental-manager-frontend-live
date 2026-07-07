"use client";
import { Upload, User, CreditCard, Car, CheckCircle2 } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

interface DocumentUploadCardProps {
  client: Client;
  onUpload: (type: "id_front" | "id_back" | "dl_front", file: File) => void;
}

export default function DocumentUploadCard({ client, onUpload }: DocumentUploadCardProps) {
  const handleFileChange = (type: "avatar" | "id" | "dl", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(type, e.target.files[0]);
    }
  };

  const UploadButton = ({ label, icon: Icon, hasFile }: { label: string, icon: any, hasFile: boolean }) => (
    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
      <input type="file" className="hidden" onChange={(e) => handleFileChange(label.toLowerCase().includes("avatar") ? "avatar" : label.toLowerCase().includes("id") ? "id" : "dl", e)} />
      <div className={`p-3 rounded-full mb-2 ${hasFile ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"}`}>
        {hasFile ? <CheckCircle2 size={20} /> : <Icon size={20} />}
      </div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className="text-[10px] text-slate-400 mt-1">{hasFile ? "Uploaded" : "Click to upload"}</span>
    </label>
  );

  return (
    <SectionCard title="Document Verification" icon={Upload}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UploadButton label="Avatar Photo" icon={User} hasFile={!!client.avatar_image} />
        <UploadButton label="ID Front" icon={CreditCard} hasFile={!!client.id_image_front} />
        <UploadButton label="ID Back" icon={CreditCard} hasFile={!!client.id_image_back} />
        <UploadButton label="DL Front" icon={Car} hasFile={!!client.dl_image_front} />
      </div>
    </SectionCard>
  );
}
