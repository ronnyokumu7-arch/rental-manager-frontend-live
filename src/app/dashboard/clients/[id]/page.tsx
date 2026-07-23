"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, AlertCircle, Loader2 } from "lucide-react";

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
      <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-16 bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-surface-border)]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-48 bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-surface-border)]" />
            <div className="h-64 bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-surface-border)]" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-32 bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-surface-border)]" />
            <div className="h-32 bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-surface-border)]" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-6 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={20} />
          </div>
          <h2 className="text-sm font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1">
            Client Not Found
          </h2>
          <p className="text-xs text-[var(--color-ink-muted)] font-mono mb-4">
            The profile record could not be located or may have been deleted.
          </p>
          <button
            onClick={() => router.push("/dashboard/clients")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Return to Client Directory</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto">
      {/* Executive Header */}
      <PageHeader
        title={client.full_name}
        subtitle="Manage client details, track perfomance, and update compliance documents."
        icon={Users}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clients", href: "/dashboard/clients" },
          { label: client.full_name },
        ]}
        actions={[
          {
            label: "Back to Directory",
            icon: ArrowLeft,
            variant: "secondary",
            onClick: () => router.push("/dashboard/clients"),
          },
        ]}
      />

      {/* Asymmetric Executive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Main Workspace Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <PersonalInfoCard 
            client={client} 
            onSave={handleUpdateClient} 
          />
          
          <FinancialOverviewCard
            invoices={invoices}
            contracts={contracts}
            onAction={handleFinancialAction}
          />
          
          <DocumentUploadCard 
            client={client} 
            onUpload={handleUploadDocument} 
          />
        </div>

        {/* Sticky Utility Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-3.5 sticky top-4">
          {/* Status & Compliance */}
          <ClientStatusCard
            client={client}
            onStatusAction={handleStatusAction}
          />

          {/* Performance Overview */}
          <ClientStatsCard 
            stats={stats} 
          />

          {/* Address & Location Context */}
          <AddressCard 
            client={client} 
            onSave={handleUpdateClient} 
          />
        </div>

      </div>
    </div>
  );
}
