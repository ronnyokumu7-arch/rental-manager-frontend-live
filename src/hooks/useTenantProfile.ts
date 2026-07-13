// src/hooks/useTenantProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { tenantsApi } from '@/lib/api/tenants';
import type { Tenant } from '@/lib/types';

// Define the exact tabs we support for strict typing
export type TenantProfileTab = 'profile' | 'subscription' | 'health';

export interface UseTenantProfileReturn {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  activeTab: TenantProfileTab;
  setActiveTab: (tab: TenantProfileTab) => void;
  refetch: () => Promise<void>;
}

/**
 * Core data-fetching hook for the Super Admin Tenant Profile.
 * Handles fetching the tenant, loading/error states, and active tab tracking.
 */
export function useTenantProfile(tenantId: number | string): UseTenantProfileReturn {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TenantProfileTab>('profile');

  const fetchTenant = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetches the full tenant object including the nested 'profile' and admin snapshot
      const data = await tenantsApi.getById(tenantId);
      setTenant(data);
    } catch (err: any) {
      console.error('Failed to fetch tenant:', err);
      // Extract FastAPI error detail if available
      const errorMessage = err?.response?.data?.detail || 'Failed to load tenant profile.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Fetch on mount or when tenantId changes
  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  return {
    tenant,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refetch: fetchTenant, // Expose this so child components can trigger a refresh after updates
  };
}
