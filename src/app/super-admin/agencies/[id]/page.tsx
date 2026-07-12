// src/app/super-admin/agencies/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTenantProfile } from '@/hooks/useTenantProfile';
import { TenantProfileTabs } from '@/components/tenants/TenantProfileTabs';
import { BusinessIdentitySection } from '@/components/tenants/BusinessIdentitySection';
import { AdminSnapshotSection } from '@/components/tenants/AdminSnapshotSection';
import { SubscriptionStatusCard } from '@/components/tenants/SubscriptionStatusCard';
import { PaymentGatewaysSection } from '@/components/tenants/PaymentGatewaysSection';
import { ChangeAdminEmailModal } from '@/components/tenants/ChangeAdminEmailModal';

export default function AgencyProfilePage() {
  const params = useParams();
  const agencyId = params.id as string;

  const { tenant, isLoading, error, activeTab, setActiveTab, refetch } = useTenantProfile(agencyId);
  
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="p-6 text-center text-red-600">
        <p className="font-medium">Failed to load agency profile.</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* ✅ HEADER: Full width, consistent padding */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-surface-border)] px-6 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">{tenant.name}</h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">Agency ID: {tenant.id} • {tenant.admin_email}</p>
      </header>

      {/* ✅ TABS: Full width, matching padding */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-surface-border)]">
        <TenantProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* ✅ MAIN CONTENT: Same padding as header for perfect flush alignment */}
      <main className="px-6 md:px-8 py-8 space-y-6">
        
        {activeTab === 'profile' && (
          // ✅ NEW: 12-column grid with 7/5 split for better proportions
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <BusinessIdentitySection tenant={tenant} onUpdated={refetch} />
            </div>
            <div className="lg:col-span-5">
              <AdminSnapshotSection 
                tenant={tenant} 
                onChangeEmailClick={() => setIsChangeEmailModalOpen(true)} 
              />
            </div>
          </div>
        )}
        
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <SubscriptionStatusCard tenant={tenant} onUpdated={refetch} />
            <PaymentGatewaysSection tenantId={tenant.id} onUpdated={refetch} />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-dashed border-[var(--color-surface-border)] p-12 text-center text-[var(--color-ink-muted)]">
            Settings (Coming Next)
          </div>
        )}
      </main>

      {/* Modal */}
      {isChangeEmailModalOpen && tenant && (
        <ChangeAdminEmailModal
          tenantId={tenant.id}
          currentAdminEmail={tenant.admin_email || tenant.email}
          currentAdminPhone={tenant.admin_phone || tenant.phone_number}
          onClose={() => setIsChangeEmailModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
