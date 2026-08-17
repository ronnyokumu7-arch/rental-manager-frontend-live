// src/app/super-admin/agencies/page.tsx
"use client";

import { useState } from "react";
import { useTenantsList } from "@/hooks/tenants/useTenantsList";
import { TenantsTable } from "@/components/tenants/TenantsTable";
import TenantSubscriptionVerification from "@/components/admin/TenantSubscriptionVerification";
import CommissionPaymentVerification from "@/components/admin/CommissionPaymentVerification";
import { Building2, Wallet, ShieldCheck } from "lucide-react";

type HubTab = "directory" | "subscriptions" | "commission";

const TABS: { id: HubTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "directory", label: "Directory", icon: Building2, color: "text-blue-500" },
  { id: "subscriptions", label: "Subscriptions", icon: ShieldCheck, color: "text-amber-500" },
  { id: "commission", label: "Commission", icon: Wallet, color: "text-emerald-500" },
];

export default function SuperAdminAgenciesPage() {
  const listProps = useTenantsList();
  const [activeTab, setActiveTab] = useState<HubTab>("directory");

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* ✅ HEADER */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-surface-border)] px-6 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Revenue Operations</h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          Manage tenant directory, subscription approvals, and commission verifications
        </p>
      </header>

      {/* ✅ TABS */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-surface-border)] px-6 md:px-8">
        <nav className="flex gap-1" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors
                  ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}
                `}
              >
                <Icon size={16} className={isActive ? tab.color : ""} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ✅ MAIN CONTENT */}
      <main className="px-6 md:px-8 py-8 space-y-6">
        {activeTab === "directory" && <TenantsTable {...listProps} />}
        {activeTab === "subscriptions" && <TenantSubscriptionVerification />}
        {activeTab === "commission" && <CommissionPaymentVerification />}
      </main>
    </div>
  );
}
