// src/components/tenants/TenantProfileTabs.tsx
import { Building2, CreditCard, Settings } from 'lucide-react';
import { type TenantProfileTab } from '@/hooks/useTenantProfile';

interface TenantProfileTabsProps {
  activeTab: TenantProfileTab;
  setActiveTab: (tab: TenantProfileTab) => void;
}

const tabs = [
  { id: 'profile' as TenantProfileTab, label: 'Agency Profile', icon: Building2 },
  { id: 'subscription' as TenantProfileTab, label: 'Subscription', icon: CreditCard },
  { id: 'settings' as TenantProfileTab, label: 'Settings', icon: Settings },
];

export function TenantProfileTabs({ activeTab, setActiveTab }: TenantProfileTabsProps) {
  return (
    // ✅ Removed sticky top-0 for now to ensure it sits flush under the header. 
    // Added matching padding (px-6 md:px-8) to align with the page layout.
    <div className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] px-6 md:px-8">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 text-sm font-medium border-b-2 transition-all duration-200
                ${isActive 
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-subtle)]'}
              `}
            >
              <Icon 
                className={`
                  -ml-0.5 mr-2 h-5 w-5 transition-colors
                  ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink-muted)]'}
                `} 
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
