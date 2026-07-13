// src/hooks/useAgencyHealth.ts
import { useState, useEffect } from 'react';
import type { AgencyHealthData } from '@/lib/types';
import { tenantsApi } from '@/lib/api/tenants';

export function useAgencyHealth(tenantId: string | number) {
  const [data, setData] = useState<AgencyHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHealthData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ✅ LIVE API CALL - Connects to GET /api/v1/tenants/{tenantId}/health
        const healthData = await tenantsApi.getHealthMetrics(tenantId);
        
        if (!isMounted) return;
        setData(healthData);

      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load agency health data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHealthData();

    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  return { data, isLoading, error };
}
