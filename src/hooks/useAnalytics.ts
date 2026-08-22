// src/hooks/useAnalytics.ts
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useAnalytics() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Track page view
    fetch('/api/v1/analytics/track-pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error); // Silent fail
  }, [pathname]);
}
