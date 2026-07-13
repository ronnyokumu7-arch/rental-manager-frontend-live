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
import { HealthScoreCard } from '@/components/tenants/health/HealthScoreCard';
import { ActivityPulseWidget } from '@/components/tenants/health/ActivityPulseWidget';
import { FleetUtilizationGauge } from '@/components/tenants/health/FleetUtilizationGauge';
import { RevenueVelocitySparkline } from '@/components/tenants/health/RevenueVelocitySparkline';
import { PaymentReliabilityStreak } from '@/components/tenants/health/PaymentReliabilityStreak';
import { SupportTicketTrend } from '@/components/tenants/health/SupportTicketTrend';
import { useAgencyHealth } from '@/hooks/useAgencyHealth';

export default function AgencyProfilePage() {
  const params = useParams();
  const agencyId = params.id as string;

  const { tenant, isLoading, error, activeTab, setActiveTab, refetch } = useTenantProfile(agencyId);
  const { data: healthData, isLoading: isHealthLoading } = useAgencyHealth(agencyId);
  
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

  // ✅ UNIFIED GRID SYSTEM: Used for both tabs for perfect consistency
  const UnifiedGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {children}
    </div>
  );

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
          <UnifiedGrid>
            {/* Left Column: Wider (7 cols) - Business Identity */}
            <div className="lg:col-span-7">
              <BusinessIdentitySection tenant={tenant} onUpdated={refetch} />
            </div>
            {/* Right Column: Narrower (5 cols) - Admin Snapshot */}
            <div className="lg:col-span-5">
              <AdminSnapshotSection 
                tenant={tenant} 
                onChangeEmailClick={() => setIsChangeEmailModalOpen(true)} 
              />
            </div>
          </UnifiedGrid>
        )}
        
        {activeTab === 'subscription' && (
          <UnifiedGrid>
            {/* ✅ Left Column: Narrower (5 cols) - Subscription Sidebar */}
            <div className="lg:col-span-5 sticky top-24">
              <SubscriptionStatusCard tenant={tenant} onUpdated={refetch} />
            </div>
            {/* ✅ Right Column: Wider (7 cols) - Payment Gateways */}
            <div className="lg:col-span-7">
              <PaymentGatewaysSection tenantId={tenant.id} onUpdated={refetch} />
            </div>
          </UnifiedGrid>
        )}
        
        {activeTab === 'health' && (
          <UnifiedGrid>
            {/* ✅ Left Column: Sticky Anchor (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 flex flex-col gap-6">
              {isHealthLoading ? (
                <>
                  <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] h-[400px] animate-pulse" />
                  <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] h-[280px] animate-pulse" />
                </>
              ) : healthData ? (
                <>
                  <HealthScoreCard score={healthData.score} />
                  <SupportTicketTrend data={healthData.supportTickets} />
                </>
              ) : null}
            </div>
            
            {/* ✅ Right Column: Metrics Grid (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {isHealthLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] h-[280px] animate-pulse" />
                ))
              ) : healthData ? (
                <>
                  <ActivityPulseWidget data={healthData.activity} />
                  <FleetUtilizationGauge data={healthData.utilization} />
                  <RevenueVelocitySparkline data={healthData.revenueVelocity} />
                  <PaymentReliabilityStreak data={healthData.paymentReliability} />
                </>
              ) : null}
            </div>
          </UnifiedGrid>
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
