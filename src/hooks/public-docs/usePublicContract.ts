// src/hooks/public-docs/usePublicContract.ts
import { useState, useEffect, useCallback } from 'react';
import { contractsApi } from '@/lib/api/contracts';
import type { PublicContractView } from '@/lib/types';
import toast from 'react-hot-toast';

export function usePublicContract(token: string) {
  const [contract, setContract] = useState<PublicContractView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // ✅ FIXED: Use 'publicView' instead of 'getByToken'
      const data = await contractsApi.publicView(token);
      setContract(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'This contract link is invalid or has expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSign = async (signatureData: string) => {
    if (!contract || contract.signed_by_client) return;
    setIsSigning(true);
    try {
      // ✅ FIXED: Use 'publicSign' instead of 'signByToken'
      await contractsApi.publicSign(token);
      
      // Update local state to reflect signed status
      setContract(prev => prev ? { 
        ...prev, 
        signed_by_client: true,
        status: 'signed' as any
      } : null);
      
      toast.success('Contract signed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to sign contract.');
    } finally {
      setIsSigning(false);
    }
  };

  useEffect(() => {
    if (token) fetchContract();
  }, [token, fetchContract]);

  return {
    contract,
    loading,
    error,
    isSigning,
    handleSign,
    refetch: fetchContract
  };
}
