// src/hooks/settings/useBillingSubscription.ts
import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { subscriptionClient, PaymentVerificationPayload } from "@/lib/api/subscriptionClient";
import { SubscriptionOut } from "@/lib/types";

export function useBillingSubscription() {
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionOut | null>(null);
  const [billingHistory, setBillingHistory] = useState<SubscriptionOut[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionMutating, setIsActionMutating] = useState<boolean>(false);
  
  // ✅ Track if we should poll for updates
  const [shouldPoll, setShouldPoll] = useState<boolean>(false);
  
  // ✅ FIX: Use ReturnType<typeof setInterval> for browser compatibility (not NodeJS.Timeout)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSubscriptions = useCallback(async (isBackgroundPoll = false) => {
    // Only show full-page loading spinner on the initial load, not during background polling
    if (!isBackgroundPoll) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const data = await subscriptionClient.getStatus();
      if (data && data.length > 0) {
        const latestSub = data[0];
        setActiveSubscription(latestSub);
        setBillingHistory(data.slice(1));
        
        // ✅ Enable polling ONLY if subscription is pending verification or trial
        const needsPolling = ['pending_verification', 'trial', 'starter_trial'].includes(latestSub.status);
        setShouldPoll(needsPolling);
      } else {
        setActiveSubscription(null);
        setBillingHistory([]);
        setShouldPoll(false); // No subscription, stop polling
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to fetch subscriptions.";
      setError(errMsg);
      setShouldPoll(false);
    } finally {
      if (!isBackgroundPoll) {
        setIsLoading(false);
      }
    }
  }, []);

  // ✅ Auto-polling effect
  useEffect(() => {
    if (shouldPoll) {
      pollIntervalRef.current = setInterval(() => {
        fetchSubscriptions(true); // Pass true to indicate background poll (no loading spinner)
      }, 10000); // 10 seconds
    }

    // Cleanup interval on unmount or when shouldPoll changes
    return () => {
      if (pollIntervalRef.current !== null) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [shouldPoll, fetchSubscriptions]);

  // Initial fetch on mount
  useEffect(() => {
    fetchSubscriptions(false);
  }, [fetchSubscriptions]);

  // ✅ REAL PAYMENT SUBMISSION
  const submitPaymentVerification = async (payload: PaymentVerificationPayload) => {
    setIsActionMutating(true);
    try {
      await subscriptionClient.verifyPayment(payload);
      toast.success("Payment submitted for review. Your plan will be activated upon verification.");
      
      // ✅ Immediately refresh to show pending status (foreground fetch)
      await fetchSubscriptions(false);
      
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Submission failed.";
      toast.error(errMsg);
      return false;
    } finally {
      setIsActionMutating(false);
    }
  };

  // ✅ TOGGLE AUTO-RENEW
  const toggleAutoRenew = async () => {
    if (!activeSubscription) return;
    setIsActionMutating(true);
    try {
      const updated = await subscriptionClient.updateAutoRenew(
        activeSubscription.id, 
        !activeSubscription.auto_renew
      );
      setActiveSubscription(updated);
      toast.success("Auto-renew setting updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setIsActionMutating(false);
    }
  };

  return {
    activeSubscription,
    billingHistory,
    isLoading,
    error,
    isActionMutating,
    submitPaymentVerification,
    toggleAutoRenew,
    refreshData: () => fetchSubscriptions(false), // Expose for manual refresh button
  };
}
