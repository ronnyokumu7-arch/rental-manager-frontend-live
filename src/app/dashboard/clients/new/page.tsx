// src/app/dashboard/clients/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { ClientCreate } from "@/lib/types";
import NewClientForm from "@/components/client/NewClientForm";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // File states for uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    residential_address: "",
    work_address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone) {
      toast.error("Full Name and Phone are required");
      return;
    }

    setLoading(true);
    try {
      const payload: ClientCreate = {
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone,
        id_number: formData.id_number || null,
        dl_number: formData.dl_number || null,
        dl_expiry: formData.dl_expiry || null,
        residential_address: formData.residential_address || null,
        work_address: formData.work_address || null,
        next_of_kin_name: formData.next_of_kin_name || null,
        next_of_kin_phone: formData.next_of_kin_phone || null,
      };

      const newClient = await clientsApi.create(payload);
      toast.success("Client profile created!");

      const uploadPromises = [];
      if (avatarFile) uploadPromises.push(clientsApi.uploadAvatar(newClient.id, avatarFile));
      if (idFrontFile) uploadPromises.push(clientsApi.uploadIdFront(newClient.id, idFrontFile));
      if (idBackFile) uploadPromises.push(clientsApi.uploadIdBack(newClient.id, idBackFile));
      if (dlFrontFile) uploadPromises.push(clientsApi.uploadDlFront(newClient.id, dlFrontFile));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast.success("Documents uploaded successfully!");
      }

      router.push("/dashboard/clients");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[var(--color-bg)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-surface-border)] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/dashboard/clients")} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            <ArrowLeft size={16} /> Back to Clients
          </button>
          <h1 className="text-base font-bold text-[var(--color-ink)]">New Client Onboarding</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Form */}
      <NewClientForm 
        loading={loading}
        formData={formData}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        idFrontFile={idFrontFile}
        setIdFrontFile={setIdFrontFile}
        idBackFile={idBackFile}
        setIdBackFile={setIdBackFile}
        dlFrontFile={dlFrontFile}
        setDlFrontFile={setDlFrontFile}
        updateField={updateField}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
