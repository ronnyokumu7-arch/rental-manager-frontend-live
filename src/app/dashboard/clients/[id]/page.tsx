// src/app/dashboard/clients/[id]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import { useClientProfile } from "@/hooks/useClientProfile";

// Modular Profile Components
import PersonalInfoCard from "@/components/profile/PersonalInfoCard";
import AddressCard from "@/components/profile/AddressCard";
import DocumentUploadCard from "@/components/profile/DocumentUploadCard";
import ClientStatusCard from "@/components/profile/ClientStatusCard";
import ClientStatsCard from "@/components/profile/ClientStatsCard";
import FinancialOverviewCard from "@/components/profile/FinancialOverviewCard";

export default function ClientProfilePage() {
  const router = useRouter();
  
  // ✅ SIMPLIFIED: handleUploadDocument is now pulled directly from the hook
  const {
    client,
    invoices,
    contracts,
    stats,
    loading,
    handleUpdateClient,
    handleUploadDocument,
    handleStatusAction,
    handleFinancialAction,
  } = useClientProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900">Client not found</h2>
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <PageHeader
        title="Client Profile"
        subtitle="Manage client details, track invoices and contracts, and update verification documents."
        icon={Users}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clients", href: "/dashboard/clients" },
          { label: client.full_name },
        ]}
        actions={[
          {
            label: "Back to Clients",
            icon: ArrowLeft,
            variant: "secondary",
            onClick: () => router.push("/dashboard/clients"),
          },
        ]}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfoCard client={client} onSave={handleUpdateClient} />
          <FinancialOverviewCard
            invoices={invoices}
            contracts={contracts}
            onAction={handleFinancialAction}
          />
          <DocumentUploadCard client={client} onUpload={handleUploadDocument} />
        </div>

        {/* Right Column: Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* 1. Verification Container */}
          <ClientStatusCard
            client={client}
            onStatusAction={handleStatusAction}
          />
          {/* 2. Stats Container */}
          <ClientStatsCard stats={stats} />
          {/* 3. Address Container */}
          <AddressCard client={client} onSave={handleUpdateClient} />
        </div>
      </div>
    </div>
  );
}
