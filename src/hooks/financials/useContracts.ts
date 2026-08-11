// src/hooks/financials/useContracts.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { contractsApi } from "@/lib/api/contracts";
import type { Contract, ContractStatus } from "@/lib/types";
import { confirmAction } from "@/lib/utils/confirmAction";

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Backend enforces page_size <= 200 (le=200).
      // 200 covers client-side search/filter/pagination for current tenant volumes.
      const params = {
        page_size: 200,
        ...(statusFilter !== "all" && { contract_status: statusFilter })
      };
      
      const data = await contractsApi.list(params);
      
      // ✅ DATA NORMALIZATION: Heal historical data inconsistencies
      const normalizedData = (data || []).map((c: any) => { 
        if (c.client_signed_at || c.signed_at) {
          return { ...c, status: "signed" as ContractStatus };
        }
        return c;
      });
      
      setContracts(normalizedData);
    } catch {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Client-side filtering
  const filteredContracts = useMemo(() => {
    let result = contracts;
    
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.contract_number.toLowerCase().includes(q) ||
          (c.booking_number && c.booking_number.toLowerCase().includes(q)) ||
          c.booking_id?.toString().includes(q) ||
          ('booking_ref' in c && String((c as any).booking_ref).toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [contracts, search, statusFilter]);

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, statusFilter]);

  // Actions
  const handleDownload = async (id: number) => {
    try {
      toast.loading("Generating PDF...");
      const res = await contractsApi.downloadPdf(id);
      
      // ✅ CRITICAL: Axios wraps backend errors (like 500s) in Blobs when responseType is "blob".
      // If the backend crashed, res.data is a JSON error, not a PDF.
      if (res.data.type === "application/json") {
        const text = await res.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.detail || "Backend failed to generate PDF");
      }

      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Contract-${id}.pdf`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch (error: any) {
      toast.dismiss();
      
      // ✅ Decode the backend's real error message from the Blob (if present)
      let message = "Failed to download PDF";
      const blob = error?.response?.data;
      if (blob instanceof Blob) {
        try {
          const parsed = JSON.parse(await blob.text());
          message = parsed.detail || message;
        } catch {
          /* keep default message */
        }
      } else if (error?.message) {
        message = error.message;
      }
      
      toast.error(message);
    }
  };

  const handleCopyLink = async (id: number) => {
    try {
      const res = await contractsApi.generateShareLink(id);
      
      // ✅ BULLETPROOF URL CONSTRUCTION (ENVIRONMENT AGNOSTIC):
      // We completely ignore the backend's `share_url` for the clipboard.
      // Why? Because the backend's FRONTEND_URL is set to localhost for your 
      // local testing, which breaks the link when copied from the live Vercel site.
      // `window.location.origin` is the absolute truth: it dynamically resolves 
      // to localhost locally, and your Vercel domain in production.
      const fullUrl = `${window.location.origin}/contracts/view/${res.share_token}`;

      await navigator.clipboard.writeText(fullUrl); 
      
      setContracts(prev => prev.map(c => {
        if (c.id === id) {
          const newStatus = c.status === "draft" ? "sent" : c.status;
          return { ...c, status: newStatus, share_token: res.share_token };
        }
        return c;
      }));
      
      toast.success("Contract share link copied to clipboard!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to generate link");
    }
  };

  const handleSend = async (id: number) => {
    try {
      toast.loading("Sending to client...");
      await contractsApi.sendToClient(id);
      
      setContracts(prev => prev.map(c => 
        c.id === id ? { ...c, status: "sent" as ContractStatus } : c
      ));
      
      toast.dismiss();
      toast.success("Contract sent to client email successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || "Failed to send contract");
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirmAction("Are you sure you want to void this contract? This action cannot be undone.")) return;
    try {
      const updated = await contractsApi.void(id);
      setContracts(prev => prev.map(c => c.id === id ? updated : c));
      toast.success("Contract voided successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to void contract");
    }
  };

  const handleGenerate = async (bookingId: number) => {
    try {
      toast.loading("Generating contract...");
      const newContract = await contractsApi.regenerate(bookingId);
      
      setContracts(prev => {
        const filtered = prev.filter(c => c.booking_id !== bookingId);
        return [newContract, ...filtered];
      });
      
      toast.dismiss();
      toast.success("Contract generated successfully!");
      return true;
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || "Failed to generate contract");
      return false;
    }
  };

  return {
    contracts: paginatedContracts,
    loading,
    search, 
    setSearch,
    statusFilter, 
    setStatusFilter,
    currentPage, 
    setCurrentPage,
    totalPages,
    totalItems: filteredContracts.length,
    handleDownload,
    handleCopyLink,
    handleSend,
    handleVoid,
    handleGenerate,
    refetch: fetchContracts,
  };
}
