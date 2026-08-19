// src/components/contracts/public/hooks/usePublicContract.ts
"use client";

import { useState, useEffect } from "react";
import { contractsApi } from "@/lib/api/contracts";
import type { PublicContractView } from "@/lib/types";

interface UsePublicContractReturn {
  contract: PublicContractView | null;
  loading: boolean;
  error: string | null;
  signed: boolean;
  fetchContract: () => Promise<void>;
  signContract: (signature: string) => Promise<boolean>;
  downloadPdf: () => Promise<void>;
}

export function usePublicContract(token: string): UsePublicContractReturn {
  const [contract, setContract] = useState<PublicContractView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const data = await contractsApi.publicView(token);
      setContract(data);
      setSigned(data.signed_by_client);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Contract not found");
    } finally {
      setLoading(false);
    }
  };

  const signContract = async (signature: string) => {
    try {
      await contractsApi.publicSign(token, signature);
      setSigned(true);
      setContract((prev) => prev ? { ...prev, signed_by_client: true, status: "signed" } : null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to sign");
      return false;
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await contractsApi.publicDownloadPdf(token);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Contract-${contract?.contract_number}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download PDF");
    }
  };

  useEffect(() => {
    if (token) fetchContract();
  }, [token]);

  return { contract, loading, error, signed, fetchContract, signContract, downloadPdf };
}
